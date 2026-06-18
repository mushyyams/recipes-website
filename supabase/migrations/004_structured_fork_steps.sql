-- Converts fork steps from text[] to jsonb (strings and section objects).
-- Safe to run after 003_structured_fork_ingredients.sql.

alter table public.recipe_forks
  add column if not exists steps_new jsonb not null default '[]'::jsonb;

update public.recipe_forks
set steps_new = coalesce(
  (
    select jsonb_agg(to_jsonb(elem))
    from unnest(steps::text[]) as elem
  ),
  '[]'::jsonb
);

alter table public.recipe_forks drop column steps;

alter table public.recipe_forks
  rename column steps_new to steps;

alter table public.recipe_forks
  alter column steps set default '[]'::jsonb;
