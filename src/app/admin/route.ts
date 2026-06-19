import { readFileSync } from "fs";
import path from "path";
import { NextResponse } from "next/server";

export const dynamic = "force-static";

export function GET() {
  const html = readFileSync(
    path.join(process.cwd(), "public/admin/index.html"),
    "utf8"
  );

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
