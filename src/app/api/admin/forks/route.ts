import { NextResponse } from "next/server";
import {
  adminNotConfiguredResponse,
  unauthorizedResponse,
  verifyAdminSecret,
} from "@/lib/admin-auth";
import { deleteForkById, getAllForks } from "@/lib/forks";
import { getRecipeBySlug } from "@/lib/recipes";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!process.env.ADMIN_SECRET) return adminNotConfiguredResponse();
  if (!verifyAdminSecret(request)) return unauthorizedResponse();

  const forks = await getAllForks();

  const enriched = forks.map((fork) => ({
    ...fork,
    originalTitle: getRecipeBySlug(fork.originalSlug)?.title ?? fork.originalSlug,
  }));

  return NextResponse.json({ forks: enriched });
}

export async function DELETE(request: Request) {
  if (!process.env.ADMIN_SECRET) return adminNotConfiguredResponse();
  if (!verifyAdminSecret(request)) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required." }, { status: 400 });
  }

  const result = await deleteForkById(id);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error ?? "Delete failed." },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true });
}
