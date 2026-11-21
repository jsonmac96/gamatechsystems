"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/leads", label: "Leads", exact: false },
  { href: "/admin/posts", label: "Blog", exact: false },
] as const;

/** Admin top navigation with an active-route indicator. */
export default function AdminNav() {
  const pathname = usePathname();

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <nav aria-label="Admin sections" className="flex items-center gap-1">
      {LINKS.map((link) => {
        const active = isActive(link.href, link.exact);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`relative rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors ${
              active
                ? "bg-brand-50 text-brand-800 dark:bg-brand-950/50 dark:text-brand-200"
                : "text-ink-600 hover:bg-ink-100 hover:text-ink-900 dark:text-ink-300 dark:hover:bg-ink-800 dark:hover:text-white"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
