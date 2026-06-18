-- Converts fork steps from text[] to jsonb (strings and subheader objects).
-- Safe to run after 003_structured_fork_ingredients.sql.

alter table public.recipe_forks
  alter column steps type jsonb
  using coalesce(
    (
      select jsonb_agg(to_jsonb(elem))
      from unnest(steps) as elem
    ),
    '[]'::jsonb
  );

alter table public.recipe_forks
  alter column steps set default '[]'::jsonb;
