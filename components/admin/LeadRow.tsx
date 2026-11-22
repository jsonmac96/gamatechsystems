import {
  deleteLeadAction,
  updateLeadNotesAction,
  updateLeadStatusAction,
} from "@/app/actions/admin";
import { LEAD_STATUSES, type Lead } from "@/lib/leads";
import StatusBadge from "@/components/admin/StatusBadge";

/**
 * One lead, expandable for the full message and internal notes.
 *
 * Built from plain `<form>` elements posting to Server Actions and a native
 * `<details>` for the expansion, so the whole screen works without client
 * JavaScript. Every value rendered here comes from the database and is escaped
 * by React — no `dangerouslySetInnerHTML` anywhere in the admin.
 */
export default function LeadRow({ lead }: { lead: Lead }) {
  const created = new Date(lead.created_at);

  return (
    <li className="admin-card overflow-hidden">
      <details className="group">
        <summary className="flex cursor-pointer list-none flex-wrap items-start justify-between gap-4 px-6 py-5 transition-colors hover:bg-ink-50 dark:hover:bg-ink-800/50">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h2 className="font-bold text-ink-900 dark:text-white">{lead.name}</h2>
              <StatusBadge status={lead.status} />
              {lead.company ? (
                <span className="text-sm text-ink-500 dark:text-ink-400">{lead.company}</span>
              ) : null}
            </div>

            <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-600 dark:text-ink-300">
              <span className="font-medium">{lead.service}</span>
              <span aria-hidden="true" className="text-ink-300 dark:text-ink-600">·</span>
              <span>{lead.email}</span>
              {lead.phone ? (
                <>
                  <span aria-hidden="true" className="text-ink-300 dark:text-ink-600">·</span>
                  <span>{lead.phone}</span>
                </>
              ) : null}
            </p>

            <p className="mt-2 line-clamp-2 text-sm text-ink-500 dark:text-ink-400">
              {lead.message}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <time
              dateTime={created.toISOString()}
              className="text-xs text-ink-400 dark:text-ink-500"
              title={created.toISOString()}
            >
              {created.toLocaleDateString("en-PH", {
                year: "numeric",
                month: "short",
                day: "numeric",
                timeZone: "Asia/Manila",
              })}
            </time>
            <span
              aria-hidden="true"
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-ink-300 text-ink-500 transition-transform duration-300 group-open:rotate-180 dark:border-ink-700 dark:text-ink-400"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.2 7.3a1 1 0 0 1 1.4 0L10 10.6l3.4-3.3a1 1 0 1 1 1.4 1.4l-4.1 4a1 1 0 0 1-1.4 0l-4.1-4a1 1 0 0 1 0-1.4Z" clipRule="evenodd" />
              </svg>
            </span>
          </div>
        </summary>

        <div className="border-t border-ink-200 bg-ink-50/60 px-6 py-5 dark:border-ink-800 dark:bg-ink-950/40">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Message + details */}
            <div className="lg:col-span-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                Message
              </h3>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-800 dark:text-ink-100">
                {lead.message}
              </p>

              <dl className="mt-6 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                <Detail label="Budget">{lead.budget || "—"}</Detail>
                <Detail label="Submitted from">{lead.source_path || "—"}</Detail>
                <Detail label="Received">
                  {created.toLocaleString("en-PH", { timeZone: "Asia/Manila" })}
                </Detail>
                <Detail label="Last updated">
                  {new Date(lead.updated_at).toLocaleString("en-PH", { timeZone: "Asia/Manila" })}
                </Detail>
              </dl>

              <div className="mt-6 flex flex-wrap gap-2.5">
                <a
                  href={`mailto:${encodeURIComponent(lead.email)}?subject=${encodeURIComponent(
                    "Re: your enquiry to GaMatech Systems",
                  )}`}
                  className="btn-secondary px-4 py-2 text-sm"
                >
                  Reply by email
                </a>
                {lead.phone ? (
                  <a href={`tel:${lead.phone.replace(/[^+\d]/g, "")}`} className="btn-secondary px-4 py-2 text-sm">
                    Call
                  </a>
                ) : null}
              </div>
            </div>

            {/* Status + notes + delete */}
            <div className="space-y-5">
              <form action={updateLeadStatusAction} className="space-y-2">
                <input type="hidden" name="id" value={lead.id} />
                <label
                  htmlFor={`status-${lead.id}`}
                  className="block text-xs font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400"
                >
                  Status
                </label>
                <div className="flex gap-2">
                  <select
                    id={`status-${lead.id}`}
                    name="status"
                    defaultValue={lead.status}
                    className="field py-2 text-sm"
                  >
                    {LEAD_STATUSES.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="shrink-0 rounded-xl bg-ink-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-600 dark:bg-brand-500 dark:text-ink-950 dark:hover:bg-brand-400"
                  >
                    Save
                  </button>
                </div>
              </form>

              <form action={updateLeadNotesAction} className="space-y-2">
                <input type="hidden" name="id" value={lead.id} />
                <label
                  htmlFor={`notes-${lead.id}`}
                  className="block text-xs font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400"
                >
                  Internal notes
                </label>
                <textarea
                  id={`notes-${lead.id}`}
                  name="notes"
                  rows={4}
                  maxLength={4000}
                  defaultValue={lead.notes}
                  placeholder="Called 21 Nov — wants a quote for stock sync."
                  className="field resize-y py-2 text-sm"
                />
                <button
                  type="submit"
                  className="w-full rounded-xl border border-ink-300 px-4 py-2 text-sm font-semibold text-ink-700 transition-colors hover:border-brand-400 hover:text-brand-700 dark:border-ink-700 dark:text-ink-200 dark:hover:border-brand-600 dark:hover:text-brand-300"
                >
                  Save notes
                </button>
              </form>

              <form action={deleteLeadAction}>
                <input type="hidden" name="id" value={lead.id} />
                <button
                  type="submit"
                  className="w-full rounded-xl border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
                >
                  Delete this lead
                </button>
                <p className="mt-1.5 text-center text-xs text-ink-400 dark:text-ink-500">
                  Permanent. Export first if you need a record.
                </p>
              </form>
            </div>
          </div>
        </div>
      </details>
    </li>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400">
        {label}
      </dt>
      <dd className="mt-0.5 text-ink-800 dark:text-ink-100">{children}</dd>
    </div>
  );
}
