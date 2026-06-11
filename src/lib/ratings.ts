import { createSupabaseServerClient } from "@/lib/supabase/server";

export type RatingTargetType = "original" | "fork";

export type RatingSummary = {
  average: number | null;
  count: number;
  distribution: Record<number, number>;
};

type RatingRow = {
  rating: number;
  rater_key: string;
};

function buildSummary(rows: RatingRow[], raterKey?: string): RatingSummary {
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let userRating: number | undefined;

  for (const row of rows) {
    distribution[row.rating] = (distribution[row.rating] ?? 0) + 1;
    if (raterKey && row.rater_key === raterKey) {
      userRating = row.rating;
    }
  }

  const count = rows.length;
  const average =
    count === 0
      ? null
      : Math.round((rows.reduce((sum, row) => sum + row.rating, 0) / count) * 10) /
        10;

  return {
    average,
    count,
    distribution,
    ...(userRating !== undefined ? { userRating } : {}),
  } as RatingSummary & { userRating?: number };
}

export type RatingSummaryWithUser = RatingSummary & { userRating?: number };

function ratingSaveErrorMessage(error: { code?: string; message?: string }) {
  if (error.code === "PGRST205" || error.message?.includes("recipe_ratings")) {
    return "Ratings storage is not set up yet. Run supabase/migrations/002_recipe_ratings.sql in Supabase.";
  }
  return "Could not save your rating. Please try again.";
}

export async function getRatingSummary(
  targetType: RatingTargetType,
  target: { recipeSlug?: string; forkId?: string },
  raterKey?: string
): Promise<RatingSummaryWithUser> {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return { average: null, count: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
  }

  let query = supabase.from("recipe_ratings").select("rating, rater_key");

  if (targetType === "original") {
    if (!target.recipeSlug) {
      return { average: null, count: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
    }
    query = query.eq("target_type", "original").eq("recipe_slug", target.recipeSlug);
  } else {
    if (!target.forkId) {
      return { average: null, count: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
    }
    query = query.eq("target_type", "fork").eq("fork_id", target.forkId);
  }

  const { data, error } = await query;
  if (error || !data) {
    return { average: null, count: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
  }

  return buildSummary(data as RatingRow[], raterKey);
}

export async function submitRating(input: {
  targetType: RatingTargetType;
  recipeSlug?: string;
  forkId?: string;
  rating: number;
  raterKey: string;
}): Promise<{ summary?: RatingSummaryWithUser; error?: string }> {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return { error: "Ratings are not configured yet." };
  }

  const rating = Math.round(input.rating);
  const raterKey = input.raterKey.trim();

  if (!raterKey || raterKey.length > 64) {
    return { error: "Invalid rater identity." };
  }
  if (rating < 1 || rating > 5) {
    return { error: "Rating must be between 1 and 5." };
  }

  const row: Record<string, unknown> = {
    target_type: input.targetType,
    rating,
    rater_key: raterKey,
    updated_at: new Date().toISOString(),
  };

  if (input.targetType === "original") {
    if (!input.recipeSlug?.trim()) {
      return { error: "recipeSlug is required." };
    }
    row.recipe_slug = input.recipeSlug.trim();
    row.fork_id = null;

    const { data: existing } = await supabase
      .from("recipe_ratings")
      .select("id")
      .eq("target_type", "original")
      .eq("recipe_slug", row.recipe_slug)
      .eq("rater_key", raterKey)
      .maybeSingle();

    const { error } = existing
      ? await supabase
          .from("recipe_ratings")
          .update({ rating, updated_at: row.updated_at })
          .eq("id", existing.id)
      : await supabase.from("recipe_ratings").insert(row);

    if (error) {
      return { error: ratingSaveErrorMessage(error) };
    }
  } else {
    if (!input.forkId?.trim()) {
      return { error: "forkId is required." };
    }
    row.fork_id = input.forkId.trim();
    row.recipe_slug = null;

    const { data: existing } = await supabase
      .from("recipe_ratings")
      .select("id")
      .eq("target_type", "fork")
      .eq("fork_id", row.fork_id)
      .eq("rater_key", raterKey)
      .maybeSingle();

    const { error } = existing
      ? await supabase
          .from("recipe_ratings")
          .update({ rating, updated_at: row.updated_at })
          .eq("id", existing.id)
      : await supabase.from("recipe_ratings").insert(row);

    if (error) {
      return { error: ratingSaveErrorMessage(error) };
    }
  }

  const summary = await getRatingSummary(
    input.targetType,
    { recipeSlug: input.recipeSlug, forkId: input.forkId },
    raterKey
  );

  return { summary };
}

export async function getForkRatingSummaries(
  forkIds: string[],
  raterKey?: string
): Promise<Record<string, RatingSummaryWithUser>> {
  const result: Record<string, RatingSummaryWithUser> = {};
  if (forkIds.length === 0) return result;

  const supabase = createSupabaseServerClient();
  if (!supabase) return result;

  const { data, error } = await supabase
    .from("recipe_ratings")
    .select("fork_id, rating, rater_key")
    .eq("target_type", "fork")
    .in("fork_id", forkIds);

  if (error || !data) return result;

  const grouped = new Map<string, RatingRow[]>();
  for (const row of data as (RatingRow & { fork_id: string })[]) {
    const list = grouped.get(row.fork_id) ?? [];
    list.push({ rating: row.rating, rater_key: row.rater_key });
    grouped.set(row.fork_id, list);
  }

  for (const forkId of forkIds) {
    result[forkId] = buildSummary(grouped.get(forkId) ?? [], raterKey);
  }

  return result;
}
