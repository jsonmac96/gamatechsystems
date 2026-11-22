import Link from "next/link";
import type { Metadata } from "next";
import { COMPANY_FAQS, INDUSTRIES, PROOF_POINTS, SITE } from "@/lib/site";
import { PRODUCTS } from "@/lib/products";
import { SERVICES } from "@/lib/services";
import { companyFaqSchema, pageMetadata } from "@/lib/seo";
import { listPublishedPosts } from "@/lib/posts";
import { issueFormToken } from "@/lib/form-token";
import { iso } from "@/lib/db";
import JsonLd from "@/components/JsonLd";
import Reveal from "@/components/Reveal";
import CatalogIcon from "@/components/CatalogIcon";
import FaqList from "@/components/FaqList";
import CtaBand from "@/components/CtaBand";
import LeadForm from "@/components/LeadForm";
import ProductConstellation from "@/components/ProductConstellation";

export const metadata: Metadata = pageMetadata({
  title: "Business Systems for SMEs Worldwide",
  description:
    "POS, ERP, payroll, service desk and CRM for growing businesses, plus the websites, software and marketing around them. Based in the Philippines, serving worldwide.",
  path: "/",
  keywords: [
    "business systems for SMEs",
    "restaurant and retail POS",
    "ERP payroll CRM software",
    "SME software company",
  ],
});

/**
 * Rendered per request. The root layout reads `headers()` for the CSP nonce,
 * so this page cannot be statically prerendered; the only data it reads is a
 * local indexed SQLite query for the three latest posts.
 */
export const dynamic = "force-dynamic";

export default async function HomePage() {
  // The latest-articles strip is optional: if the database is unreachable the
  // catalog still renders, just without it.
  const posts = await listPublishedPosts(3).catch(() => []);

  return (
    <>
      <JsonLd data={companyFaqSchema()} />

      {/* ------------------------------------------------------------------ */}
      {/* Hero                                                                */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative overflow-hidden pb-20 pt-14 sm:pb-28 sm:pt-20">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-50 via-white to-white dark:from-brand-950 dark:via-ink-950 dark:to-ink-950" />
          <div className="blob left-[-10rem] top-[-8rem] h-[26rem] w-[26rem] animate-drift bg-brand-300/35 dark:bg-brand-800/30" />
          <div
            className="blob right-[-8rem] top-[4rem] h-[22rem] w-[22rem] animate-drift bg-accent-400/20 dark:bg-accent-900/25"
            style={{ animationDelay: "-11s" }}
          />
          <div className="absolute inset-0 opacity-[0.35] grid-backdrop [mask-image:radial-gradient(ellipse_at_top,black,transparent_72%)]" />
        </div>

        <div className="container-page">
          <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-6">
              <Reveal>
                <span className="eyebrow">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-500 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-500" />
                  </span>
                  Based in the Philippines · Serving clients worldwide
                </span>
              </Reveal>

              {/* Exactly one H1 per page. */}
              <Reveal delay={80}>
                <h1 className="h1 mt-6">
                  Business systems that{" "}
                  <span className="relative inline-block">
                    <span className="gradient-text animate-gradient-pan bg-[length:220%_auto]">
                      run themselves
                    </span>
                    <svg
                      className="absolute -bottom-2 left-0 h-3 w-full text-accent-400/80"
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
                  </span>
                </h1>
              </Reveal>

              <Reveal delay={160}>
                <p className="lede mt-7 max-w-xl">
                  Six core systems built for growing businesses — restaurant and retail POS, ERP,
                  payroll and HRIS, service desk and CRM. Plus the websites, software, analytics
                  and marketing that keep customers coming to them.
                </p>
              </Reveal>

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
                  <Link href="/products" className="btn-secondary">
                    See the products
                  </Link>
                </div>
              </Reveal>

              <Reveal delay={320}>
                <ul className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2.5 text-sm text-ink-600 dark:text-ink-300">
                  {[
                    "Reply within 1 business day",
                    "Fixed implementation pricing",
                    "Your data, exportable any time",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-1.5">
                      <svg className="h-4 w-4 shrink-0 text-accent-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.9-9.8a1 1 0 0 0-1.5-1.3l-3 3.5-1.3-1.2a1 1 0 0 0-1.3 1.4l2 2a1 1 0 0 0 1.4-.1l3.7-4.3Z" clipRule="evenodd" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>

            {/* The catalogue itself, as the hero visual */}
            <Reveal variant="scale" delay={220} className="lg:col-span-6">
              <ProductConstellation />
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
            GaMatech Systems by the numbers
          </h2>
          <dl className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {PROOF_POINTS.map((point, index) => (
              <Reveal key={point.label} delay={index * 90} className="text-center lg:text-left">
                <dt className="sr-only">{point.label}</dt>
                <dd>
                  <span className="block text-3xl font-bold tracking-tight text-accent-600 sm:text-4xl dark:text-accent-400">
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
      {/* Core products                                                       */}
      {/* ------------------------------------------------------------------ */}
      <section aria-labelledby="products-heading" className="py-20 sm:py-28">
        <div className="container-page">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">Core products</span>
            <h2 id="products-heading" className="h2 mt-5">
              Six systems. One foundation.
            </h2>
            <p className="lede mt-5">
              Built and maintained in-house, so the ones you adopt share data instead of needing
              another integration project.
            </p>
          </Reveal>

          <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PRODUCTS.map((product, index) => (
              <Reveal as="li" key={product.slug} delay={index * 70}>
                <Link
                  href={`/products/${product.slug}`}
                  className="card-interactive group flex h-full flex-col"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-900 text-white transition-all duration-300 group-hover:scale-110 group-hover:bg-accent-500">
                      <CatalogIcon name={product.icon} />
                    </span>
                    <span className="rounded-lg bg-accent-50 px-2.5 py-1 text-xs font-bold text-accent-700 dark:bg-accent-950/60 dark:text-accent-300">
                      {product.code}
                    </span>
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-ink-900 dark:text-white">
                    {product.name}
                  </h3>
                  <p className="mt-2.5 flex-1 text-sm leading-relaxed text-ink-600 dark:text-ink-300">
                    {product.summary}
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
          </ul>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Services                                                            */}
      {/* ------------------------------------------------------------------ */}
      <section aria-labelledby="services-heading" className="border-y border-ink-200 bg-ink-50/60 py-20 sm:py-24 dark:border-ink-800 dark:bg-ink-900/40">
        <div className="container-page">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">Services</span>
            <h2 id="services-heading" className="h2 mt-5">
              And the work that goes around them
            </h2>
            <p className="lede mt-5">
              A system nobody can find and nobody was trained on does not help. These six services
              cover the rest.
            </p>
          </Reveal>

          <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((service, index) => (
              <Reveal as="li" key={service.slug} delay={index * 65}>
                <Link
                  href={`/services/${service.slug}`}
                  className="group flex h-full items-start gap-4 rounded-2xl border border-ink-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent-300 hover:shadow-card dark:border-ink-800 dark:bg-ink-900/60 dark:hover:border-accent-800"
                >
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-50 text-accent-600 transition-colors group-hover:bg-accent-500 group-hover:text-white dark:bg-accent-950/50 dark:text-accent-400">
                    <CatalogIcon name={service.icon} className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block font-bold text-ink-900 group-hover:text-accent-700 dark:text-white dark:group-hover:text-accent-400">
                      {service.name}
                    </span>
                    <span className="mt-1.5 block text-sm leading-relaxed text-ink-600 dark:text-ink-300">
                      {service.summary}
                    </span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </ul>
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
      <section id="enquire" aria-labelledby="enquire-heading" className="scroll-mt-28 py-20 sm:py-24">
        <div className="container-page">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <Reveal variant="left" className="lg:col-span-5">
              <span className="eyebrow">Free consultation</span>
              <h2 id="enquire-heading" className="h2 mt-5">
                Tell us how the business runs today
              </h2>
              <p className="lede mt-5">
                No sales script, no 40-slide deck. A short conversation about your operation, then
                a straight answer about which system would help and what it would take.
              </p>

              <ul className="mt-9 space-y-5">
                {[
                  { title: "You will hear back within one business day", detail: "Usually the same day, from a person who read what you wrote." },
                  { title: "We will tell you if you do not need us yet", detail: "If a cheaper fix or an existing tool covers it, we will say which." },
                  { title: "Implementation is priced before it starts", detail: "The consultation is free and the scope is fixed before any work begins." },
                ].map((item) => (
                  <li key={item.title} className="flex gap-4">
                    <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-50 text-accent-600 dark:bg-accent-950/50 dark:text-accent-400">
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
                  <a href={`tel:${SITE.phoneHref}`} className="font-semibold text-accent-700 hover:underline dark:text-accent-400">
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
                      dateTime={iso(post.published_at ?? post.created_at)}
                      className="text-xs font-semibold uppercase tracking-wider text-accent-600 dark:text-accent-400"
                    >
                      {formatDate(post.published_at ?? post.created_at)}
                    </time>
                    <h3 className="mt-3 text-lg font-bold leading-snug text-ink-900 group-hover:text-accent-700 dark:text-white dark:group-hover:text-accent-400">
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

function formatDate(value: Date): string {
  return value.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "Asia/Manila",
  });
}
