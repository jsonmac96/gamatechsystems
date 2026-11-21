import Link from "next/link";
import type { Metadata } from "next";
import { SERVICES } from "@/lib/site";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import Reveal from "@/components/Reveal";
import ServiceIcon from "@/components/ServiceIcon";
import CtaBand from "@/components/CtaBand";
import Breadcrumbs from "@/components/Breadcrumbs";
import { SITE } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Services — Software, Automation, Web & Growth",
  description:
    "Seven services for Philippine SMEs: software development, automation, web development, custom software, SEO, AEO and marketing. Fixed-price scoping.",
  path: "/services",
  keywords: [
    "software services Philippines",
    "automation services Philippines",
    "SEO AEO marketing Philippines",
  ],
});

export default function ServicesPage() {
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "GamaTech Systems services",
    itemListElement: SERVICES.map((service, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: service.longName,
      description: service.summary,
      url: `${SITE.url}/services/${service.slug}`,
    })),
  };

  return (
    <>
      <JsonLd
        data={[
          itemListSchema,
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Services", path: "/services" },
          ]),
        ]}
      />

      <section className="relative overflow-hidden py-16 sm:py-24">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-50/70 to-white dark:from-ink-900 dark:to-ink-950" />
          <div className="blob right-[-8rem] top-[-6rem] h-80 w-80 animate-drift bg-brand-300/35 dark:bg-brand-800/25" />
        </div>

        <div className="container-page">
          <Breadcrumbs trail={[{ name: "Home", href: "/" }, { name: "Services" }]} />

          <Reveal className="mt-8 max-w-3xl">
            <span className="eyebrow">Services</span>
            <h1 className="h1 mt-5">
              Everything your business needs to run — and to grow
            </h1>
            <p className="lede mt-6">
              Four services build the system. Three fill it with customers. You can start with
              one, and most clients do — but having them under one roof is why the handoffs
              between them do not drop anything.
            </p>
          </Reveal>
        </div>
      </section>

      <section aria-labelledby="all-services" className="pb-20 sm:pb-28">
        <h2 id="all-services" className="sr-only">
          All services
        </h2>
        <div className="container-page">
          <div className="space-y-5">
            {SERVICES.map((service, index) => (
              <Reveal key={service.slug} delay={index * 60}>
                <Link
                  href={`/services/${service.slug}`}
                  className="group block rounded-3xl border border-ink-200/80 bg-white/90 p-7 shadow-card backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-lift sm:p-9 dark:border-ink-800 dark:bg-ink-900/60 dark:hover:border-brand-700"
                >
                  <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                    <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 transition-all duration-300 group-hover:scale-110 group-hover:bg-brand-500 group-hover:text-white dark:bg-brand-950/60 dark:text-brand-300">
                      <ServiceIcon name={service.icon} className="h-7 w-7" />
                    </span>

                    <div className="flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <h3 className="text-xl font-bold text-ink-900 group-hover:text-brand-700 sm:text-2xl dark:text-white dark:group-hover:text-brand-300">
                          {service.name}
                        </h3>
                        <span className="text-xs font-semibold uppercase tracking-wider text-ink-400 dark:text-ink-500">
                          0{index + 1}
                        </span>
                      </div>

                      <p className="mt-3 max-w-2xl text-ink-600 dark:text-ink-300">
                        {service.summary}
                      </p>

                      <ul className="mt-5 flex flex-wrap gap-2">
                        {service.deliverables.slice(0, 3).map((item) => (
                          <li
                            key={item.title}
                            className="rounded-full bg-ink-100 px-3 py-1.5 text-xs font-medium text-ink-700 dark:bg-ink-800 dark:text-ink-200"
                          >
                            {item.title}
                          </li>
                        ))}
                      </ul>

                      <p className="mt-5 text-sm font-medium text-ink-500 dark:text-ink-400">
                        {service.engagement}
                      </p>
                    </div>

                    <span className="btn-ghost shrink-0 self-start sm:self-center">
                      View details
                      <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M3 10a1 1 0 0 1 1-1h9.6l-3.3-3.3a1 1 0 0 1 1.4-1.4l5 5a1 1 0 0 1 0 1.4l-5 5a1 1 0 0 1-1.4-1.4L13.6 11H4a1 1 0 0 1-1-1Z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        heading="Which one do you need first?"
        sub="If you are not sure, that is the normal starting point. Tell us what hurts and we will tell you which service pays back fastest."
      />
    </>
  );
}
