import Link from "next/link";
import type { Metadata } from "next";
import { requireSession } from "@/lib/auth";
import { listLeads, LEAD_STATUSES, type LeadStatus } from "@/lib/leads";
import { cleanText, oneOf } from "@/lib/validate";
import LeadRow from "@/components/admin/LeadRow";

export const metadata: Metadata = {
  title: "Leads",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireSession("/admin/leads");

  const params = await searchParams;

  // Every query parameter is cleaned and constrained before it reaches the
  // data layer — the status must be one of a fixed set, and the page number
  // must be a small integer.
  const status = oneOf(
    first(params.status),
    [...LEAD_STATUSES, "all"] as const,
    "all",
  ) as LeadStatus | "all";
  const search = cleanText(first(params.q), 80);
  const page = toPage(first(params.page));

  const { rows, total } = await listLeads({
    status,
    search,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const buildQuery = (overrides: Record<string, string | number>) => {
    const query = new URLSearchParams();
    if (status !== "all") query.set("status", status);
    if (search) query.set("q", search);
    for (const [key, value] of Object.entries(overrides)) {
      if (value === "" || value === "all") query.delete(key);
      else query.set(key, String(value));
    }
    const text = query.toString();
    return text ? `/admin/leads?${text}` : "/admin/leads";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl dark:text-white">
            Leads
          </h1>
          <p className="mt-1.5 text-ink-600 dark:text-ink-300">
            {total} enquir{total === 1 ? "y" : "ies"}
            {status !== "all" ? ` with status "${status}"` : " (spam excluded)"}
            {search ? " matching your search" : ""}.
          </p>
        </div>

        <a
          href={`/api/leads/export${status !== "all" ? `?status=${status}` : ""}`}
          className="btn-secondary text-sm"
          download
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M10 2a1 1 0 0 1 1 1v7.6l2.3-2.3a1 1 0 0 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 1.4-1.4L9 10.6V3a1 1 0 0 1 1-1Z" />
            <path d="M3 15a1 1 0 0 1 2 0v1h10v-1a1 1 0 0 1 2 0v1.5A1.5 1.5 0 0 1 15.5 18h-11A1.5 1.5 0 0 1 3 16.5V15Z" />
          </svg>
          Export CSV
        </a>
      </div>

      {/* Filters */}
      <div className="admin-card p-5">
        <form method="get" action="/admin/leads" className="flex flex-wrap items-end gap-3">
          <div className="min-w-[14rem] flex-1">
            <label htmlFor="q" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400">
              Search
            </label>
            <input
              id="q"
              name="q"
              type="search"
              defaultValue={search}
              maxLength={80}
              placeholder="Name, email, company or message"
              className="field py-2.5 text-sm"
            />
          </div>

          <div>
            <label htmlFor="status" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400">
              Status
            </label>
            <select id="status" name="status" defaultValue={status} className="field py-2.5 text-sm">
              <option value="all">All (except spam)</option>
              {LEAD_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="rounded-xl bg-ink-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600 dark:bg-white dark:text-brand-900 dark:hover:bg-brand-100"
          >
            Apply
          </button>

          {status !== "all" || search ? (
            <Link href="/admin/leads" className="px-2 py-2.5 text-sm font-semibold text-ink-500 hover:text-brand-700 dark:text-ink-400">
              Clear
            </Link>
          ) : null}
        </form>
      </div>

      {/* Results */}
      {rows.length === 0 ? (
        <div className="admin-card px-6 py-16 text-center">
          <h2 className="text-lg font-semibold text-ink-900 dark:text-white">No leads found</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-ink-500 dark:text-ink-400">
            {total === 0 && !search && status === "all"
              ? "Nothing has come through the form yet. New enquiries will show up here straight away."
              : "Try clearing the filters or widening your search."}
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {rows.map((lead) => (
            <LeadRow key={lead.id} lead={lead} />
          ))}
        </ul>
      )}

      {/* Pagination */}
      {totalPages > 1 ? (
        <nav aria-label="Pagination" className="flex items-center justify-between gap-4">
          <p className="text-sm text-ink-500 dark:text-ink-400">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            {page > 1 ? (
              <Link href={buildQuery({ page: page - 1 })} className="btn-secondary px-4 py-2 text-sm" rel="prev">
                Previous
              </Link>
            ) : null}
            {page < totalPages ? (
              <Link href={buildQuery({ page: page + 1 })} className="btn-secondary px-4 py-2 text-sm" rel="next">
                Next
              </Link>
            ) : null}
          </div>
        </nav>
      ) : null}
    </div>
  );
}

function first(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function toPage(raw: string): number {
  if (!/^\d{1,4}$/.test(raw)) return 1;
  const page = Number.parseInt(raw, 10);
  return Number.isInteger(page) && page >= 1 ? page : 1;
}
