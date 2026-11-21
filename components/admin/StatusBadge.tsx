import type { LeadStatus } from "@/lib/leads";

const STYLES: Record<LeadStatus, string> = {
  new: "bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-200",
  contacted: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
  qualified: "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200",
  won: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200",
  lost: "bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300",
  spam: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
};

const LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  won: "Won",
  lost: "Lost",
  spam: "Spam",
};

/** Coloured pill for a lead's pipeline status. */
export default function StatusBadge({ status }: { status: LeadStatus }) {
  // Fall back safely if an unexpected value ever reaches the UI.
  const style = STYLES[status] ?? STYLES.lost;
  const label = LABELS[status] ?? status;

  return <span className={`badge ${style}`}>{label}</span>;
}
