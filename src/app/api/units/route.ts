import { NextResponse } from "next/server";
import { getUnitOptions } from "@/lib/recipe-units";

export const dynamic = "force-dynamic";

export async function GET() {
  const { fixedUnits, customUnitUsage } = getUnitOptions();
  return NextResponse.json({ fixedUnits, customUnitUsage });
}
