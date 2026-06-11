-- Run in Supabase SQL Editor after 001_recipe_forks.sql

create table if not exists public.recipe_ratings (
  id uuid primary key default uuid_generate_v4(),
  target_type text not null check (target_type in ('original', 'fork')),
  recipe_slug text,
  fork_id uuid references public.recipe_forks (id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  rater_key text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint recipe_ratings_target_check check (
    (target_type = 'original' and recipe_slug is not null and fork_id is null)
    or (target_type = 'fork' and fork_id is not null)
  )
);

create unique index if not exists recipe_ratings_original_unique
  on public.recipe_ratings (recipe_slug, rater_key)
  where target_type = 'original';

create unique index if not exists recipe_ratings_fork_unique
  on public.recipe_ratings (fork_id, rater_key)
  where target_type = 'fork';

create index if not exists recipe_ratings_recipe_slug_idx
  on public.recipe_ratings (recipe_slug)
  where target_type = 'original';

create index if not exists recipe_ratings_fork_id_idx
  on public.recipe_ratings (fork_id)
  where target_type = 'fork';

alter table public.recipe_ratings enable row level security;

create policy "Anyone can read ratings"
  on public.recipe_ratings for select using (true);

create policy "Anyone can rate"
  on public.recipe_ratings for insert with check (true);

create policy "Anyone can update own rating"
  on public.recipe_ratings for update using (true);
