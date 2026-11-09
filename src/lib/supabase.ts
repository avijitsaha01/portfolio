import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { createServerClient, parseCookieHeader, serializeCookieHeader } from '@supabase/ssr';
import type { AstroCookies } from 'astro';

/**
 * Read an environment value and treat the placeholders shipped in
 * `.env.example` as "not set". Without this a copied-but-unfilled `.env` would
 * look configured and fail with confusing network errors.
 */
function readEnv(value: string | undefined): string {
  const trimmed = (value ?? '').trim();
  if (!trimmed) return '';
  if (/^(your-|your_|example|changeme|replace-me)/i.test(trimmed)) return '';
  if (/your-project|your-anon|your-service/i.test(trimmed)) return '';
  if (trimmed === '...' || trimmed.endsWith('...')) return '';
  return trimmed;
}

const supabaseUrl = readEnv(import.meta.env.PUBLIC_SUPABASE_URL);
const supabaseAnonKey = readEnv(import.meta.env.PUBLIC_SUPABASE_ANON_KEY);
const rawServiceRoleKey = readEnv(import.meta.env.SUPABASE_SERVICE_ROLE_KEY);

/**
 * A publishable key (or the anon key pasted twice) can never act as a secret.
 * Treat those as "not set" so the app falls back to the anon key + RLS instead
 * of sending an invalid Bearer token and failing with 401s.
 */
const serviceRoleKey =
  rawServiceRoleKey &&
  rawServiceRoleKey !== supabaseAnonKey &&
  !rawServiceRoleKey.startsWith('sb_publishable_')
    ? rawServiceRoleKey
    : '';

/** True when the public Supabase credentials exist. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

/** True when server-side writes/reads can bypass RLS. */
export const hasServiceRole = Boolean(supabaseUrl && serviceRoleKey);

/** True when the database has not had `supabase/schema.sql` applied yet. */
export function isMissingSchemaError(message: string): boolean {
  return /schema cache|does not exist|relation .* not found|undefined table/i.test(message);
}

export type CookieToSet = {
  name: string;
  value: string;
  options?: Parameters<typeof serializeCookieHeader>[2];
};

/**
 * Privileged client. Only ever used inside API routes on the server.
 * Returns null when SUPABASE_SERVICE_ROLE_KEY is not configured.
 */
export function createSupabaseAdmin(): SupabaseClient | null {
  if (!supabaseUrl || !serviceRoleKey) return null;
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * Cookie-aware client used for auth (sign in / sign out / session refresh).
 * Cookies are written back through Astro's cookie API and, for endpoints that
 * build their own Response, collected in `jar`.
 */
export function createSupabaseServer(request: Request, cookies?: AstroCookies) {
  if (!isSupabaseConfigured) return null;

  const jar: CookieToSet[] = [];

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return parseCookieHeader(request.headers.get('Cookie') ?? '').map(({ name, value }) => ({
          name,
          value: value ?? '',
        }));
      },
      setAll(cookiesToSet) {
        for (const cookie of cookiesToSet) {
          jar.push(cookie);
          cookies?.set(cookie.name, cookie.value, {
            ...cookie.options,
            path: cookie.options?.path ?? '/',
          });
        }
      },
    },
  });

  return { supabase, jar };
}

/** Serialise collected Supabase cookies onto an outgoing Response. */
export function applyCookies(headers: Headers, jar: CookieToSet[]) {
  for (const { name, value, options } of jar) {
    headers.append('Set-Cookie', serializeCookieHeader(name, value, options ?? {}));
  }
  return headers;
}

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
};
