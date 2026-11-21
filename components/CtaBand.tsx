import Link from "next/link";
import { SITE } from "@/lib/site";
import Reveal from "@/components/Reveal";

/**
 * Closing call-to-action band, repeated at the foot of every marketing page.
 *
 * The big gradient button is the single most important element on the site, so
 * it gets its own full-width section with nothing competing for attention.
 */
export default function CtaBand({
  heading = "Ready to stop fighting your systems?",
  sub = "Tell us what is slowing the business down. You will get a straight answer about whether we can help, what it would take, and roughly what it costs — within one business day.",
  buttonLabel = "Get your free consultation",
}: {
  heading?: string;
  sub?: string;
  buttonLabel?: string;
}) {
  return (
    <section className="relative overflow-hidden border-y border-ink-200 bg-ink-950 py-20 sm:py-24 dark:border-ink-800">
      {/* Animated background: drifting blobs plus a faint grid. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="blob left-[-6rem] top-[-4rem] h-80 w-80 animate-drift bg-brand-600/25" />
        <div
          className="blob bottom-[-6rem] right-[-4rem] h-96 w-96 animate-drift bg-accent-500/20"
          style={{ animationDelay: "-8s" }}
        />
        <div className="absolute inset-0 opacity-[0.06] grid-backdrop" />
      </div>

      <div className="container-page relative">
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="eyebrow border-brand-700/60 bg-brand-950/60 text-brand-200">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-400" />
            </span>
            Accepting new projects
          </span>

          <h2 className="mt-6 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
            {heading}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-ink-200">{sub}</p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/contact" className="btn-cta group w-full sm:w-auto">
              {buttonLabel}
              <svg
                className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M4 12h15M13 6l6 6-6 6" />
              </svg>
            </Link>
            <a
              href={`tel:${SITE.phoneHref}`}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-ink-700 bg-ink-900/60 px-6 py-4 text-base font-semibold text-white backdrop-blur transition-all hover:-translate-y-0.5 hover:border-brand-500 hover:text-brand-200 sm:w-auto"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6.5 3.5h2.8l1.4 3.5-2 1.4a10.5 10.5 0 0 0 5 5l1.4-2 3.5 1.4v2.8a1.9 1.9 0 0 1-2.1 1.9A14.6 14.6 0 0 1 4.6 5.6 1.9 1.9 0 0 1 6.5 3.5Z" />
              </svg>
              {SITE.phoneDisplay}
            </a>
          </div>

          <ul className="mx-auto mt-9 flex max-w-xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-ink-300">
            {["No obligation", "Fixed-price quotes", "You own the code"].map((item) => (
              <li key={item} className="flex items-center gap-1.5">
                <svg className="h-4 w-4 text-brand-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.9-9.8a1 1 0 0 0-1.5-1.3l-3 3.5-1.3-1.2a1 1 0 0 0-1.3 1.4l2 2a1 1 0 0 0 1.4-.1l3.7-4.3Z" clipRule="evenodd" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
