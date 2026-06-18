import { NextResponse } from "next/server";
import {
  adminNotConfiguredResponse,
  unauthorizedResponse,
  verifyAdminSecret,
} from "@/lib/admin-auth";
import {
  deleteSubmissionById,
  formatSubmissionAsMarkdown,
  getPendingSubmissions,
} from "@/lib/submissions";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!process.env.ADMIN_SECRET) return adminNotConfiguredResponse();
  if (!verifyAdminSecret(request)) return unauthorizedResponse();

  const submissions = await getPendingSubmissions();

  const enriched = submissions.map((submission) => ({
    ...submission,
    markdown: formatSubmissionAsMarkdown(submission),
  }));

  return NextResponse.json({ submissions: enriched });
}

export async function DELETE(request: Request) {
  if (!process.env.ADMIN_SECRET) return adminNotConfiguredResponse();
  if (!verifyAdminSecret(request)) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required." }, { status: 400 });
  }

  const result = await deleteSubmissionById(id);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error ?? "Delete failed." },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true });
}
