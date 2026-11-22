import Link from "next/link";
import type { Metadata } from "next";
import { INDUSTRIES, PROOF_POINTS, SITE } from "@/lib/site";
import { PRODUCTS } from "@/lib/products";
import { SERVICES } from "@/lib/services";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import Reveal from "@/components/Reveal";
import Breadcrumbs from "@/components/Breadcrumbs";
import CtaBand from "@/components/CtaBand";

export const metadata: Metadata = pageMetadata({
  title: "About — Who We Are and How We Work",
  description:
    "Who we are and how we work. GaMatech Systems builds the POS, ERP, payroll, service desk and CRM systems SMEs run on, from the Philippines for clients worldwide.",
  path: "/about",
  keywords: ["about GaMatech Systems", "software company Philippines", "SME technology partner", "business systems for SMEs"],
});

const PRINCIPLES = [
  {
    title: "We quote a fixed price, then hold it",
    detail:
      "Open-ended hourly billing transfers all the risk to you. We run a paid discovery sprint, produce a written scope, and quote a number we stand behind. If we underestimate, that is our problem to absorb.",
  },
  {
    title: "You own everything",
    detail:
      "Code in your repository, infrastructure in your name, documentation written for a developer who has never met us. Lock-in is a business model we have chosen not to have.",
  },
  {
    title: "We will tell you not to build",
    detail:
      "If one of our products fits, we will not quote you for custom software. If nothing we make fits, we will say that too and point you at whoever does. It is the cheapest reputation we can buy.",
  },
  {
    title: "Security is not a phase",
    detail:
      "Parameterised queries, hashed credentials, server-side authorisation, rate-limited logins, audited dependencies and a content security policy — on every project, from the first commit, not after an incident.",
  },
  {
    title: "Working software every two weeks",
    detail:
      "You see progress on a real URL every fortnight. No six-month silence followed by a reveal that misses the point.",
  },
  {
    title: "Plain language, always",
    detail:
      "If we cannot explain a technical decision in terms of what it costs you or earns you, we have not understood it well enough to charge you for it.",
  },
];

export default function AboutPage() {
  const aboutSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: `About ${SITE.name}`,
    url: `${SITE.url}/about`,
    description: SITE.description,
    mainEntity: { "@id": `${SITE.url}/#organization` },
  };

  return (
    <>
      <JsonLd
        data={[
          aboutSchema,
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "About", path: "/about" },
          ]),
        ]}
      />

      <section className="relative overflow-hidden py-16 sm:py-24">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-50 to-white dark:from-brand-950 dark:to-ink-950" />
          <div className="blob right-[-7rem] top-[-5rem] h-72 w-72 animate-drift bg-accent-300/25 dark:bg-accent-900/20" />
        </div>

        <div className="container-page">
          <Breadcrumbs trail={[{ name: "Home", href: "/" }, { name: "About" }]} />

          <Reveal className="mt-8 max-w-3xl">
            <span className="eyebrow">About us</span>
            <h1 className="h1 mt-5">
              A product company built for the way SMEs actually buy software
            </h1>
            <p className="lede mt-6">
              Enterprise vendors want a procurement committee. Freelance marketplaces want you
              to manage the project yourself. Neither fits a 40-person distributor in Quezon City
              whose month-end close takes a week. That gap is what GaMatech Systems exists to
              fill.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Story */}
      <section aria-labelledby="story-heading" className="pb-20">
        <div className="container-page">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-7">
              <h2 id="story-heading" className="h2">
                What we do, in one paragraph
              </h2>
              <div className="mt-6 space-y-5 prose-body">
                <p>
                  We build and maintain six systems a growing business runs on: the Restaurant
                  and Retail Suites at the till, an ERP behind them, Payroll &amp; HRIS for the
                  team, Triage for service requests and a CRM for the pipeline. Around those sit
                  six services — websites and infrastructure, custom software, AI analytics and
                  training, Google Ads, SEO and e-commerce growth.
                </p>
                <p>
                  Most of our clients arrive with the same symptom: the business has outgrown its
                  spreadsheets, and the software that was supposed to replace them only fits
                  two-thirds of the workflow. The remaining third is where the margin leaks —
                  double entry, manual reconciliation, follow-ups that depend on somebody
                  remembering.
                </p>
                <p>
                  We start by measuring that leak rather than guessing at it. A paid discovery
                  sprint maps the real workflow, puts hours and peso figures against each manual
                  handoff, and produces a fixed-price plan. Sometimes the answer is a ₱60,000
                  automation rather than a ₱900,000 platform. We would rather sell you the small
                  thing that works.
                </p>
                <p>
                  Since {SITE.founded} we have put systems into restaurants, retailers,
                  distributors, clinics, professional services firms and manufacturers, in the Philippines
                  and beyond. The work is deliberately unglamorous: stock that reconciles,
                  payroll that lands correctly, food cost you can see during service, and
                  websites that load in under a second and actually produce enquiries.
                </p>
              </div>
            </Reveal>

            <Reveal variant="right" delay={120} className="lg:col-span-5">
              <div className="card sm:p-8">
                <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-ink-500 dark:text-ink-400">
                  At a glance
                </h2>
                <dl className="mt-6 space-y-5">
                  {PROOF_POINTS.map((point) => (
                    <div key={point.label} className="border-b border-ink-200 pb-4 last:border-0 last:pb-0 dark:border-ink-800">
                      <dt className="text-2xl font-bold text-accent-600 dark:text-accent-400">
                        {point.value}
                      </dt>
                      <dd className="mt-1 text-sm text-ink-600 dark:text-ink-300">{point.label}</dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-7 border-t border-ink-200 pt-6 dark:border-ink-800">
                  <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-ink-500 dark:text-ink-400">
                    Where we work
                  </h3>
                  <p className="mt-3 text-sm text-ink-600 dark:text-ink-300">
                    Based in {SITE.address.city}, {SITE.address.countryName}. Remote-first and working with clients worldwide, with
                    on-site discovery workshops and launch training where a project warrants it.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section aria-labelledby="principles-heading" className="border-y border-ink-200 bg-ink-50/60 py-20 sm:py-24 dark:border-ink-800 dark:bg-ink-900/40">
        <div className="container-page">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">How we operate</span>
            <h2 id="principles-heading" className="h2 mt-5">
              Six commitments we will be held to
            </h2>
            <p className="lede mt-5">
              These are not values on a wall. Each one is something you can check us against
              during a project.
            </p>
          </Reveal>

          <ul className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {PRINCIPLES.map((principle, index) => (
              <Reveal as="li" key={principle.title} delay={index * 70}>
                <div className="card h-full">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-accent-50 text-sm font-bold text-accent-700 dark:bg-accent-950/60 dark:text-accent-400">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-4 text-base font-bold text-ink-900 dark:text-white">
                    {principle.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-ink-600 dark:text-ink-300">
                    {principle.detail}
                  </p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* Industries + services */}
      <section aria-labelledby="industries-heading" className="py-20">
        <div className="container-page">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <Reveal>
              <h2 id="industries-heading" className="h2">
                Industries we know well enough to be useful on day one
              </h2>
              <p className="lede mt-5">
                Domain knowledge shortens discovery. These are the sectors where we already
                understand the vocabulary, the statutory requirements and the usual bottlenecks.
              </p>
              <ul className="mt-8 flex flex-wrap gap-2.5">
                {INDUSTRIES.map((industry) => (
                  <li
                    key={industry}
                    className="rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm font-medium text-ink-700 dark:border-ink-800 dark:bg-ink-900 dark:text-ink-200"
                  >
                    {industry}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal variant="right" delay={110}>
              <h2 className="h2">Explore what we build</h2>
              <ul className="mt-8 space-y-3">
                {PRODUCTS.map((service) => (
                  <li key={service.slug}>
                    <Link
                      href={`/products/${service.slug}`}
                      className="group flex items-center justify-between gap-4 rounded-2xl border border-ink-200 bg-white px-5 py-4 transition-all hover:-translate-y-0.5 hover:border-accent-300 hover:shadow-card dark:border-ink-800 dark:bg-ink-900/60 dark:hover:border-accent-800"
                    >
                      <span>
                        <span className="block font-semibold text-ink-900 group-hover:text-accent-700 dark:text-white dark:group-hover:text-accent-400">
                          {service.name}
                        </span>
                        <span className="mt-0.5 block text-sm text-ink-500 dark:text-ink-400">
                          {service.summary.split(/[—:.]/)[0]?.trim()}
                        </span>
                      </span>
                      <svg className="h-5 w-5 shrink-0 text-accent-500 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M3 10a1 1 0 0 1 1-1h9.6l-3.3-3.3a1 1 0 0 1 1.4-1.4l5 5a1 1 0 0 1 0 1.4l-5 5a1 1 0 0 1-1.4-1.4L13.6 11H4a1 1 0 0 1-1-1Z" clipRule="evenodd" />
                      </svg>
                    </Link>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      <CtaBand
        heading="Let's find out whether we are a fit"
        sub="A 30-minute call, no deck, no obligation. Worst case you leave with a clearer view of your own problem."
      />
    </>
  );
}
