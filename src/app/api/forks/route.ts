import { NextResponse } from "next/server";
import { createFork, getForksForRecipe } from "@/lib/forks";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const originalSlug = searchParams.get("originalSlug");

  if (!originalSlug) {
    return NextResponse.json(
      { error: "originalSlug is required." },
      { status: 400 }
    );
  }

  const forks = await getForksForRecipe(originalSlug);
  return NextResponse.json({ forks });
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const input = body as {
    originalSlug?: string;
    authorName?: string;
    title?: string;
    excerpt?: string;
    ingredients?: string[];
    steps?: string[];
    content?: string;
    prepTime?: string;
    cookTime?: string;
    servings?: number;
  };

  if (!input.originalSlug?.trim()) {
    return NextResponse.json(
      { error: "originalSlug is required." },
      { status: 400 }
    );
  }

  const result = await createFork({
    originalSlug: input.originalSlug.trim(),
    authorName: input.authorName ?? "",
    title: input.title ?? "",
    excerpt: input.excerpt ?? "",
    ingredients: (input.ingredients ?? []).map((s) => s.trim()).filter(Boolean),
    steps: (input.steps ?? []).map((s) => s.trim()).filter(Boolean),
    content: input.content ?? "",
    prepTime: input.prepTime,
    cookTime: input.cookTime,
    servings: input.servings,
  });

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ fork: result.fork }, { status: 201 });
}
