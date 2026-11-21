import Link from "next/link";
import { SERVICES, SITE } from "@/lib/site";
import Logo from "@/components/Logo";

/**
 * Site footer.
 *
 * Doubles as the site's internal-linking hub: every service page and key
 * section is one click from every page, which spreads crawl equity and gives
 * visitors a way out of a dead end.
 */
export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-ink-200 bg-ink-50/70 dark:border-ink-800 dark:bg-ink-950">
      <div className="container-page py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12">
          {/* Brand */}
          <div className="lg:col-span-4">
            <Link href="/" className="inline-flex items-center gap-2.5" aria-label={`${SITE.name} — home`}>
              <Logo className="h-9 w-9" />
              <span className="text-lg font-bold tracking-tight text-ink-900 dark:text-white">
                GamaTech<span className="text-brand-500"> Systems</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-600 dark:text-ink-300">
              Software, automation and growth systems for small and medium businesses in the
              Philippines. Fixed scope, documented handover, no lock-in.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a
                href={SITE.social.facebook}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-ink-300 text-ink-600 transition-all hover:-translate-y-0.5 hover:border-brand-400 hover:text-brand-600 dark:border-ink-700 dark:text-ink-300"
                aria-label={`${SITE.name} on Facebook`}
                rel="noopener noreferrer me"
                target="_blank"
              >
                <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h2.6l.4-3H13v-2c0-.6.4-1 1-1Z" />
                </svg>
              </a>
              <a
                href={SITE.social.linkedin}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-ink-300 text-ink-600 transition-all hover:-translate-y-0.5 hover:border-brand-400 hover:text-brand-600 dark:border-ink-700 dark:text-ink-300"
                aria-label={`${SITE.name} on LinkedIn`}
                rel="noopener noreferrer me"
                target="_blank"
              >
                <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M6.9 8.5H4.2V20h2.7V8.5ZM5.5 4a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2ZM20 13.6c0-3-1.6-4.4-3.8-4.4-1.7 0-2.5.9-2.9 1.6V8.5H10.6V20h2.7v-6.2c0-1.3.6-2.1 1.8-2.1s1.6.8 1.6 2.1V20H20v-6.4Z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Services */}
          <nav aria-labelledby="footer-services" className="lg:col-span-3">
            <h2 id="footer-services" className="text-sm font-bold uppercase tracking-[0.12em] text-ink-900 dark:text-white">
              Services
            </h2>
            <ul className="mt-4 space-y-2.5">
              {SERVICES.map((service) => (
                <li key={service.slug}>
                  <Link
                    href={`/services/${service.slug}`}
                    className="text-sm text-ink-600 transition-colors hover:text-brand-700 dark:text-ink-300 dark:hover:text-brand-300"
                  >
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Company */}
          <nav aria-labelledby="footer-company" className="lg:col-span-2">
            <h2 id="footer-company" className="text-sm font-bold uppercase tracking-[0.12em] text-ink-900 dark:text-white">
              Company
            </h2>
            <ul className="mt-4 space-y-2.5">
              {[
                { href: "/about", label: "About us" },
                { href: "/services", label: "All services" },
                { href: "/blog", label: "Insights" },
                { href: "/contact", label: "Contact" },
                { href: "/privacy", label: "Privacy policy" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-ink-600 transition-colors hover:text-brand-700 dark:text-ink-300 dark:hover:text-brand-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div className="lg:col-span-3">
            <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-ink-900 dark:text-white">
              Talk to us
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-ink-600 dark:text-ink-300">
              <li>
                <a href={`mailto:${SITE.email}`} className="transition-colors hover:text-brand-700 dark:hover:text-brand-300">
                  {SITE.email}
                </a>
              </li>
              <li>
                <a href={`tel:${SITE.phoneHref}`} className="transition-colors hover:text-brand-700 dark:hover:text-brand-300">
                  {SITE.phoneDisplay}
                </a>
              </li>
              <li>
                {SITE.address.city}, {SITE.address.countryName}
              </li>
              <li className="text-ink-500 dark:text-ink-400">{SITE.hours}</li>
            </ul>
            <Link href="/contact" className="btn-secondary mt-5 w-full sm:w-auto">
              Start a project
            </Link>
          </div>
        </div>

        <div className="mt-12 hairline" />

        <div className="mt-6 flex flex-col items-start justify-between gap-3 text-xs text-ink-500 sm:flex-row sm:items-center dark:text-ink-400">
          <p>
            © {year} {SITE.legalName}. All rights reserved.
          </p>
          <p>
            Built in the Philippines. Serving SMEs nationwide.
          </p>
        </div>
      </div>
    </footer>
  );
}
