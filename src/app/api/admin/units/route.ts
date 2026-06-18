import { NextResponse } from "next/server";
import {
  adminNotConfiguredResponse,
  unauthorizedResponse,
  verifyAdminSecret,
} from "@/lib/admin-auth";
import {
  dismissCustomUnit,
  getUnitOptions,
  promoteCustomUnit,
  removeFixedUnit,
} from "@/lib/recipe-units";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!process.env.ADMIN_SECRET) return adminNotConfiguredResponse();
  if (!verifyAdminSecret(request)) return unauthorizedResponse();

  return NextResponse.json(getUnitOptions());
}

export async function POST(request: Request) {
  if (!process.env.ADMIN_SECRET) return adminNotConfiguredResponse();
  if (!verifyAdminSecret(request)) return unauthorizedResponse();

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const input = body as { action?: string; unit?: string };

  if (!input.unit?.trim()) {
    return NextResponse.json({ error: "unit is required." }, { status: 400 });
  }

  try {
    if (input.action === "promote") {
      return NextResponse.json({ config: promoteCustomUnit(input.unit) });
    }
    if (input.action === "remove-fixed") {
      return NextResponse.json({ config: removeFixedUnit(input.unit) });
    }
    if (input.action === "dismiss-custom") {
      return NextResponse.json({ config: dismissCustomUnit(input.unit) });
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Action failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
