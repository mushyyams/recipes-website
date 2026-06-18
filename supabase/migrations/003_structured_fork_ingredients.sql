-- Converts fork ingredients from text[] to structured jsonb objects.
-- Safe to run on a fresh table or one with existing string ingredients.
-- Uses add/update/rename because PostgreSQL rejects subqueries in USING.

alter table public.recipe_forks
  add column if not exists ingredients_new jsonb not null default '[]'::jsonb;

update public.recipe_forks
set ingredients_new = coalesce(
  (
    select jsonb_agg(
      jsonb_build_object(
        'amount',
        '',
        'unit',
        '',
        'item',
        elem
      )
    )
    from unnest(ingredients::text[]) as elem
  ),
  '[]'::jsonb
);

alter table public.recipe_forks drop column ingredients;

alter table public.recipe_forks
  rename column ingredients_new to ingredients;

alter table public.recipe_forks
  alter column ingredients set default '[]'::jsonb;
