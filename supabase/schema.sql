-- Error Log — Supabase schema
-- Run this in the Supabase dashboard: SQL Editor → New query → paste → Run.
-- Safe to re-run.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.problems (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users (id) on delete cascade default auth.uid(),
  subject            text not null check (subject in ('methods', 'specialist', 'physics')),
  topic              text,
  source             text,
  source_url         text,
  cas_active         boolean not null default false,
  times_reviewed     integer not null default 0,
  status             text not null default 'todo' check (status in ('todo', 'learning', 'mastered')),
  problem_image_path text,
  answer_image_path  text,
  answer_text        text,
  ai_solution        text,
  notes              text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  last_reviewed_at   timestamptz
);

create index if not exists problems_user_created_idx
  on public.problems (user_id, created_at desc);

create table if not exists public.reviews (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade default auth.uid(),
  problem_id  uuid not null references public.problems (id) on delete cascade,
  reviewed_at timestamptz not null default now(),
  got_correct boolean
);

create index if not exists reviews_user_idx on public.reviews (user_id, reviewed_at desc);

-- Keep updated_at fresh.
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists problems_set_updated_at on public.problems;
create trigger problems_set_updated_at
  before update on public.problems
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security: each user only sees their own rows.
-- ---------------------------------------------------------------------------

alter table public.problems enable row level security;
alter table public.reviews  enable row level security;

drop policy if exists "own problems" on public.problems;
create policy "own problems" on public.problems
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own reviews" on public.reviews;
create policy "own reviews" on public.reviews
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Storage bucket for screenshots (public read; writes scoped to the owner).
-- Files are stored under <user_id>/<uuid>.webp
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('problem-images', 'problem-images', true)
on conflict (id) do update set public = true;

drop policy if exists "images: public read" on storage.objects;
create policy "images: public read" on storage.objects
  for select using (bucket_id = 'problem-images');

drop policy if exists "images: owner write" on storage.objects;
create policy "images: owner write" on storage.objects
  for insert with check (
    bucket_id = 'problem-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "images: owner delete" on storage.objects;
create policy "images: owner delete" on storage.objects
  for delete using (
    bucket_id = 'problem-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---------------------------------------------------------------------------
-- Profiles: per-user AI permission + usage counter, for the admin page.
-- New sign-ups get AI OFF by default; existing accounts are grandfathered ON.
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id             uuid primary key references auth.users (id) on delete cascade,
  email          text,
  ai_enabled     boolean not null default false,
  ai_generations integer not null default 0,
  created_at     timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- A user may read their own profile (to know if AI is enabled). All writes
-- happen server-side via the secret key (admin) or the usage RPC below.
drop policy if exists "own profile read" on public.profiles;
create policy "own profile read" on public.profiles
  for select using (auth.uid() = id);

-- Create a profile row automatically on sign-up (AI off by default).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill anyone who signed up before this table existed, granting them AI.
insert into public.profiles (id, email, ai_enabled)
select id, email, true from auth.users
on conflict (id) do nothing;

-- Let an authenticated user bump only their own usage counter (not ai_enabled).
create or replace function public.increment_ai_usage()
returns void language sql security definer set search_path = public as $$
  update public.profiles
     set ai_generations = ai_generations + 1
   where id = auth.uid();
$$;

grant execute on function public.increment_ai_usage() to authenticated;
