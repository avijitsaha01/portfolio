export const prerender = false;

import type { APIRoute } from 'astro';
import { createSupabaseAdmin, createSupabaseServer, isSupabaseConfigured } from '../../../lib/supabase';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const POST: APIRoute = async ({ request, params, cookies }) => {
  const id = params.id ?? '';
  if (!UUID.test(id)) {
    return new Response(null, { status: 303, headers: { location: '/admin?error=invalid' } });
  }

  if (!isSupabaseConfigured) {
    return new Response(null, { status: 303, headers: { location: '/admin' } });
  }

  const session = createSupabaseServer(request, cookies);
  const {
    data: { user },
  } = (await session?.supabase.auth.getUser()) ?? { data: { user: null } };

  if (!user) {
    return new Response(null, { status: 303, headers: { location: '/admin/login' } });
  }

  const form = await request.formData();
  const action = String(form.get('action') ?? '');

  // Prefer the service role key, but fall back to the signed-in session so the
  // admin area works with RLS alone.
  const client = createSupabaseAdmin() ?? session?.supabase;

  if (!client) {
    return new Response(null, { status: 303, headers: { location: '/admin?error=config' } });
  }

  let error: { message: string } | null = null;

  if (action === 'delete') {
    ({ error } = await client.from('messages').delete().eq('id', id));
  } else if (action === 'read' || action === 'unread') {
    ({ error } = await client
      .from('messages')
      .update({ is_read: action === 'read' })
      .eq('id', id));
  }

  if (error) {
    console.error('[messages] action failed:', error.message);
    return new Response(null, { status: 303, headers: { location: '/admin?error=action' } });
  }

  return new Response(null, { status: 303, headers: { location: '/admin' } });
};
