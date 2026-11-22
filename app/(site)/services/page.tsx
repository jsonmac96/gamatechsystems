import Link from "next/link";
import type { Metadata } from "next";
import { SERVICES } from "@/lib/services";
import { PRODUCTS } from "@/lib/products";
import { SITE } from "@/lib/site";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import Reveal from "@/components/Reveal";
import CatalogIcon from "@/components/CatalogIcon";
import Breadcrumbs from "@/components/Breadcrumbs";
import CtaBand from "@/components/CtaBand";

export const metadata: Metadata = pageMetadata({
  title: "Services — Web, Software, AI, Ads & SEO",
  description:
    "Websites and infrastructure, custom software development, AI analytics and training, Google Ads management, SEO and e-commerce growth for growing businesses worldwide.",
  path: "/services",
  keywords: [
    "digital services for SMEs",
    "software development SEO Google Ads",
    "AI training for business teams",
  ],
});

export const dynamic = "force-dynamic";

export default function ServicesPage() {
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "GaMatech Systems services",
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
          itemList,
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Services", path: "/services" },
          ]),
        ]}
      />

      <section className="relative overflow-hidden py-16 sm:py-24">
        <div aria-hidden="true" className="parallax-bg pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-50 to-white dark:from-brand-950 dark:to-ink-950" />
          <div className="blob left-[-8rem] top-[-6rem] h-80 w-80 animate-drift bg-accent-300/25 dark:bg-accent-900/20" />
        </div>

        <div className="container-page">
          <Breadcrumbs trail={[{ name: "Home", href: "/" }, { name: "Services" }]} />

          <Reveal className="mt-8 max-w-3xl">
            <span className="eyebrow">Services</span>
            <h1 className="h1 mt-5">The work that goes around the systems</h1>
            <p className="lede mt-6">
              Our products cover the systems most businesses need. These six services cover
              everything else — building and running your web presence, writing the software no
              product sells, and bringing customers to all of it.
            </p>
          </Reveal>
        </div>
      </section>

      <section aria-labelledby="all-services" className="pb-20 sm:pb-24">
        <h2 id="all-services" className="sr-only">
          All services
        </h2>
        <div className="container-page">
          <div className="space-y-5">
            {SERVICES.map((service, index) => (
              <Reveal key={service.slug} delay={index * 60}>
                <Link
                  href={`/services/${service.slug}`}
                  className="group block rounded-3xl border border-ink-200/80 bg-white/90 p-7 shadow-card backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-accent-300 hover:shadow-lift sm:p-9 dark:border-ink-800 dark:bg-ink-900/60 dark:hover:border-accent-800"
                >
                  <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                    <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-900 text-white transition-all duration-300 group-hover:scale-110 group-hover:bg-accent-500">
                      <CatalogIcon name={service.icon} className="h-7 w-7" />
                    </span>

                    <div className="flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <h3 className="text-xl font-bold text-ink-900 group-hover:text-accent-700 sm:text-2xl dark:text-white dark:group-hover:text-accent-400">
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

          <Reveal delay={120} className="mt-10">
            <div className="rounded-3xl border border-ink-200 bg-ink-50/70 p-7 sm:p-9 dark:border-ink-800 dark:bg-ink-900/50">
              <h2 className="h3">Looking for a ready-made system instead?</h2>
              <p className="mt-3 max-w-2xl prose-body">
                Our six core products cover point of sale, ERP, payroll, service desk and CRM.
                If one of them fits, it is faster and cheaper than building from scratch.
              </p>
              <ul className="mt-6 flex flex-wrap gap-2.5">
                {PRODUCTS.map((product) => (
                  <li key={product.slug}>
                    <Link
                      href={`/products/${product.slug}`}
                      className="inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink-700 transition-all hover:-translate-y-0.5 hover:border-accent-400 hover:text-accent-700 dark:border-ink-800 dark:bg-ink-900 dark:text-ink-200 dark:hover:border-accent-600 dark:hover:text-accent-400"
                    >
                      <span className="text-ink-400 dark:text-ink-500">{product.code}</span>
                      {product.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      <CtaBand
        heading="Which of these do you need?"
        sub="Tell us what is slowing the business down and we will tell you which service moves the needle first — and which can wait."
      />
    </>
  );
}
