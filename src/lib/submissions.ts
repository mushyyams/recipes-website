import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import {
  getIngredientItems,
  isIngredientSection,
  normalizeIngredients,
  type RecipeIngredientLine,
} from "@/lib/ingredients";
import {
  getMethodSteps,
  isMethodSection,
  normalizeSteps,
  type RecipeStepLine,
} from "@/lib/steps";
import {
  isValidRecipeSlug,
  type RecipeDifficulty,
} from "@/lib/recipe-meta";
import { recipeSlugExists } from "@/lib/recipes";

export type RecipeSubmission = {
  id: string;
  authorName: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  tags: string[];
  difficulty: RecipeDifficulty;
  ingredients: RecipeIngredientLine[];
  steps: RecipeStepLine[];
  content: string;
  prepTime: string | null;
  cookTime: string | null;
  servings: number | null;
  image: string | null;
  imageAlt: string | null;
  video: string | null;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

type SubmissionRow = {
  id: string;
  author_name: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  tags: string[] | null;
  difficulty: RecipeDifficulty;
  ingredients: unknown;
  steps: unknown;
  content: string;
  prep_time: string | null;
  cook_time: string | null;
  servings: number | null;
  image: string | null;
  image_alt: string | null;
  video: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

function mapSubmission(row: SubmissionRow): RecipeSubmission {
  return {
    id: row.id,
    authorName: row.author_name,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    category: row.category,
    tags: row.tags ?? [],
    difficulty: row.difficulty,
    ingredients: normalizeIngredients(
      Array.isArray(row.ingredients) ? row.ingredients : []
    ),
    steps: normalizeSteps(Array.isArray(row.steps) ? row.steps : []),
    content: row.content ?? "",
    prepTime: row.prep_time,
    cookTime: row.cook_time,
    servings: row.servings,
    image: row.image,
    imageAlt: row.image_alt,
    video: row.video,
    status: row.status,
    createdAt: row.created_at,
  };
}

export type CreateSubmissionInput = {
  authorName: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  tags: string[];
  difficulty: RecipeDifficulty;
  ingredients: RecipeIngredientLine[];
  steps: RecipeStepLine[];
  content: string;
  prepTime?: string;
  cookTime?: string;
  servings?: number;
  image?: string;
  imageAlt?: string;
  video?: string;
};

export async function createSubmission(
  input: CreateSubmissionInput
): Promise<{ submission?: RecipeSubmission; error?: string }> {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return { error: "Recipe submissions are not configured yet." };
  }

  const authorName = input.authorName.trim();
  const title = input.title.trim();
  const slug = input.slug.trim().toLowerCase();
  const excerpt = input.excerpt.trim();
  const category = input.category.trim();
  const tags = input.tags.map((tag) => tag.trim()).filter(Boolean);
  const lines = input.ingredients.filter((entry) => {
    if (isIngredientSection(entry)) {
      return entry.label.trim();
    }
    return entry.item.trim() || entry.amount.trim() || entry.unit.trim();
  });
  const stepLines = input.steps.filter((entry) => {
    if (isMethodSection(entry)) {
      return entry.label.trim();
    }
    return typeof entry === "string" && entry.trim();
  });

  if (!authorName || authorName.length > 80) {
    return { error: "Please enter your name (80 characters max)." };
  }
  if (!title || title.length > 200) {
    return { error: "Please enter a recipe title." };
  }
  if (!isValidRecipeSlug(slug)) {
    return {
      error:
        "URL slug must use lowercase letters, numbers, and hyphens only.",
    };
  }
  if (!excerpt || excerpt.length > 500) {
    return { error: "Please add a short description of your recipe." };
  }
  if (!category) {
    return { error: "Please choose a category." };
  }
  if (getIngredientItems(lines).length === 0 || getMethodSteps(stepLines).length === 0) {
    return { error: "Add at least one ingredient and one step." };
  }
  if (recipeSlugExists(slug)) {
    return {
      error: "A recipe already uses this URL slug. Try a different one.",
    };
  }

  const { data: existingPending } = await supabase
    .from("recipe_submissions")
    .select("id")
    .eq("slug", slug)
    .eq("status", "pending")
    .maybeSingle();

  if (existingPending) {
    return {
      error:
        "A recipe with this URL slug is already awaiting review. Try a different slug.",
    };
  }

  const { data, error } = await supabase
    .from("recipe_submissions")
    .insert({
      author_name: authorName,
      title,
      slug,
      excerpt,
      category,
      tags,
      difficulty: input.difficulty,
      ingredients: lines,
      steps: stepLines,
      content: input.content.trim(),
      prep_time: input.prepTime?.trim() || null,
      cook_time: input.cookTime?.trim() || null,
      servings: input.servings ?? null,
      image: input.image?.trim() || null,
      image_alt: input.imageAlt?.trim() || null,
      video: input.video?.trim() || null,
      status: "pending",
    })
    .select()
    .single();

  if (error || !data) {
    return { error: "Could not submit your recipe. Please try again." };
  }

  return { submission: mapSubmission(data as SubmissionRow) };
}

export async function getPendingSubmissions(): Promise<RecipeSubmission[]> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("recipe_submissions")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((row) => mapSubmission(row as SubmissionRow));
}

export async function deleteSubmissionById(
  submissionId: string
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
    .from("recipe_submissions")
    .delete()
    .eq("id", submissionId);

  if (error) {
    return { success: false, error: "Could not delete submission." };
  }

  return { success: true };
}

function yamlQuote(value: string): string {
  if (/[:#{}[\],&*!|>'"%@`]/.test(value) || value.includes("\n")) {
    return JSON.stringify(value);
  }
  return value;
}

function serializeIngredientYaml(entry: RecipeIngredientLine): string {
  if (isIngredientSection(entry)) {
    return `  - type: section\n    label: ${yamlQuote(entry.label.trim())}`;
  }

  const lines = ["  - amount: " + yamlQuote(entry.amount.trim() || "")];
  if (entry.unit.trim()) {
    lines.push("    unit: " + yamlQuote(entry.unit.trim()));
  }
  lines.push("    item: " + yamlQuote(entry.item.trim()));
  return lines.join("\n");
}

function serializeStepYaml(entry: RecipeStepLine): string {
  if (isMethodSection(entry)) {
    return `  - type: section\n    label: ${yamlQuote(entry.label.trim())}`;
  }
  return "  - " + yamlQuote(entry.trim());
}

export function formatSubmissionAsMarkdown(submission: RecipeSubmission): string {
  const today = new Date().toISOString().slice(0, 10);
  const frontmatter = [
    "---",
    `title: ${yamlQuote(submission.title)}`,
    `slug: ${submission.slug}`,
    `excerpt: ${yamlQuote(submission.excerpt)}`,
    `category: ${submission.category}`,
    submission.tags.length
      ? `tags:\n${submission.tags.map((tag) => `  - ${yamlQuote(tag)}`).join("\n")}`
      : "tags: []",
    `prepTime: ${yamlQuote(submission.prepTime ?? "10 min")}`,
    `cookTime: ${yamlQuote(submission.cookTime ?? "20 min")}`,
    `servings: ${submission.servings ?? 4}`,
    `difficulty: ${submission.difficulty}`,
    "featured: false",
    `publishedAt: ${today}`,
    submission.image ? `image: ${submission.image}` : "image:",
    submission.imageAlt
      ? `imageAlt: ${yamlQuote(submission.imageAlt)}`
      : "imageAlt:",
    submission.video ? `video: ${submission.video}` : "",
    "ingredients:",
    ...submission.ingredients.map(serializeIngredientYaml),
    "steps:",
    ...submission.steps.map(serializeStepYaml),
    "---",
  ]
    .filter(Boolean)
    .join("\n");

  const body = submission.content.trim();
  const credit = `\n\n---\n\n_Submitted by ${submission.authorName}_`;

  return body ? `${frontmatter}\n${body}${credit}` : `${frontmatter}${credit}`;
}
