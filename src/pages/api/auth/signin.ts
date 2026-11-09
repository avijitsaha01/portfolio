export const prerender = false;

import type { APIRoute } from 'astro';
import { applyCookies, createSupabaseServer } from '../../../lib/supabase';

function back(request: Request, path: string, params: Record<string, string> = {}) {
  const target = new URL(path, request.url);
  for (const [key, value] of Object.entries(params)) target.searchParams.set(key, value);
  return target;
}

export const POST: APIRoute = async ({ request }) => {
  const form = await request.formData();
  const email = String(form.get('email') ?? '').trim();
  const password = String(form.get('password') ?? '');
  const next = String(form.get('next') ?? '/admin');
  const safeNext = next.startsWith('/admin') ? next : '/admin';

  if (!email || !password) {
    return new Response(null, {
      status: 303,
      headers: { location: back(request, '/admin/login', { error: 'missing' }).toString() },
    });
  }

  const client = createSupabaseServer(request);
  if (!client) {
    return new Response(null, {
      status: 303,
      headers: { location: back(request, '/admin/login', { error: 'config' }).toString() },
    });
  }

  const { error } = await client.supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return new Response(null, {
      status: 303,
      headers: { location: back(request, '/admin/login', { error: 'invalid' }).toString() },
    });
  }

  const headers = applyCookies(new Headers(), client.jar);
  headers.set('location', safeNext);
  return new Response(null, { status: 303, headers });
};
