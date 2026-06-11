-- Run this in the Supabase SQL editor (Dashboard → SQL → New query)

create table if not exists public.recipe_forks (
  id uuid primary key default gen_random_uuid(),
  original_slug text not null,
  author_name text not null check (char_length(author_name) between 1 and 80),
  user_id uuid references auth.users (id) on delete set null,
  title text not null check (char_length(title) between 1 and 200),
  excerpt text not null check (char_length(excerpt) between 1 and 500),
  ingredients text[] not null default '{}',
  steps text[] not null default '{}',
  content text not null default '',
  prep_time text,
  cook_time text,
  servings integer check (servings is null or servings > 0),
  created_at timestamptz not null default now()
);

create index if not exists recipe_forks_original_slug_idx
  on public.recipe_forks (original_slug);

create index if not exists recipe_forks_created_at_idx
  on public.recipe_forks (created_at desc);

alter table public.recipe_forks enable row level security;

create policy "Anyone can read forks"
  on public.recipe_forks
  for select
  using (true);

create policy "Anyone can create forks"
  on public.recipe_forks
  for insert
  with check (true);

-- Future: replace insert policy when auth ships, e.g.
-- create policy "Authenticated users create forks"
--   on public.recipe_forks for insert
--   with check (auth.uid() = user_id);
