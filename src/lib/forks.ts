import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

export type RecipeFork = {
  id: string;
  originalSlug: string;
  authorName: string;
  userId: string | null;
  title: string;
  excerpt: string;
  ingredients: string[];
  steps: string[];
  content: string;
  prepTime: string | null;
  cookTime: string | null;
  servings: number | null;
  createdAt: string;
};

type ForkRow = {
  id: string;
  original_slug: string;
  author_name: string;
  user_id: string | null;
  title: string;
  excerpt: string;
  ingredients: string[];
  steps: string[];
  content: string;
  prep_time: string | null;
  cook_time: string | null;
  servings: number | null;
  created_at: string;
};

function mapFork(row: ForkRow): RecipeFork {
  return {
    id: row.id,
    originalSlug: row.original_slug,
    authorName: row.author_name,
    userId: row.user_id,
    title: row.title,
    excerpt: row.excerpt,
    ingredients: row.ingredients ?? [],
    steps: row.steps ?? [],
    content: row.content ?? "",
    prepTime: row.prep_time,
    cookTime: row.cook_time,
    servings: row.servings,
    createdAt: row.created_at,
  };
}

export async function getForksForRecipe(
  originalSlug: string
): Promise<RecipeFork[]> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("recipe_forks")
    .select("*")
    .eq("original_slug", originalSlug)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((row) => mapFork(row as ForkRow));
}

export async function getForkById(
  forkId: string
): Promise<RecipeFork | undefined> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return undefined;

  const { data, error } = await supabase
    .from("recipe_forks")
    .select("*")
    .eq("id", forkId)
    .maybeSingle();

  if (error || !data) return undefined;

  return mapFork(data as ForkRow);
}

export type CreateForkInput = {
  originalSlug: string;
  authorName: string;
  title: string;
  excerpt: string;
  ingredients: string[];
  steps: string[];
  content: string;
  prepTime?: string;
  cookTime?: string;
  servings?: number;
};

export async function createFork(
  input: CreateForkInput
): Promise<{ fork?: RecipeFork; error?: string }> {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return { error: "Fork storage is not configured yet." };
  }

  const authorName = input.authorName.trim();
  const title = input.title.trim();
  const excerpt = input.excerpt.trim();

  if (!authorName || authorName.length > 80) {
    return { error: "Please enter your name (80 characters max)." };
  }
  if (!title || title.length > 200) {
    return { error: "Please enter a recipe title." };
  }
  if (!excerpt || excerpt.length > 500) {
    return { error: "Please add a short description of your variation." };
  }
  if (input.ingredients.length === 0 || input.steps.length === 0) {
    return { error: "Add at least one ingredient and one step." };
  }

  const { data, error } = await supabase
    .from("recipe_forks")
    .insert({
      original_slug: input.originalSlug,
      author_name: authorName,
      title,
      excerpt,
      ingredients: input.ingredients,
      steps: input.steps,
      content: input.content.trim(),
      prep_time: input.prepTime ?? null,
      cook_time: input.cookTime ?? null,
      servings: input.servings ?? null,
    })
    .select()
    .single();

  if (error || !data) {
    return { error: "Could not save your fork. Please try again." };
  }

  return { fork: mapFork(data as ForkRow) };
}

export async function getAllForks(): Promise<RecipeFork[]> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("recipe_forks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((row) => mapFork(row as ForkRow));
}

export async function deleteForkById(
  forkId: string
): Promise<{ success: boolean; error?: string }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return {
      success: false,
      error: "Delete requires SUPABASE_SERVICE_ROLE_KEY on the server.",
    };
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await supabase
    .from("recipe_forks")
    .delete()
    .eq("id", forkId);

  if (error) {
    return { success: false, error: "Could not delete fork." };
  }

  return { success: true };
}

