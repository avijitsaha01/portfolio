export const prerender = false;

import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseAdmin, isMissingSchemaError } from '../../lib/supabase';

const LIMITS = {
  name: 120,
  email: 160,
  subject: 200,
  message: 5000,
} as const;

const MIN_MESSAGE = 10;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;

// Best-effort, per-instance throttle. Good enough to stop casual form spam.
const hits = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || entry.resetAt < now) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

function wantsHtml(request: Request): boolean {
  return (request.headers.get('accept') ?? '').includes('text/html');
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

function fail(request: Request, status: number, message: string) {
  if (wantsHtml(request)) {
    const target = new URL('/', request.url);
    target.searchParams.set('sent', 'error');
    target.searchParams.set('reason', message);
    target.hash = 'contact';
    return new Response(null, { status: 303, headers: { location: target.toString() } });
  }
  return json({ ok: false, error: message }, status);
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const contentType = request.headers.get('content-type') ?? '';

  let payload: Record<string, unknown>;
  try {
    if (contentType.includes('application/json')) {
      payload = (await request.json()) as Record<string, unknown>;
    } else {
      const form = await request.formData();
      payload = Object.fromEntries(form.entries());
    }
  } catch {
    return fail(request, 400, 'Could not read that submission.');
  }

  const value = (key: string) =>
    typeof payload[key] === 'string' ? (payload[key] as string).trim() : '';

  const name = value('name');
  const email = value('email');
  const subject = value('subject');
  const message = value('message');
  const honeypot = value('website');

  // Bots fill hidden fields. Pretend it worked so they do not retry.
  if (honeypot) return json({ ok: true });

  if (!name || name.length > LIMITS.name) {
    return fail(request, 400, `Please add a name under ${LIMITS.name} characters.`);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > LIMITS.email) {
    return fail(request, 400, 'Please use a valid email address.');
  }
  if (subject.length > LIMITS.subject) {
    return fail(request, 400, `Please keep the subject under ${LIMITS.subject} characters.`);
  }
  if (message.length < MIN_MESSAGE || message.length > LIMITS.message) {
    return fail(request, 400, `Messages need to be ${MIN_MESSAGE}–${LIMITS.message} characters.`);
  }

  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const ip = clientAddress || forwarded || 'unknown';
  if (isRateLimited(ip)) {
    return fail(request, 429, 'Too many messages from this network. Try again in a few minutes.');
  }

  const admin = createSupabaseAdmin();
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  const client = admin ?? (url && anonKey ? createClient(url, anonKey) : null);

  if (!client) {
    return fail(
      request,
      503,
      'Messaging is not connected yet. Add your Supabase keys and try again, or email me directly.',
    );
  }

  const { error } = await client.from('messages').insert({
    name,
    email,
    subject: subject || null,
    message,
  });

  if (error) {
    console.error('[contact] insert failed:', error.message);
    if (isMissingSchemaError(error.message)) {
      return fail(
        request,
        503,
        'Messaging is almost ready — the database table is missing. Run supabase/schema.sql, or email me directly.',
      );
    }
    return fail(request, 500, 'Something went wrong saving your message. Please email me instead.');
  }

  if (wantsHtml(request)) {
    const target = new URL('/', request.url);
    target.searchParams.set('sent', 'ok');
    target.hash = 'contact';
    return new Response(null, { status: 303, headers: { location: target.toString() } });
  }

  return json({ ok: true });
};
