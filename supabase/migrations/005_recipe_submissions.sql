-- Community recipe submissions awaiting editorial review.
-- Run after 004_structured_fork_steps.sql.
--
-- Row Level Security: enabled below. Public clients (anon/authenticated) may
-- INSERT pending submissions only. SELECT/UPDATE/DELETE are denied by default.

create table if not exists public.recipe_submissions (
  id uuid primary key default uuid_generate_v4(),
  author_name text not null check (char_length(author_name) between 1 and 80),
  title text not null check (char_length(title) between 1 and 200),
  slug text not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  excerpt text not null check (char_length(excerpt) between 1 and 500),
  category text not null,
  tags text[] not null default '{}',
  difficulty text not null default 'Medium'
    check (difficulty in ('Easy', 'Medium', 'Advanced')),
  ingredients jsonb not null default '[]'::jsonb,
  steps jsonb not null default '[]'::jsonb,
  content text not null default '',
  prep_time text,
  cook_time text,
  servings integer check (servings is null or servings > 0),
  image text,
  image_alt text,
  video text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

alter table public.recipe_submissions enable row level security;
alter table public.recipe_submissions force row level security;

create index if not exists recipe_submissions_status_idx
  on public.recipe_submissions (status);

create index if not exists recipe_submissions_created_at_idx
  on public.recipe_submissions (created_at desc);

create unique index if not exists recipe_submissions_pending_slug_idx
  on public.recipe_submissions (slug)
  where status = 'pending';

-- Public may submit only; no read/update/delete policies (denied by default).
create policy "Anyone can submit recipes"
  on public.recipe_submissions
  for insert
  to anon, authenticated
  with check (status = 'pending');
