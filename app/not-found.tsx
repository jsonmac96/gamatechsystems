import Link from "next/link";
import type { Metadata } from "next";
import { PRODUCTS } from "@/lib/products";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

/**
 * 404 page.
 *
 * Marked `noindex` so a mistyped URL cannot end up in search results, and it
 * offers real routes onward rather than being a dead end — which is also what
 * stops it being treated as a soft 404.
 */
export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main id="main" className="flex-1">
        <section className="relative overflow-hidden py-20 sm:py-28">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-b from-brand-50 to-white dark:from-brand-950 dark:to-ink-950" />
            <div className="blob left-[-6rem] top-[-4rem] h-72 w-72 animate-drift bg-accent-300/25 dark:bg-accent-900/20" />
          </div>

          <div className="container-page">
            <div className="mx-auto max-w-2xl text-center">
              <p className="animate-fade-in text-7xl font-bold tracking-tight text-accent-500 sm:text-8xl">
                404
              </p>
              <h1 className="h2 mt-6">We could not find that page</h1>
              <p className="lede mt-5">
                It may have moved, or the link might be mistyped. Here is the way back.
              </p>

              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/" className="btn-cta">
                  Back to home
                </Link>
                <Link href="/contact" className="btn-secondary">
                  Contact us
                </Link>
              </div>

              <div className="mt-14">
                <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-ink-500 dark:text-ink-400">
                  Or jump to a product
                </h2>
                <ul className="mt-5 flex flex-wrap justify-center gap-2.5">
                  {PRODUCTS.map((product) => (
                    <li key={product.slug}>
                      <Link
                        href={`/products/${product.slug}`}
                        className="inline-block rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink-700 transition-all hover:-translate-y-0.5 hover:border-accent-400 hover:text-accent-700 dark:border-ink-800 dark:bg-ink-900 dark:text-ink-200 dark:hover:border-accent-600 dark:hover:text-accent-400"
                      >
                        {product.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
