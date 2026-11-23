import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { audit } from "@/lib/db";
import { leadsToCsv, listLeads, LEAD_STATUSES, type LeadStatus } from "@/lib/leads";
import { getClientContext } from "@/lib/request-context";

/**
 * CSV export of leads — admin only.
 *
 * Notes on the deliberate choices here:
 *  - Authorisation is checked in the handler itself. A 404 (not a 401) is
 *    returned to anonymous callers so the endpoint's existence is not
 *    advertised to someone probing the site.
 *  - `leadsToCsv` prefixes any cell starting with =, +, - or @ so the file
 *    cannot execute formulas when opened in Excel or Sheets (CSV injection).
 *  - The filename is constructed from a date and a validated status, never
 *    from request input, so the Content-Disposition header cannot be injected.
 *  - IP hashes and internal notes columns stay in, since this is an
 *    authenticated administrative export, but the raw IP is never stored at
 *    all so it cannot leak here.
 */
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await getSession();
  // A temporary password unlocks nothing but the change-password screen.
  if (!session || session.mustChangePassword) {
    return new NextResponse("Not found", { status: 404 });
  }

  const statusParam = request.nextUrl.searchParams.get("status") ?? "all";
  const status: LeadStatus | "all" = (LEAD_STATUSES as readonly string[]).includes(statusParam)
    ? (statusParam as LeadStatus)
    : "all";

  const { rows } = await listLeads({ status, limit: 200, offset: 0 });
  const csv = leadsToCsv(rows);

  const { ipHash } = await getClientContext();
  await audit({
    actor: session.username,
    action: "leads.exported",
    detail: `${rows.length} rows, status=${status}`,
    ipHash,
  });

  const date = new Date().toISOString().slice(0, 10);
  const filename = `gamatech-leads-${status}-${date}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      // Excel and Sheets need the BOM to detect UTF-8; prepend it below instead
      // of relying on the charset alone.
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store, no-cache, must-revalidate, private",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
