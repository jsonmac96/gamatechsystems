/**
 * FAQ list rendered with native `<details>`/`<summary>`.
 *
 * No JavaScript involved: it works before hydration, it is keyboard accessible
 * and screen-reader friendly by default, and — importantly for AEO — the
 * answers are in the HTML rather than being revealed by a script, so crawlers
 * and answer engines can read them.
 */
export default function FaqList({
  faqs,
  className = "",
}: {
  faqs: readonly { q: string; a: string }[];
  className?: string;
}) {
  return (
    <div className={`divide-y divide-ink-200 overflow-hidden rounded-3xl border border-ink-200 bg-white dark:divide-ink-800 dark:border-ink-800 dark:bg-ink-900/60 ${className}`}>
      {faqs.map((faq) => (
        <details key={faq.q} className="group">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-4 px-6 py-5 text-left font-semibold text-ink-900 transition-colors hover:bg-ink-50 focus-visible:bg-ink-50 dark:text-white dark:hover:bg-ink-800/60">
            <h3 className="text-base sm:text-lg">{faq.q}</h3>
            <span
              aria-hidden="true"
              className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-ink-300 text-brand-600 transition-all duration-300 group-open:rotate-45 group-open:border-brand-400 group-open:bg-brand-50 dark:border-ink-700 dark:group-open:bg-brand-950/50"
            >
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
                focusable="false"
              >
                <path d="M8 3v10M3 8h10" />
              </svg>
            </span>
          </summary>
          <div className="px-6 pb-6 pr-14">
            <p className="prose-body">{faq.a}</p>
          </div>
        </details>
      ))}
    </div>
  );
}
