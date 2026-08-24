-- ============================================================
-- LensAI SaaS (ShelfShot AI) — Supabase schema
-- Run this once in the Supabase SQL editor (Project > SQL Editor > New query)
--
-- Safe to re-run: every statement below is idempotent (uses IF EXISTS /
-- IF NOT EXISTS / ON CONFLICT / DROP...CREATE for policies), so running
-- this again after an earlier version of this file was already applied
-- will bring the database in line with the current version rather than
-- erroring out on "already exists".
-- ============================================================

-- 1) Profiles: one row per auth user, tracks plan + subscription state.
-- No Stripe customer/subscription id columns: billing runs through MEPS,
-- reconciled via the separate public.transactions table below.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  plan text not null default 'free',
  subscription_status text,
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

-- Drop legacy Stripe-era columns / constraint if this is re-run against a
-- database created from an earlier version of this file.
alter table public.profiles drop column if exists stripe_customer_id;
alter table public.profiles drop column if exists stripe_subscription_id;
alter table public.profiles drop constraint if exists profiles_plan_check;
alter table public.profiles add constraint profiles_plan_check
  check (plan in ('free','starter','economic','pro'));

alter table public.profiles enable row level security;

drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- SECURITY: there is intentionally NO client-side UPDATE policy on
-- profiles. `plan`, `subscription_status`, and `current_period_end`
-- control paid access, so only trusted server code may change them —
-- app/api/cancel-subscription and app/api/webhooks/meps both write via
-- createAdminClient() (service role key), which bypasses RLS entirely.
-- If a general "auth.uid() = id" update policy existed here, any signed-in
-- user could call supabase.from('profiles').update({ plan: 'pro' }) directly
-- from the browser console and grant themselves a paid plan for free —
-- RLS is the only real gate once the anon key + session are in the
-- browser, so this must NOT be re-added without column-level restrictions.
drop policy if exists "Users can update their own profile" on public.profiles;

-- Auto-create a profile row whenever a new auth user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2) Generations: one row per image generation, used both as history and usage-metering.
-- result_url now points at a Supabase Storage object (see bucket setup
-- below) instead of holding the image as inline base64.
create table if not exists public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  prompt text not null,
  result_url text,
  created_at timestamptz not null default now()
);

alter table public.generations enable row level security;

drop policy if exists "Users can view their own generations" on public.generations;
create policy "Users can view their own generations"
  on public.generations for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own generations" on public.generations;
create policy "Users can insert their own generations"
  on public.generations for insert
  with check (auth.uid() = user_id);

create index if not exists generations_user_month_idx
  on public.generations (user_id, created_at desc);

-- 3) Transactions: one row per MEPS/PayTabs checkout attempt, created as
-- "pending" by app/api/checkout, then reconciled to "paid"/"failed" by the
-- app/api/webhooks/meps callback (after verifying PayTabs's HMAC signature —
-- see lib/meps.ts). Used to activate the plan on the profile.
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  cart_id text not null unique,
  plan_id text not null,
  amount numeric not null,
  status text not null default 'pending',
  tran_ref text,
  created_at timestamptz not null default now()
);

alter table public.transactions drop constraint if exists transactions_plan_id_check;
alter table public.transactions add constraint transactions_plan_id_check
  check (plan_id in ('starter','economic','pro'));
alter table public.transactions drop constraint if exists transactions_status_check;
alter table public.transactions add constraint transactions_status_check
  check (status in ('pending','paid','failed'));

alter table public.transactions enable row level security;

drop policy if exists "Users can view their own transactions" on public.transactions;
create policy "Users can view their own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

-- app/api/checkout inserts the pending row using the normal (cookie-based,
-- RLS-enforced) server client as the signed-in user, so an insert policy is
-- required. It is deliberately restricted to status = 'pending': the real
-- app never inserts anything else, and this stops a user who calls the
-- Supabase client directly from the browser from ever inserting a row that
-- *looks* pre-paid (harmless on its own today since nothing grants access
-- from this table directly, but there's no reason to allow it). The later
-- status update ("paid"/"failed") happens in app/api/webhooks/meps via
-- createAdminClient() (service role), which bypasses RLS entirely — no
-- update policy is granted to regular users for that.
drop policy if exists "Users can insert their own transactions" on public.transactions;
create policy "Users can insert their own transactions"
  on public.transactions for insert
  with check (auth.uid() = user_id and status = 'pending');

create index if not exists transactions_user_idx
  on public.transactions (user_id, created_at desc);

create index if not exists transactions_cart_id_idx
  on public.transactions (cart_id);

-- 4) Storage bucket for generated images. Replaces storing the image as a
-- base64 data URL directly in generations.result_url (fine for an early
-- MVP, but bloats the database and is slow to query/list at scale).
--
-- The bucket is public: these are marketing product photos, not sensitive
-- personal data, and each object's path is namespaced under the owning
-- user's id plus a random filename, so paths aren't guessable/listable by
-- other users. If you'd rather keep results fully private, switch
-- `public` to false below and generate signed URLs on read instead of
-- using getPublicUrl() in app/api/generate/route.ts.
insert into storage.buckets (id, name, public)
values ('generations', 'generations', true)
on conflict (id) do nothing;

drop policy if exists "Public read access to generated images" on storage.objects;
create policy "Public read access to generated images"
  on storage.objects for select
  using (bucket_id = 'generations');

-- Only a signed-in user may upload into their own folder
-- ("<user_id>/<random-file-name>"), enforced by matching the first path
-- segment to their auth.uid().
drop policy if exists "Users can upload their own generated images" on storage.objects;
create policy "Users can upload their own generated images"
  on storage.objects for insert
  with check (
    bucket_id = 'generations'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Not currently used by the app (no "delete generation" button yet), but
-- harmless and useful to have in place for when that's added.
drop policy if exists "Users can delete their own generated images" on storage.objects;
create policy "Users can delete their own generated images"
  on storage.objects for delete
  using (
    bucket_id = 'generations'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
