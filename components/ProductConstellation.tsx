import Link from "next/link";
import { PRODUCTS } from "@/lib/products";
import CatalogIcon from "@/components/CatalogIcon";
import { LogoMark } from "@/components/Logo";

/**
 * Hero visual: the six core products arranged around the GaMatech mark.
 *
 * It doubles as navigation — every tile is a real link to its product page —
 * so the most prominent graphic on the site is also the fastest way into the
 * catalogue. Tiles fade up in sequence and the panel floats gently; both
 * animations are switched off under `prefers-reduced-motion`.
 */
export default function ProductConstellation() {
  return (
    <div className="tilt-3d relative">
      <div
        aria-hidden="true"
        className="absolute -inset-4 -z-10 rounded-[2.25rem] bg-gradient-to-br from-accent-400/25 to-brand-500/20 blur-2xl"
      />

      <div className="animate-float rounded-3xl border border-ink-200 bg-white/95 p-5 shadow-[0_2px_6px_rgb(10_16_32/0.05),0_32px_80px_-32px_rgb(10_26_62/0.5),0_60px_120px_-60px_rgb(231_88_10/0.3)] backdrop-blur sm:p-6 dark:border-white/10 dark:bg-ink-900/80 dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.08),0_40px_100px_-40px_rgb(0_0_0/0.8),0_60px_120px_-60px_rgb(231_88_10/0.35)]">
        {/* Header strip, echoing the brand */}
        <div className="flex items-center justify-between gap-3 border-b border-ink-200 pb-4 dark:border-ink-800">
          <div className="flex items-center gap-2.5">
            <LogoMark className="h-8 w-8" />
            <div className="leading-tight">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                Core products
              </p>
              <p className="text-sm font-bold text-ink-900 dark:text-white">One foundation, six systems</p>
            </div>
          </div>
          <span className="badge bg-accent-50 text-accent-700 dark:bg-accent-950/60 dark:text-accent-300">
            M5–M10
          </span>
        </div>

        {/* The six tiles */}
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {PRODUCTS.map((product, index) => (
            <li
              key={product.slug}
              className="animate-fade-up"
              style={{ animationDelay: `${350 + index * 110}ms` }}
            >
              <Link
                href={`/products/${product.slug}`}
                className="group flex h-full flex-col rounded-2xl border border-ink-200 bg-ink-50/70 p-3.5 transition-all duration-300 hover:-translate-y-1 hover:border-accent-300 hover:bg-white hover:shadow-card dark:border-ink-800 dark:bg-ink-950/50 dark:hover:border-accent-800 dark:hover:bg-ink-900"
              >
                <span className="flex items-center justify-between">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-900 text-white transition-colors duration-300 group-hover:bg-accent-500">
                    <CatalogIcon name={product.icon} className="h-5 w-5" />
                  </span>
                  <span className="text-xs font-bold text-accent-600 dark:text-accent-400">
                    {product.code}
                  </span>
                </span>
                <span className="mt-3 text-sm font-bold leading-snug text-ink-900 group-hover:text-accent-700 dark:text-white dark:group-hover:text-accent-400">
                  {product.name}
                </span>
                <span className="mt-1 text-xs leading-snug text-ink-500 dark:text-ink-400">
                  {product.features.length} key features
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
