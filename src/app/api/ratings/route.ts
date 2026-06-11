import { NextResponse } from "next/server";
import {
  getForkRatingSummaries,
  getRatingSummary,
  submitRating,
  type RatingTargetType,
} from "@/lib/ratings";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetType = searchParams.get("targetType") as RatingTargetType | null;
  const recipeSlug = searchParams.get("recipeSlug") ?? undefined;
  const forkId = searchParams.get("forkId") ?? undefined;
  const forkIds = searchParams.get("forkIds");
  const raterKey = searchParams.get("raterKey") ?? undefined;

  if (forkIds) {
    const ids = forkIds.split(",").map((id) => id.trim()).filter(Boolean);
    const summaries = await getForkRatingSummaries(ids, raterKey);
    return NextResponse.json({ summaries });
  }

  if (!targetType || !["original", "fork"].includes(targetType)) {
    return NextResponse.json({ error: "Invalid targetType." }, { status: 400 });
  }

  const summary = await getRatingSummary(
    targetType,
    { recipeSlug, forkId },
    raterKey
  );

  return NextResponse.json({ summary });
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const input = body as {
    targetType?: RatingTargetType;
    recipeSlug?: string;
    forkId?: string;
    rating?: number;
    raterKey?: string;
  };

  const result = await submitRating({
    targetType: input.targetType ?? "original",
    recipeSlug: input.recipeSlug,
    forkId: input.forkId,
    rating: input.rating ?? 0,
    raterKey: input.raterKey ?? "",
  });

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ summary: result.summary });
}
