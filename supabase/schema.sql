# ---------------------------------------------------------------------------
# Supabase schema for the portfolio contact form and admin inbox.
# Run this once in the Supabase SQL editor (Dashboard -> SQL -> New query).
# ---------------------------------------------------------------------------

create extension if not exists pgcrypto;

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 120),
  email text not null check (char_length(email) <= 160),
  subject text check (subject is null or char_length(subject) <= 200),
  message text not null check (char_length(message) between 10 and 5000),
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

comment on table public.messages is 'Contact form submissions for the portfolio site.';

create index if not exists messages_created_at_idx on public.messages (created_at desc);
create index if not exists messages_unread_idx on public.messages (is_read) where is_read = false;

alter table public.messages enable row level security;

-- Anyone (the public contact form) may create a message.
drop policy if exists "anyone can send a message" on public.messages;
create policy "anyone can send a message"
  on public.messages
  for insert
  to anon, authenticated
  with check (true);

-- Only signed-in admins can read, update or delete messages.
drop policy if exists "admins can read messages" on public.messages;
create policy "admins can read messages"
  on public.messages
  for select
  to authenticated
  using (true);

drop policy if exists "admins can update messages" on public.messages;
create policy "admins can update messages"
  on public.messages
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "admins can delete messages" on public.messages;
create policy "admins can delete messages"
  on public.messages
  for delete
  to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- Create the admin account:
--   Dashboard -> Authentication -> Users -> Add user
-- Use "Create user" with "Auto Confirm User" enabled, then sign in at
-- /admin/login with that email and password.
-- Public sign-ups are not exposed anywhere in the app, so no one else can
-- create an account through the site.
-- ---------------------------------------------------------------------------
