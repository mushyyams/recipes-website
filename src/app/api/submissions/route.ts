import { NextResponse } from "next/server";
import { normalizeIngredients } from "@/lib/ingredients";
import { RECIPE_CATEGORIES, RECIPE_DIFFICULTIES } from "@/lib/recipe-meta";
import { recalculateCustomUnitUsage } from "@/lib/recipe-unit-sync";
import { normalizeSteps } from "@/lib/steps";
import { createSubmission } from "@/lib/submissions";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const input = body as {
    authorName?: string;
    title?: string;
    slug?: string;
    excerpt?: string;
    category?: string;
    tags?: string[];
    difficulty?: string;
    ingredients?: unknown[];
    steps?: unknown[];
    content?: string;
    prepTime?: string;
    cookTime?: string;
    servings?: number;
    image?: string;
    imageAlt?: string;
    video?: string;
  };

  const difficulty = RECIPE_DIFFICULTIES.includes(
    input.difficulty as (typeof RECIPE_DIFFICULTIES)[number]
  )
    ? (input.difficulty as (typeof RECIPE_DIFFICULTIES)[number])
    : "Medium";

  const category = input.category?.trim() ?? "";
  if (category && !RECIPE_CATEGORIES.includes(category as (typeof RECIPE_CATEGORIES)[number])) {
    return NextResponse.json({ error: "Invalid category." }, { status: 400 });
  }

  const result = await createSubmission({
    authorName: input.authorName ?? "",
    title: input.title ?? "",
    slug: input.slug ?? "",
    excerpt: input.excerpt ?? "",
    category,
    tags: Array.isArray(input.tags) ? input.tags : [],
    difficulty,
    ingredients: normalizeIngredients(input.ingredients ?? []),
    steps: normalizeSteps(input.steps ?? []),
    content: input.content ?? "",
    prepTime: input.prepTime,
    cookTime: input.cookTime,
    servings: input.servings,
    image: input.image,
    imageAlt: input.imageAlt,
    video: input.video,
  });

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  await recalculateCustomUnitUsage();

  return NextResponse.json({ submission: result.submission }, { status: 201 });
}
