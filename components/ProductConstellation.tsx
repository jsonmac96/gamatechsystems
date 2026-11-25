import Link from "next/link";
import { PRODUCTS } from "@/lib/products";
import CatalogIcon from "@/components/CatalogIcon";
import { LogoMark } from "@/components/Logo";

/**
 * Hero visual: the six core products as one integrated system.
 *
 * The GaMatech mark sits at the centre as the shared data every product reads
 * and writes. Each product connects to it by a spoke, along which a slow dash
 * flows to show data moving, and to its neighbours by a ring, so the picture
 * says "these work together" rather than "here are six separate apps".
 *
 * Layout: nodes and lines share one coordinate system in percentages of the
 * diagram box. The SVG stretches to the box (`preserveAspectRatio="none"`,
 * with non-scaling strokes), so the box can be taller on phones without the
 * lines drifting away from the nodes.
 *
 * It doubles as navigation: every node is a real link to its product page.
 * The flowing dashes stop under `prefers-reduced-motion`.
 */

/** Node centres, clockwise from the top, as percentages of the diagram box. */
const POSITIONS = [
  { x: 50, y: 13 },
  { x: 82, y: 31 },
  { x: 82, y: 69 },
  { x: 50, y: 87 },
  { x: 18, y: 69 },
  { x: 18, y: 31 },
] as const;

const HUB = { x: 50, y: 50 } as const;

const RING = POSITIONS.map((p) => `${p.x},${p.y}`).join(" ");

export default function ProductConstellation() {
  return (
    <div className="tilt-3d relative mx-auto w-full max-w-[28rem] lg:mr-0">
      <div
        aria-hidden="true"
        className="absolute -inset-4 -z-10 rounded-[2.25rem] bg-gradient-to-br from-accent-400/25 to-brand-500/20 blur-2xl"
      />

      <div className="rounded-3xl border border-ink-200 bg-white/95 p-4 shadow-[0_2px_6px_rgb(10_16_32/0.05),0_32px_80px_-32px_rgb(10_26_62/0.5),0_60px_120px_-60px_rgb(231_88_10/0.3)] backdrop-blur sm:p-5">
        {/* Header strip */}
        <div className="flex items-center justify-between gap-3 border-b border-ink-200 pb-3">
          <div className="flex items-center gap-2.5">
            <LogoMark className="h-9 w-auto" />
            <div className="leading-tight">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">Core products</p>
              <p className="text-sm font-bold text-ink-900">One foundation, six systems</p>
            </div>
          </div>
          <span className="badge shrink-0 whitespace-nowrap bg-accent-50 text-accent-700">M5–M10</span>
        </div>

        {/* The integration diagram */}
        <div className="relative mt-3 aspect-[4/5] sm:aspect-[6/5]">
          <svg
            aria-hidden="true"
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            fill="none"
          >
            {/* Ring: each system also connects to its neighbours. */}
            <polygon
              points={RING}
              className="stroke-brand-200"
              strokeWidth="1.5"
              strokeDasharray="3 5"
              vectorEffect="non-scaling-stroke"
            />
            {/* Spokes to the shared data, each with a flowing dash on top. */}
            {POSITIONS.map((p, i) => (
              <g key={i}>
                <line
                  x1={p.x}
                  y1={p.y}
                  x2={HUB.x}
                  y2={HUB.y}
                  className="stroke-brand-200"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
                <line
                  x1={p.x}
                  y1={p.y}
                  x2={HUB.x}
                  y2={HUB.y}
                  className="animate-flow stroke-accent-500"
                  strokeWidth="2"
                  strokeLinecap="round"
                  pathLength={100}
                  strokeDasharray="6 14"
                  vectorEffect="non-scaling-stroke"
                  // Alternate direction: data flows both into and out of the hub.
                  style={{ animationDirection: i % 2 === 0 ? "normal" : "reverse" }}
                />
              </g>
            ))}
          </svg>

          {/* Hub: the shared data */}
          <div
            aria-hidden="true"
            className="absolute flex aspect-square w-[22%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-brand-200 bg-white shadow-[0_0_0_6px_rgb(241_244_251),0_18px_40px_-18px_rgb(10_26_62/0.45)]"
            style={{ left: `${HUB.x}%`, top: `${HUB.y}%` }}
          >
            <LogoMark className="h-[36%] w-auto" />
            <span className="mt-1 text-[0.55rem] font-bold leading-none text-brand-800 sm:text-[0.65rem]">
              Shared data
            </span>
          </div>

          {/* The six systems */}
          <ul>
            {PRODUCTS.map((product, index) => {
              const p = POSITIONS[index] ?? HUB;
              return (
                <li
                  key={product.slug}
                  className="absolute w-[27%] -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${p.x}%`, top: `${p.y}%` }}
                >
                  <Link
                    href={`/products/${product.slug}`}
                    className="group flex animate-fade-up flex-col items-center rounded-2xl border border-ink-200 bg-white px-1 py-1.5 text-center shadow-[0_8px_20px_-12px_rgb(10_26_62/0.35)] transition-all duration-300 hover:border-accent-300 hover:shadow-card sm:px-1.5 sm:py-2"
                    style={{ animationDelay: `${350 + index * 110}ms` }}
                  >
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-brand-900 text-white transition-colors duration-300 group-hover:bg-accent-600">
                      <CatalogIcon name={product.icon} className="h-4 w-4" />
                    </span>
                    <span className="mt-1 text-[0.6rem] font-bold leading-none text-accent-700 sm:text-[0.65rem]">
                      {product.code}
                    </span>
                    <span className="mt-0.5 text-[0.65rem] font-bold leading-tight text-ink-900 group-hover:text-accent-700 sm:whitespace-nowrap sm:text-xs">
                      {product.name}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
