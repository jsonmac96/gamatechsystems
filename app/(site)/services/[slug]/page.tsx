import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getService, SERVICES } from "@/lib/services";
import { SITE } from "@/lib/site";
import {
  breadcrumbSchema,
  faqSchema,
  pageMetadata,
  serviceSchema,
} from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import Reveal from "@/components/Reveal";
import CatalogIcon from "@/components/CatalogIcon";
import FaqList from "@/components/FaqList";
import Breadcrumbs from "@/components/Breadcrumbs";
import LeadForm from "@/components/LeadForm";
import { issueFormToken } from "@/lib/form-token";

type Params = { slug: string };

/**
 * Rendered per request, like every page under the root layout, which reads
 * `headers()` for the per-request CSP nonce. Unknown slugs fall through to
 * `notFound()` below, so there is no soft 404.
 */
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return { title: "Service not found", robots: { index: false, follow: false } };

  return pageMetadata({
    title: service.metaTitle,
    description: service.metaDescription,
    path: `/services/${service.slug}`,
    keywords: service.keywords,
  });
}

export default async function ServicePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const pageUrl = `${SITE.url}/services/${service.slug}`;
  const others = SERVICES.filter((s) => s.slug !== service.slug);

  return (
    <>
      <JsonLd
        data={[
          serviceSchema(service),
          faqSchema(service.faqs, pageUrl),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Services", path: "/services" },
            { name: service.name, path: `/services/${service.slug}` },
          ]),
        ]}
      />

      {/* Hero */}
      <section className="relative overflow-hidden py-14 sm:py-20">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-50 to-white dark:from-brand-950 dark:to-ink-950" />
          <div className="blob left-[-8rem] top-[-6rem] h-80 w-80 animate-drift bg-accent-300/25 dark:bg-accent-900/20" />
          <div className="absolute inset-0 opacity-25 grid-backdrop [mask-image:radial-gradient(ellipse_at_top_left,black,transparent_70%)]" />
        </div>

        <div className="container-page">
          <Breadcrumbs
            trail={[
              { name: "Home", href: "/" },
              { name: "Services", href: "/services" },
              { name: service.name },
            ]}
          />

          <div className="mt-8 grid gap-12 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-7">
              <Reveal>
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-500 text-white shadow-glow">
                  <CatalogIcon name={service.icon} className="h-7 w-7" />
                </span>
                <h1 className="h1 mt-6">{service.longName}</h1>
              </Reveal>

              <Reveal delay={90}>
                <div className="mt-7 space-y-5">
                  {service.intro.map((paragraph) => (
                    <p key={paragraph.slice(0, 40)} className="lede">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </Reveal>

              <Reveal delay={170}>
                <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Link href="#enquire" className="btn-cta group">
                    Get a free consultation
                    <svg className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M4 12h15M13 6l6 6-6 6" />
                    </svg>
                  </Link>
                  <a href={`tel:${SITE.phoneHref}`} className="btn-secondary">
                    Call {SITE.phoneDisplay}
                  </a>
                </div>
              </Reveal>
            </div>

            <Reveal variant="right" delay={140} className="lg:col-span-5">
              <div className="card border-ink-300/70 bg-white sm:p-8 dark:bg-ink-900/70">
                <h2 className="text-base font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                  Sound familiar?
                </h2>
                <ul className="mt-5 space-y-4">
                  {service.painPoints.map((point) => (
                    <li key={point} className="flex gap-3">
                      <span className="mt-1.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-500/20 text-accent-600 dark:text-accent-400">
                        <svg className="h-3 w-3" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
                          <path d="M6 1a.8.8 0 0 1 .8.8v4a.8.8 0 0 1-1.6 0v-4A.8.8 0 0 1 6 1Zm0 7.4a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z" />
                        </svg>
                      </span>
                      <span className="text-ink-700 dark:text-ink-200">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Deliverables */}
      <section aria-labelledby="deliverables-heading" className="border-y border-ink-200 bg-ink-50/60 py-20 dark:border-ink-800 dark:bg-ink-900/40">
        <div className="container-page">
          <Reveal className="max-w-2xl">
            <span className="eyebrow">What you get</span>
            <h2 id="deliverables-heading" className="h2 mt-5">
              Concrete deliverables, not a vague retainer
            </h2>
          </Reveal>

          <ul className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {service.deliverables.map((item, index) => (
              <Reveal as="li" key={item.title} delay={index * 60}>
                <div className="card h-full">
                  <h3 className="text-base font-bold text-ink-900 dark:text-white">{item.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-ink-600 dark:text-ink-300">
                    {item.detail}
                  </p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section aria-labelledby="service-faq-heading" className="py-20 sm:py-24">
        <div className="container-page">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">Questions</span>
            <h2 id="service-faq-heading" className="h2 mt-5">
              {service.name}: straight answers
            </h2>
          </Reveal>
          <Reveal delay={100} className="mx-auto mt-12 max-w-3xl">
            <FaqList faqs={service.faqs} />
          </Reveal>
        </div>
      </section>

      {/* Lead form */}
      <section id="enquire" aria-labelledby="service-enquire-heading" className="scroll-mt-28 border-t border-ink-200 py-20 dark:border-ink-800">
        <div className="container-page">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <Reveal variant="left" className="lg:col-span-5">
              <span className="eyebrow">Next step</span>
              <h2 id="service-enquire-heading" className="h2 mt-5">
                Talk to us about {service.name.toLowerCase()}
              </h2>
              <p className="lede mt-5">
                Describe the situation in a few sentences. We will come back within one business
                day with an honest view of whether this is the right service for you, and what it
                would take.
              </p>
            </Reveal>

            <Reveal variant="right" delay={100} className="lg:col-span-7">
              <div className="card sm:p-9">
                <LeadForm formToken={issueFormToken()} defaultService={service.longName} />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Internal links to the other services */}
      <section aria-labelledby="other-services-heading" className="border-t border-ink-200 py-16 dark:border-ink-800">
        <div className="container-page">
          <h2 id="other-services-heading" className="text-sm font-bold uppercase tracking-[0.14em] text-ink-500 dark:text-ink-400">
            Other services
          </h2>
          <ul className="mt-6 flex flex-wrap gap-3">
            {others.map((other) => (
              <li key={other.slug}>
                <Link
                  href={`/services/${other.slug}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink-700 transition-all hover:-translate-y-0.5 hover:border-accent-400 hover:text-accent-700 dark:border-ink-800 dark:bg-ink-900 dark:text-ink-200 dark:hover:border-accent-600 dark:hover:text-accent-400"
                >
                  <CatalogIcon name={other.icon} className="h-4 w-4" />
                  {other.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
