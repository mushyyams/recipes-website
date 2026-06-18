import { NextResponse } from "next/server";
import { recalculateCustomUnitUsage } from "@/lib/recipe-unit-sync";

export async function POST() {
  const config = await recalculateCustomUnitUsage();

  return NextResponse.json({
    fixedUnits: config.fixedUnits,
    customUnitUsage: config.customUnitUsage,
  });
}
