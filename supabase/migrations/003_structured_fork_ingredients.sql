-- Converts fork ingredients from text[] to structured jsonb objects.
-- Safe to run on a fresh table or one with existing string ingredients.

alter table public.recipe_forks
  alter column ingredients type jsonb
  using coalesce(
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
      from unnest(ingredients) as elem
    ),
    '[]'::jsonb
  );

alter table public.recipe_forks
  alter column ingredients set default '[]'::jsonb;
