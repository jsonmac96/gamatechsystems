import Link from "next/link";

/**
 * Visible breadcrumb trail.
 *
 * The machine-readable equivalent is emitted separately as `BreadcrumbList`
 * JSON-LD, which is what search engines use to show the trail in results.
 */
export default function Breadcrumbs({
  trail,
}: {
  trail: { name: string; href?: string }[];
}) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-ink-500 dark:text-ink-400">
        {trail.map((item, index) => (
          <li key={item.name} className="flex items-center gap-1.5">
            {item.href ? (
              <Link
                href={item.href}
                className="transition-colors hover:text-brand-700 dark:hover:text-brand-300"
              >
                {item.name}
              </Link>
            ) : (
              <span aria-current="page" className="font-medium text-ink-700 dark:text-ink-200">
                {item.name}
              </span>
            )}
            {index < trail.length - 1 ? (
              <svg
                className="h-3.5 w-3.5 text-ink-300 dark:text-ink-600"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M7.3 4.3a1 1 0 0 1 1.4 0l5 5a1 1 0 0 1 0 1.4l-5 5a1 1 0 0 1-1.4-1.4L11.6 10 7.3 5.7a1 1 0 0 1 0-1.4Z"
                  clipRule="evenodd"
                />
              </svg>
            ) : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}
