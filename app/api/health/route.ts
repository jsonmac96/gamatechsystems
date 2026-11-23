import { NextResponse } from "next/server";
import { query } from "@/lib/db";

/**
 * Liveness probe for uptime monitoring.
 *
 * Returns only "ok" or "degraded" plus a timestamp. It deliberately exposes no
 * version numbers, dependency names, stack traces, row counts or environment
 * detail — a health endpoint is a favourite reconnaissance target, and there is
 * no reason for it to help.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  let databaseOk = false;
  try {
    await query("SELECT 1");
    databaseOk = true;
  } catch {
    databaseOk = false;
  }

  return NextResponse.json(
    { status: databaseOk ? "ok" : "degraded", time: new Date().toISOString() },
    {
      status: databaseOk ? 200 : 503,
      headers: {
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow",
      },
    },
  );
}
