import Link from "next/link";
import type { Metadata } from "next";
import { requireSession } from "@/lib/auth";
import { leadStats, listLeads } from "@/lib/leads";
import { postStats, listAllPosts } from "@/lib/posts";
import { iso, ms, query } from "@/lib/db";
import StatusBadge from "@/components/admin/StatusBadge";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type AuditRow = {
  id: number;
  actor: string;
  action: string;
  target: string;
  detail: string;
  created_at: Date;
};

export default async function AdminDashboardPage() {
  // Authorisation happens here, at the point of data access.
  const session = await requireSession("/admin");

  const [leads, posts, recent, recentPosts, audit] = await Promise.all([
    leadStats(),
    postStats(),
    listLeads({ limit: 6 }),
    listAllPosts(5),
    query<AuditRow>(
      `SELECT id, actor, action, target, detail, created_at
         FROM audit_log ORDER BY created_at DESC LIMIT 8`,
    ),
  ]);
  const recentLeads = recent.rows;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl dark:text-white">
          Welcome back, {session.displayName}
        </h1>
        <p className="mt-1.5 text-ink-600 dark:text-ink-300">
          Here is what has come in and what is waiting on you.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="New leads"
          value={leads.byStatus.new ?? 0}
          hint="Awaiting first contact"
          href="/admin/leads?status=new"
          emphasis
        />
        <StatCard label="Last 7 days" value={leads.last7Days} hint="All enquiries" href="/admin/leads" />
        <StatCard label="Last 30 days" value={leads.last30Days} hint="All enquiries" href="/admin/leads" />
        <StatCard
          label="Blog"
          value={posts.published}
          hint={`${posts.drafts} draft${posts.drafts === 1 ? "" : "s"}`}
          href="/admin/posts"
        />
      </div>

      {/* Pipeline */}
      <section className="admin-card p-6" aria-labelledby="pipeline-heading">
        <h2 id="pipeline-heading" className="text-base font-bold text-ink-900 dark:text-white">
          Lead pipeline
        </h2>
        <dl className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {(
            [
              ["new", "New"],
              ["contacted", "Contacted"],
              ["qualified", "Qualified"],
              ["won", "Won"],
              ["lost", "Lost"],
              ["spam", "Spam"],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="rounded-xl bg-ink-50 px-4 py-3.5 dark:bg-ink-950/60">
              <dt className="text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                {label}
              </dt>
              <dd className="mt-1 text-2xl font-bold text-ink-900 dark:text-white">
                {leads.byStatus[key] ?? 0}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-sm text-ink-500 dark:text-ink-400">
          {leads.total} enquir{leads.total === 1 ? "y" : "ies"} in total.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Recent leads */}
        <section className="admin-card lg:col-span-3" aria-labelledby="recent-leads-heading">
          <div className="flex items-center justify-between border-b border-ink-200 px-6 py-4 dark:border-ink-800">
            <h2 id="recent-leads-heading" className="text-base font-bold text-ink-900 dark:text-white">
              Latest enquiries
            </h2>
            <Link href="/admin/leads" className="text-sm font-semibold text-brand-700 hover:underline dark:text-brand-300">
              View all
            </Link>
          </div>

          {recentLeads.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-ink-500 dark:text-ink-400">
              No enquiries yet. They will appear here the moment the form is used.
            </p>
          ) : (
            <ul className="divide-y divide-ink-200 dark:divide-ink-800">
              {recentLeads.map((lead) => (
                <li key={lead.id} className="px-6 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-ink-900 dark:text-white">
                        {lead.name}
                        {lead.company ? (
                          <span className="font-normal text-ink-500 dark:text-ink-400"> · {lead.company}</span>
                        ) : null}
                      </p>
                      <p className="mt-0.5 truncate text-sm text-ink-600 dark:text-ink-300">
                        {lead.service} · {lead.email}
                      </p>
                      <p className="mt-1.5 line-clamp-2 text-sm text-ink-500 dark:text-ink-400">
                        {lead.message}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <StatusBadge status={lead.status} />
                      <time dateTime={iso(lead.created_at)} className="text-xs text-ink-400 dark:text-ink-500">
                        {formatRelative(lead.created_at)}
                      </time>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Right column */}
        <div className="space-y-6 lg:col-span-2">
          <section className="admin-card" aria-labelledby="recent-posts-heading">
            <div className="flex items-center justify-between border-b border-ink-200 px-6 py-4 dark:border-ink-800">
              <h2 id="recent-posts-heading" className="text-base font-bold text-ink-900 dark:text-white">
                Blog
              </h2>
              <Link href="/admin/posts/new" className="text-sm font-semibold text-brand-700 hover:underline dark:text-brand-300">
                New post
              </Link>
            </div>

            {recentPosts.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <p className="text-sm text-ink-500 dark:text-ink-400">No posts yet.</p>
                <Link href="/admin/posts/new" className="btn-secondary mt-4 text-sm">
                  Write the first one
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-ink-200 dark:divide-ink-800">
                {recentPosts.map((post) => (
                  <li key={post.id} className="px-6 py-3.5">
                    <Link
                      href={`/admin/posts/${post.id}/edit`}
                      className="group flex items-start justify-between gap-3"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-ink-900 group-hover:text-brand-700 dark:text-white dark:group-hover:text-brand-300">
                          {post.title}
                        </span>
                        <span className="mt-0.5 block text-xs text-ink-400 dark:text-ink-500">
                          {formatRelative(post.updated_at)}
                        </span>
                      </span>
                      <span
                        className={`badge shrink-0 ${
                          post.status === "published"
                            ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
                            : "bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300"
                        }`}
                      >
                        {post.status}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="admin-card" aria-labelledby="audit-heading">
            <div className="border-b border-ink-200 px-6 py-4 dark:border-ink-800">
              <h2 id="audit-heading" className="text-base font-bold text-ink-900 dark:text-white">
                Recent activity
              </h2>
            </div>
            {audit.length === 0 ? (
              <p className="px-6 py-8 text-center text-sm text-ink-500 dark:text-ink-400">
                Nothing logged yet.
              </p>
            ) : (
              <ul className="divide-y divide-ink-200 dark:divide-ink-800">
                {audit.map((entry) => (
                  <li key={entry.id} className="px-6 py-3">
                    <p className="text-sm text-ink-700 dark:text-ink-200">
                      <span className="font-semibold">{entry.actor}</span>{" "}
                      <span className="text-ink-500 dark:text-ink-400">{entry.action}</span>
                      {entry.target ? (
                        <span className="text-ink-400 dark:text-ink-500"> · {entry.target}</span>
                      ) : null}
                    </p>
                    <time dateTime={iso(entry.created_at)} className="text-xs text-ink-400 dark:text-ink-500">
                      {formatRelative(entry.created_at)}
                    </time>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  href,
  emphasis = false,
}: {
  label: string;
  value: number;
  hint: string;
  href: string;
  emphasis?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group block rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card ${
        emphasis
          ? "border-brand-300 bg-gradient-to-br from-brand-50 to-white dark:border-brand-800 dark:from-brand-950/40 dark:to-ink-900"
          : "border-ink-200 bg-white dark:border-ink-800 dark:bg-ink-900"
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-ink-900 dark:text-white">{value}</p>
      <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">{hint}</p>
    </Link>
  );
}

function formatRelative(value: Date | string): string {
  const then = ms(value);
  if (!Number.isFinite(then)) return "";
  const seconds = Math.floor((Date.now() - then) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min ago`;
  }
  if (seconds < 86_400) {
    const hours = Math.floor(seconds / 3600);
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }
  if (seconds < 604_800) {
    const days = Math.floor(seconds / 86_400);
    return `${days} day${days === 1 ? "" : "s"} ago`;
  }
  return new Date(then).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "Asia/Manila",
  });
}
