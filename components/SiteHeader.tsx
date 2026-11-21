"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV_LINKS, SITE } from "@/lib/site";
import { PRODUCTS } from "@/lib/products";
import { SERVICES } from "@/lib/services";
import Logo from "@/components/Logo";

/**
 * Sticky site header with an animated services dropdown and a mobile sheet.
 *
 * The header gains a backdrop blur and shadow once the page scrolls, which
 * keeps the hero clean at the top and the navigation legible further down.
 */
export default function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the menus on navigation.
  useEffect(() => {
    setMobileOpen(false);
    setServicesOpen(false);
  }, [pathname]);

  // Lock background scroll while the mobile sheet is open, and allow Escape to close.
  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-ink-200/70 bg-white/85 shadow-sm backdrop-blur-xl dark:border-ink-800/70 dark:bg-ink-950/85"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="container-page">
        <div className="flex h-[4.5rem] items-center justify-between gap-4">
          <Link
            href="/"
            className="group rounded-xl py-1 transition-opacity hover:opacity-90"
            aria-label={`${SITE.name} — home`}
          >
            <Logo markClassName="h-9 w-9 transition-transform duration-500 group-hover:-rotate-6" />
          </Link>

          {/* Desktop navigation */}
          <nav aria-label="Main navigation" className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) =>
              link.href === "/products" ? (
                <div
                  key={link.href}
                  className="relative"
                  onMouseEnter={() => setServicesOpen(true)}
                  onMouseLeave={() => setServicesOpen(false)}
                >
                  <Link
                    href="/products"
                    aria-expanded={servicesOpen}
                    aria-haspopup="true"
                    className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors ${
                      isActive(link.href)
                        ? "text-accent-700 dark:text-accent-400"
                        : "text-ink-700 hover:text-accent-700 dark:text-ink-200 dark:hover:text-accent-400"
                    }`}
                  >
                    {link.label}
                    <svg
                      className={`h-3.5 w-3.5 transition-transform duration-300 ${servicesOpen ? "rotate-180" : ""}`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.2 7.3a1 1 0 0 1 1.4 0L10 10.6l3.4-3.3a1 1 0 1 1 1.4 1.4l-4.1 4a1 1 0 0 1-1.4 0l-4.1-4a1 1 0 0 1 0-1.4Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Link>

                  <div
                    className={`absolute left-1/2 top-full w-[32rem] -translate-x-1/2 pt-3 transition-all duration-200 ${
                      servicesOpen
                        ? "visible translate-y-0 opacity-100"
                        : "invisible -translate-y-2 opacity-0"
                    }`}
                  >
                    <div className="grid grid-cols-2 gap-1 rounded-2xl border border-ink-200 bg-white p-2.5 shadow-lift dark:border-ink-800 dark:bg-ink-900">
                      {PRODUCTS.map((product) => (
                        <Link
                          key={product.slug}
                          href={`/products/${product.slug}`}
                          className="rounded-xl px-3.5 py-2.5 transition-colors hover:bg-brand-50 dark:hover:bg-ink-800"
                        >
                          <span className="block text-sm font-semibold text-ink-900 dark:text-white">
                            <span className="mr-1.5 text-xs font-bold text-accent-600 dark:text-accent-400">
                              {product.code}
                            </span>
                            {product.name}
                          </span>
                          <span className="mt-0.5 block text-xs leading-snug text-ink-500 dark:text-ink-400">
                            {product.summary.split(/[—:.]/)[0]?.trim()}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors ${
                    isActive(link.href)
                      ? "text-accent-700 dark:text-accent-400"
                      : "text-ink-700 hover:text-accent-700 dark:text-ink-200 dark:hover:text-accent-400"
                  }`}
                >
                  {link.label}
                </Link>
              ),
            )}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <a
              href={`tel:${SITE.phoneHref}`}
              className="text-sm font-semibold text-ink-600 transition-colors hover:text-accent-700 dark:text-ink-300 dark:hover:text-accent-400"
            >
              {SITE.phoneDisplay}
            </a>
            <Link
              href="/contact"
              className="rounded-xl bg-brand-900 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent-500 hover:shadow-glow dark:bg-accent-500 dark:hover:bg-accent-400"
            >
              Get a free consultation
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-ink-300 text-ink-800 transition-colors hover:border-accent-400 hover:text-accent-700 lg:hidden dark:border-ink-700 dark:text-ink-100"
          >
            <span className="sr-only">{mobileOpen ? "Close menu" : "Open menu"}</span>
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              {mobileOpen ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M3.5 7h17M3.5 12h17M3.5 17h17" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile sheet */}
      <div
        id="mobile-menu"
        hidden={!mobileOpen}
        className="border-t border-ink-200 bg-white lg:hidden dark:border-ink-800 dark:bg-ink-950"
      >
        <nav aria-label="Mobile navigation" className="container-page max-h-[calc(100dvh-4.5rem)] overflow-y-auto py-5">
          <ul className="space-y-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={`block rounded-xl px-4 py-3 text-base font-semibold transition-colors ${
                    isActive(link.href)
                      ? "bg-accent-50 text-accent-800 dark:bg-ink-900 dark:text-accent-400"
                      : "text-ink-800 hover:bg-ink-50 dark:text-ink-100 dark:hover:bg-ink-900"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <p className="mt-6 px-4 text-xs font-semibold uppercase tracking-[0.14em] text-ink-500 dark:text-ink-400">
            Core products
          </p>
          <ul className="mt-2 space-y-1">
            {PRODUCTS.map((product) => (
              <li key={product.slug}>
                <Link
                  href={`/products/${product.slug}`}
                  className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50 hover:text-accent-700 dark:text-ink-200 dark:hover:bg-ink-900"
                >
                  <span className="text-xs font-bold text-accent-600 dark:text-accent-400">
                    {product.code}
                  </span>
                  {product.name}
                </Link>
              </li>
            ))}
          </ul>

          <p className="mt-6 px-4 text-xs font-semibold uppercase tracking-[0.14em] text-ink-500 dark:text-ink-400">
            Services
          </p>
          <ul className="mt-2 space-y-1">
            {SERVICES.map((service) => (
              <li key={service.slug}>
                <Link
                  href={`/services/${service.slug}`}
                  className="block rounded-xl px-4 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50 hover:text-accent-700 dark:text-ink-200 dark:hover:bg-ink-900"
                >
                  {service.name}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-6 space-y-3 px-1 pb-4">
            <Link href="/contact" className="btn-cta w-full">
              Get a free consultation
            </Link>
            <a href={`tel:${SITE.phoneHref}`} className="btn-secondary w-full">
              Call {SITE.phoneDisplay}
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}
