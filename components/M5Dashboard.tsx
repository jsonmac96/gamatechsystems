/**
 * A scaled-down recreation of the M5 Restaurant Suite dashboard.
 *
 * Rebuilt in HTML and CSS rather than dropped in as a screenshot, so it stays
 * sharp on every display, weighs nothing, respects dark mode and can be read
 * by a screen reader. The whole thing is marked `aria-hidden` and described by
 * the caption its parent supplies, because reading out thirty invented numbers
 * would help nobody.
 *
 * **All figures are illustrative.** They are plausible numbers for a mid-sized
 * Philippine restaurant, not a real client's trading data.
 */

const PESO = "₱";

const KPIS = [
  { label: "Net sales", value: `${PESO}228,166.06`, note: "338 receipts · 338 guests", tone: "feature" },
  { label: "Average ticket", value: `${PESO}675.05`, note: `${PESO}675.05 per guest`, tone: "plain" },
  { label: "Gross profit", value: `${PESO}125,184.11`, note: "COGS 102,981.95", tone: "good" },
  { label: "Food cost %", value: "45.1%", note: "target 28–35%", tone: "bad" },
  { label: "Discounts given", value: `${PESO}719.94`, note: "SC / PWD / promo", tone: "plain" },
  { label: "Est. net income", value: `${PESO}34,735.43`, note: "GP − wastage − expenses", tone: "good" },
] as const;

/** Daily net sales, in thousands of pesos. */
const DAILY = [
  24, 11, 12, 10, 4, 13, 14, 22, 12, 17, 13, 12, 11, 7, 15, 15, 14, 8, 11, 13, 15, 20,
];

const CATEGORIES = [
  { name: "Unli-rice", amount: "85,873", pct: 100 },
  { name: "Inasal / grill", amount: "79,763", pct: 93 },
  { name: "Beverages", amount: "17,185", pct: 20 },
  { name: "Soup", amount: "16,370", pct: 19 },
  { name: "Casa Antonio", amount: "9,775", pct: 11 },
  { name: "Rice", amount: "8,300", pct: 10 },
  { name: "Sizzling", amount: "6,225", pct: 7 },
] as const;

const NAV: readonly { label: string; active?: boolean }[] = [
  { label: "Dashboard", active: true },
  { label: "Items & Recipes" },
  { label: "Delivery / Stock In" },
  { label: "Spoilage & Wastage" },
  { label: "Inventory Count" },
  { label: "Production" },
  { label: "BOM Templates" },
  { label: "Arrange Menu" },
  { label: "Cash Advances" },
  { label: "Employees" },
];

const TONE_VALUE: Record<string, string> = {
  feature: "text-white",
  plain: "text-ink-900 dark:text-white",
  good: "text-emerald-600 dark:text-emerald-400",
  bad: "text-red-600 dark:text-red-400",
};

export default function M5Dashboard({ className = "" }: { className?: string }) {
  const peak = Math.max(...DAILY);

  return (
    <div
      aria-hidden="true"
      className={`overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-lift dark:border-ink-800 dark:bg-ink-900 ${className}`}
    >
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden w-[29%] shrink-0 bg-brand-900 p-3 sm:block">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent-500 text-[0.6rem] font-bold text-white">
              M5
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[0.6rem] font-bold leading-tight text-white">
                MAMAGA FOOD SERVICES
              </span>
              <span className="block text-[0.5rem] uppercase tracking-wider text-brand-300">
                Restaurant Suite
              </span>
            </span>
          </div>

          <span className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-emerald-500 py-1.5 text-[0.6rem] font-bold text-white">
            <svg viewBox="0 0 10 10" className="h-2 w-2 fill-current" aria-hidden="true" focusable="false">
              <path d="M2 1l6 4-6 4z" />
            </svg>
            Open POS / Cashier
          </span>

          <ul className="mt-3 space-y-[3px]">
            {NAV.map((item) => (
              <li
                key={item.label}
                className={`truncate rounded-md px-2 py-[5px] text-[0.58rem] ${
                  item.active
                    ? "bg-accent-500 font-semibold text-white"
                    : "text-brand-200"
                }`}
              >
                {item.label}
              </li>
            ))}
          </ul>
        </aside>

        {/* Main panel */}
        <div className="min-w-0 flex-1 bg-ink-50 p-3 dark:bg-ink-950">
          <div className="flex items-baseline justify-between">
            <span className="text-[0.8rem] font-bold text-ink-900 dark:text-white">Dashboard</span>
            <span className="text-[0.5rem] text-ink-500 dark:text-ink-400">
              Nov 1 – Nov 22, 2026
            </span>
          </div>

          {/* KPI tiles */}
          <div className="mt-2 grid grid-cols-3 gap-1.5">
            {KPIS.map((kpi) => (
              <div
                key={kpi.label}
                className={`rounded-lg border p-1.5 ${
                  kpi.tone === "feature"
                    ? "border-accent-500 bg-accent-500"
                    : "border-ink-200 bg-white dark:border-ink-800 dark:bg-ink-900"
                }`}
              >
                <span
                  className={`block truncate text-[0.42rem] font-semibold uppercase tracking-wide ${
                    kpi.tone === "feature" ? "text-white/80" : "text-ink-500 dark:text-ink-400"
                  }`}
                >
                  {kpi.label}
                </span>
                <span className={`mt-0.5 block truncate text-[0.68rem] font-bold ${TONE_VALUE[kpi.tone]}`}>
                  {kpi.value}
                </span>
                <span
                  className={`block truncate text-[0.4rem] ${
                    kpi.tone === "feature" ? "text-white/75" : "text-ink-400 dark:text-ink-500"
                  }`}
                >
                  {kpi.note}
                </span>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="mt-1.5 grid grid-cols-2 gap-1.5">
            {/* Daily net sales */}
            <div className="rounded-lg border border-ink-200 bg-white p-2 dark:border-ink-800 dark:bg-ink-900">
              <span className="block text-[0.5rem] font-bold text-ink-900 dark:text-white">
                Daily net sales
              </span>
              <div className="mt-1.5 flex h-14 items-end gap-[2px]">
                {DAILY.map((value, index) => (
                  <span
                    key={index}
                    className="flex-1 origin-bottom animate-bar-grow rounded-[1px] bg-accent-500"
                    style={{
                      height: `${Math.max(6, (value / peak) * 100)}%`,
                      animationDelay: `${index * 45 + 250}ms`,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Sales by category */}
            <div className="rounded-lg border border-ink-200 bg-white p-2 dark:border-ink-800 dark:bg-ink-900">
              <span className="block text-[0.5rem] font-bold text-ink-900 dark:text-white">
                Sales by category
              </span>
              <ul className="mt-1.5 space-y-[3px]">
                {CATEGORIES.map((cat) => (
                  <li key={cat.name} className="flex items-center gap-1">
                    <span className="w-[38%] truncate text-[0.42rem] text-ink-600 dark:text-ink-300">
                      {cat.name}
                    </span>
                    <span className="h-[4px] flex-1 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
                      <span
                        className="block h-full rounded-full bg-accent-500"
                        style={{ width: `${cat.pct}%` }}
                      />
                    </span>
                    <span className="w-[22%] shrink-0 text-right text-[0.4rem] tabular-nums text-ink-500 dark:text-ink-400">
                      {cat.amount}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
