import Link from "next/link";
import type { Metadata } from "next";
import {
  COMPANY_FAQS,
  INDUSTRIES,
  PROOF_POINTS,
  SERVICES,
  SITE,
} from "@/lib/site";
import { companyFaqSchema, pageMetadata } from "@/lib/seo";
import { listPublishedPosts } from "@/lib/posts";
import JsonLd from "@/components/JsonLd";
import Reveal from "@/components/Reveal";
import ServiceIcon from "@/components/ServiceIcon";
import FaqList from "@/components/FaqList";
import CtaBand from "@/components/CtaBand";
import LeadForm from "@/components/LeadForm";
import { issueFormToken } from "@/lib/form-token";

export const metadata: Metadata = pageMetadata({
  title: "Software & Automation for Philippine SMEs",
  description:
    "Custom software, automation, websites, SEO, AEO and marketing for Philippine SMEs. Fixed-price scoping, releases every two weeks, and you own the code.",
  path: "/",
  keywords: [
    "software company Philippines",
    "custom software SME Philippines",
    "business automation Philippines",
    "web development Philippines",
    "SEO AEO Philippines",
  ],
});

/**
 * Rendered per request. The root layout reads `headers()` for the CSP nonce,
 * so this page cannot be statically prerendered; the only data it reads is a
 * local indexed SQLite query for the three latest posts.
 */
export const dynamic = "force-dynamic";

export default function HomePage() {
  // Latest insights, if any have been published through the admin.
  const posts = listPublishedPosts(3);

  return (
    <>
      <JsonLd data={companyFaqSchema()} />

      {/* ------------------------------------------------------------------ */}
      {/* Hero                                                                */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative overflow-hidden pb-20 pt-14 sm:pb-28 sm:pt-20">
        {/* Animated backdrop */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-50/80 via-white to-white dark:from-ink-900 dark:via-ink-950 dark:to-ink-950" />
          <div className="blob left-[-10rem] top-[-8rem] h-[26rem] w-[26rem] animate-drift bg-brand-300/40 dark:bg-brand-800/30" />
          <div
            className="blob right-[-8rem] top-[4rem] h-[22rem] w-[22rem] animate-drift bg-accent-400/25 dark:bg-accent-600/15"
            style={{ animationDelay: "-11s" }}
          />
          <div className="absolute inset-0 opacity-[0.35] grid-backdrop [mask-image:radial-gradient(ellipse_at_top,black,transparent_72%)]" />
        </div>

        <div className="container-page">
          <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-10">
            {/* Copy */}
            <div className="lg:col-span-7">
              <Reveal>
                <span className="eyebrow">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-500 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
                  </span>
                  Philippine software company · SME specialists
                </span>
              </Reveal>

              {/* Exactly one H1 per page. */}
              <Reveal delay={80}>
                <h1 className="h1 mt-6">
                  Software and systems that{" "}
                  <span className="relative inline-block">
                    <span className="gradient-text animate-gradient-pan bg-[length:220%_auto]">
                      run your business
                    </span>
                    <svg
                      className="absolute -bottom-2 left-0 h-3 w-full text-brand-400/70"
                      viewBox="0 0 220 12"
                      fill="none"
                      preserveAspectRatio="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M2 9.5C40 3.5 80 2.5 118 5.5c38 3 62 4 100 1"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        className="animate-dash"
                        style={{ strokeDasharray: 480 }}
                      />
                    </svg>
                  </span>{" "}
                  — not the other way round.
                </h1>
              </Reveal>

              <Reveal delay={160}>
                <p className="lede mt-7 max-w-xl">
                  We build the custom software, automation and websites that Philippine SMEs
                  actually run on — then bring customers to them with SEO, AEO and marketing.
                  One accountable team, fixed-price scoping, and you own everything we build.
                </p>
              </Reveal>

              {/* Big CTA */}
              <Reveal delay={240}>
                <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Link href="/contact" className="btn-cta group">
                    Get your free consultation
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
                  <Link href="/services" className="btn-secondary">
                    Explore our services
                  </Link>
                </div>
              </Reveal>

              <Reveal delay={320}>
                <ul className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2.5 text-sm text-ink-600 dark:text-ink-300">
                  {[
                    "Reply within 1 business day",
                    "Fixed-price quotes",
                    "No lock-in — you own the code",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-1.5">
                      <svg className="h-4 w-4 shrink-0 text-brand-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.9-9.8a1 1 0 0 0-1.5-1.3l-3 3.5-1.3-1.2a1 1 0 0 0-1.3 1.4l2 2a1 1 0 0 0 1.4-.1l3.7-4.3Z" clipRule="evenodd" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>

            {/* Animated dashboard mock — pure SVG/CSS, so nothing to download */}
            <Reveal variant="scale" delay={220} className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="absolute -inset-4 -z-10 rounded-[2.5rem] bg-gradient-to-br from-brand-400/25 to-accent-400/20 blur-2xl" />
                <div className="animate-float rounded-3xl border border-ink-200 bg-white/95 p-6 shadow-lift backdrop-blur dark:border-ink-800 dark:bg-ink-900/90">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                        Operations dashboard
                      </p>
                      <p className="mt-1 text-sm font-bold text-ink-900 dark:text-white">
                        Manual hours removed
                      </p>
                    </div>
                    <span className="badge bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-200">
                      Live
                    </span>
                  </div>

                  {/* Bar chart */}
                  <div className="mt-6 flex h-36 items-end gap-2.5" role="img" aria-label="Bar chart showing manual work hours falling month over month after automation">
                    {[28, 42, 36, 58, 72, 64, 88, 96].map((height, index) => (
                      <span
                        key={index}
                        className="flex-1 origin-bottom animate-bar-grow rounded-t-lg bg-gradient-to-t from-brand-500 to-brand-300 dark:from-brand-600 dark:to-brand-400"
                        style={{ height: `${height}%`, animationDelay: `${index * 90 + 300}ms` }}
                      />
                    ))}
                  </div>

                  <div className="mt-6 space-y-3">
                    {[
                      { label: "Order-to-invoice", value: "Automated" },
                      { label: "Stock sync", value: "Every 5 min" },
                      { label: "Month-end close", value: "1 day (was 7)" },
                    ].map((row, index) => (
                      <div
                        key={row.label}
                        className="flex animate-fade-up items-center justify-between rounded-xl bg-ink-50 px-3.5 py-2.5 dark:bg-ink-950/60"
                        style={{ animationDelay: `${600 + index * 140}ms` }}
                      >
                        <span className="text-sm text-ink-600 dark:text-ink-300">{row.label}</span>
                        <span className="text-sm font-semibold text-brand-700 dark:text-brand-300">
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Proof points                                                        */}
      {/* ------------------------------------------------------------------ */}
      <section aria-labelledby="proof-heading" className="border-y border-ink-200 bg-ink-50/60 py-12 dark:border-ink-800 dark:bg-ink-900/40">
        <div className="container-page">
          <h2 id="proof-heading" className="sr-only">
            GamaTech Systems by the numbers
          </h2>
          <dl className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {PROOF_POINTS.map((point, index) => (
              <Reveal key={point.label} delay={index * 90} className="text-center lg:text-left">
                <dt className="sr-only">{point.label}</dt>
                <dd>
                  <span className="block text-3xl font-bold tracking-tight text-brand-600 sm:text-4xl dark:text-brand-300">
                    {point.value}
                  </span>
                  <span className="mt-1.5 block text-sm leading-snug text-ink-600 dark:text-ink-300">
                    {point.label}
                  </span>
                </dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Services                                                            */}
      {/* ------------------------------------------------------------------ */}
      <section aria-labelledby="services-heading" className="py-20 sm:py-28">
        <div className="container-page">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">What we do</span>
            <h2 id="services-heading" className="h2 mt-5">
              Seven services. One accountable team.
            </h2>
            <p className="lede mt-5">
              Build the system, then fill it with customers. Most clients start with one service
              and grow into the others — which is why we keep them under one roof.
            </p>
          </Reveal>

          <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((service, index) => (
              <Reveal as="li" key={service.slug} delay={index * 70}>
                <Link
                  href={`/services/${service.slug}`}
                  className="card-interactive group flex h-full flex-col focus-visible:ring-2"
                >
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 transition-all duration-300 group-hover:scale-110 group-hover:bg-brand-500 group-hover:text-white dark:bg-brand-950/60 dark:text-brand-300">
                    <ServiceIcon name={service.icon} />
                  </span>
                  <h3 className="mt-5 text-lg font-bold text-ink-900 dark:text-white">
                    {service.name}
                  </h3>
                  <p className="mt-2.5 flex-1 text-sm leading-relaxed text-ink-600 dark:text-ink-300">
                    {service.summary}
                  </p>
                  <span className="btn-ghost mt-5">
                    Learn more
                    <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M3 10a1 1 0 0 1 1-1h9.6l-3.3-3.3a1 1 0 0 1 1.4-1.4l5 5a1 1 0 0 1 0 1.4l-5 5a1 1 0 0 1-1.4-1.4L13.6 11H4a1 1 0 0 1-1-1Z" clipRule="evenodd" />
                    </svg>
                  </span>
                </Link>
              </Reveal>
            ))}

            {/* Eighth tile keeps the 3-column grid balanced and sells the bundle */}
            <Reveal as="li" delay={SERVICES.length * 70}>
              <div className="flex h-full flex-col justify-between rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 p-7 text-white shadow-glow">
                <div>
                  <h3 className="text-lg font-bold">Not sure where to start?</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-brand-50">
                    Most owners know something is broken but not which fix pays back first. A
                    30-minute call is usually enough for us to tell you.
                  </p>
                </div>
                <Link
                  href="/contact"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-brand-800 transition-all hover:-translate-y-0.5 hover:shadow-lift"
                >
                  Book a free call
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M3 10a1 1 0 0 1 1-1h9.6l-3.3-3.3a1 1 0 0 1 1.4-1.4l5 5a1 1 0 0 1 0 1.4l-5 5a1 1 0 0 1-1.4-1.4L13.6 11H4a1 1 0 0 1-1-1Z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            </Reveal>
          </ul>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* How we work                                                         */}
      {/* ------------------------------------------------------------------ */}
      <section aria-labelledby="process-heading" className="relative overflow-hidden border-y border-ink-200 bg-ink-50/60 py-20 sm:py-28 dark:border-ink-800 dark:bg-ink-900/40">
        <div className="container-page">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">How we work</span>
            <h2 id="process-heading" className="h2 mt-5">
              You see the price before you commit to the build
            </h2>
            <p className="lede mt-5">
              The riskiest part of buying software is not knowing what it will cost or whether it
              will work. We take that off the table first.
            </p>
          </Reveal>

          <ol className="mt-14 grid gap-6 lg:grid-cols-4">
            {[
              { title: "Free consultation", detail: "A 30-minute call. We ask what is actually slowing you down and tell you honestly whether we are the right fit." },
              { title: "Paid discovery sprint", detail: "One to two weeks producing a written scope, a clickable prototype and a fixed price. Yours to keep either way." },
              { title: "Build in two-week slices", detail: "Working software on a staging URL every fortnight. You review as it is built, not at the end." },
              { title: "Launch and hand over", detail: "Phased cutover, training, documentation and credentials. Then support on retainer — or a clean goodbye." },
            ].map((step, index) => (
              <Reveal as="li" key={step.title} delay={index * 110} className="relative">
                <div className="card h-full">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-ink-900 text-sm font-bold text-white dark:bg-brand-500 dark:text-ink-950">
                    {index + 1}
                  </span>
                  <h3 className="mt-4 text-base font-bold text-ink-900 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-600 dark:text-ink-300">
                    {step.detail}
                  </p>
                </div>
                {index < 3 ? (
                  <svg className="absolute -right-4 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-brand-400 lg:block" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M3 10a1 1 0 0 1 1-1h9.6l-3.3-3.3a1 1 0 0 1 1.4-1.4l5 5a1 1 0 0 1 0 1.4l-5 5a1 1 0 0 1-1.4-1.4L13.6 11H4a1 1 0 0 1-1-1Z" clipRule="evenodd" />
                  </svg>
                ) : null}
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Industries marquee                                                  */}
      {/* ------------------------------------------------------------------ */}
      <section aria-labelledby="industries-heading" className="py-16">
        <div className="container-page">
          <h2 id="industries-heading" className="text-center text-sm font-semibold uppercase tracking-[0.16em] text-ink-500 dark:text-ink-400">
            Industries we know well
          </h2>
        </div>
        <div className="mask-fade-x pause-on-hover mt-8 overflow-hidden">
          <ul className="flex w-max animate-marquee items-center gap-4">
            {[...INDUSTRIES, ...INDUSTRIES].map((industry, index) => (
              <li
                key={`${industry}-${index}`}
                aria-hidden={index >= INDUSTRIES.length}
                className="whitespace-nowrap rounded-2xl border border-ink-200 bg-white px-6 py-3.5 text-sm font-semibold text-ink-700 shadow-sm dark:border-ink-800 dark:bg-ink-900 dark:text-ink-200"
              >
                {industry}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Lead form                                                           */}
      {/* ------------------------------------------------------------------ */}
      <section id="enquire" aria-labelledby="enquire-heading" className="scroll-mt-24 py-20 sm:py-24">
        <div className="container-page">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <Reveal variant="left" className="lg:col-span-5">
              <span className="eyebrow">Free consultation</span>
              <h2 id="enquire-heading" className="h2 mt-5">
                Tell us what is broken
              </h2>
              <p className="lede mt-5">
                No sales script, no 40-slide deck. A short conversation about your operation, then
                a straight answer about whether we can help and what it would take.
              </p>

              <ul className="mt-9 space-y-5">
                {[
                  { title: "You will hear back within one business day", detail: "Usually the same day, from a person who read what you wrote." },
                  { title: "We will say no when we should", detail: "If an off-the-shelf tool fits better, we will tell you which one." },
                  { title: "Nothing is billed until scope is agreed", detail: "The consultation is free, and discovery is fixed-price." },
                ].map((item) => (
                  <li key={item.title} className="flex gap-4">
                    <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300">
                      <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="m5 13 4.5 4.5L19 7.5" />
                      </svg>
                    </span>
                    <div>
                      <p className="font-semibold text-ink-900 dark:text-white">{item.title}</p>
                      <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">{item.detail}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-9 rounded-2xl border border-ink-200 bg-ink-50/80 p-5 dark:border-ink-800 dark:bg-ink-900/60">
                <p className="text-sm font-semibold text-ink-900 dark:text-white">Prefer to talk now?</p>
                <div className="mt-2 flex flex-col gap-1 text-sm">
                  <a href={`tel:${SITE.phoneHref}`} className="font-semibold text-brand-700 hover:underline dark:text-brand-300">
                    {SITE.phoneDisplay}
                  </a>
                  <a href={`mailto:${SITE.email}`} className="text-ink-600 hover:underline dark:text-ink-300">
                    {SITE.email}
                  </a>
                  <span className="text-ink-500 dark:text-ink-400">{SITE.hours}</span>
                </div>
              </div>
            </Reveal>

            <Reveal variant="right" delay={120} className="lg:col-span-7">
              <div className="card sm:p-9">
                <LeadForm formToken={issueFormToken()} />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* FAQ — also the AEO groundwork, mirrored in FAQPage schema           */}
      {/* ------------------------------------------------------------------ */}
      <section aria-labelledby="faq-heading" className="border-t border-ink-200 py-20 sm:py-24 dark:border-ink-800">
        <div className="container-page">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">Straight answers</span>
            <h2 id="faq-heading" className="h2 mt-5">
              Questions owners ask us first
            </h2>
          </Reveal>
          <Reveal delay={120} className="mx-auto mt-12 max-w-3xl">
            <FaqList faqs={COMPANY_FAQS} />
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Latest insights                                                     */}
      {/* ------------------------------------------------------------------ */}
      {posts.length > 0 ? (
        <section aria-labelledby="insights-heading" className="border-t border-ink-200 py-20 dark:border-ink-800">
          <div className="container-page">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="eyebrow">Insights</span>
                <h2 id="insights-heading" className="h2 mt-4">
                  Latest from the team
                </h2>
              </div>
              <Link href="/blog" className="btn-ghost">
                All articles
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M3 10a1 1 0 0 1 1-1h9.6l-3.3-3.3a1 1 0 0 1 1.4-1.4l5 5a1 1 0 0 1 0 1.4l-5 5a1 1 0 0 1-1.4-1.4L13.6 11H4a1 1 0 0 1-1-1Z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>

            <ul className="mt-10 grid gap-6 md:grid-cols-3">
              {posts.map((post, index) => (
                <Reveal as="li" key={post.id} delay={index * 90}>
                  <Link href={`/blog/${post.slug}`} className="card-interactive group flex h-full flex-col">
                    <time
                      dateTime={post.published_at ?? post.created_at}
                      className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400"
                    >
                      {formatDate(post.published_at ?? post.created_at)}
                    </time>
                    <h3 className="mt-3 text-lg font-bold leading-snug text-ink-900 group-hover:text-brand-700 dark:text-white dark:group-hover:text-brand-300">
                      {post.title}
                    </h3>
                    <p className="mt-2.5 flex-1 text-sm leading-relaxed text-ink-600 dark:text-ink-300">
                      {post.excerpt}
                    </p>
                    <span className="btn-ghost mt-5">Read article</span>
                  </Link>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <CtaBand />
    </>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "Asia/Manila",
  });
}
