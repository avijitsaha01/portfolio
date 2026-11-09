export const prerender = false;

import type { APIRoute } from 'astro';
import { applyCookies, createSupabaseServer } from '../../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  const client = createSupabaseServer(request);
  await client?.supabase.auth.signOut();

  const headers = applyCookies(new Headers(), client?.jar ?? []);
  headers.set('location', '/admin/login');
  return new Response(null, { status: 303, headers });
};
