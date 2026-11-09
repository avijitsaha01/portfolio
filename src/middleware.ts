import { defineMiddleware } from 'astro:middleware';
import { createSupabaseServer, isSupabaseConfigured } from './lib/supabase';

const ADMIN_PREFIX = '/admin';

export const onRequest = defineMiddleware(async (context, next) => {
  context.locals.user = null;
  context.locals.supabaseConfigured = isSupabaseConfigured;

  const path = context.url.pathname;
  if (!path.startsWith(ADMIN_PREFIX)) return next();

  // Without credentials the admin area renders setup instructions instead of
  // redirecting to a login form that could never work.
  if (!isSupabaseConfigured) return next();

  const client = createSupabaseServer(context.request, context.cookies);
  if (!client) return next();

  const {
    data: { user },
  } = await client.supabase.auth.getUser();

  context.locals.user = user ?? null;

  if (path === '/admin/login') {
    if (user) return context.redirect('/admin', 302);
    return next();
  }

  if (!user) {
    const nextPath = encodeURIComponent(path + context.url.search);
    return context.redirect(`/admin/login?next=${nextPath}`, 302);
  }

  return next();
});
