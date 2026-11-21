import Link from "next/link";
import type { Metadata } from "next";
import { PRODUCTS } from "@/lib/products";
import { SERVICES } from "@/lib/services";
import { SITE } from "@/lib/site";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import Reveal from "@/components/Reveal";
import CatalogIcon from "@/components/CatalogIcon";
import Breadcrumbs from "@/components/Breadcrumbs";
import CtaBand from "@/components/CtaBand";

export const metadata: Metadata = pageMetadata({
  title: "Products — POS, ERP, Payroll & CRM",
  description:
    "Six core business systems for Philippine SMEs: Restaurant Suite, Retail Suite, ERP, Payroll & HRIS, Triage service desk and CRM. Built and maintained by GaMatech Systems.",
  path: "/products",
  keywords: [
    "business systems Philippines",
    "POS ERP payroll CRM Philippines",
    "SME software products",
  ],
});

export const dynamic = "force-dynamic";

export default function ProductsPage() {
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "GaMatech Systems core products",
    itemListElement: PRODUCTS.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: product.longName,
      description: product.summary,
      url: `${SITE.url}/products/${product.slug}`,
    })),
  };

  return (
    <>
      <JsonLd
        data={[
          itemList,
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Products", path: "/products" },
          ]),
        ]}
      />

      <section className="relative overflow-hidden py-16 sm:py-24">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-50 to-white dark:from-brand-950 dark:to-ink-950" />
          <div className="blob right-[-8rem] top-[-6rem] h-80 w-80 animate-drift bg-accent-300/25 dark:bg-accent-900/25" />
        </div>

        <div className="container-page">
          <Breadcrumbs trail={[{ name: "Home", href: "/" }, { name: "Products" }]} />

          <Reveal className="mt-8 max-w-3xl">
            <span className="eyebrow">Core products</span>
            <h1 className="h1 mt-5">Six systems your business can actually run on</h1>
            <p className="lede mt-6">
              These are our own products, built and maintained in-house. Each one is a complete
              system rather than a module you still have to assemble — and because they share a
              foundation, the ones you adopt talk to each other.
            </p>
          </Reveal>
        </div>
      </section>

      <section aria-labelledby="all-products" className="pb-20 sm:pb-24">
        <h2 id="all-products" className="sr-only">
          All core products
        </h2>
        <div className="container-page">
          <ul className="grid gap-6 md:grid-cols-2">
            {PRODUCTS.map((product, index) => (
              <Reveal as="li" key={product.slug} delay={index * 70}>
                <Link
                  href={`/products/${product.slug}`}
                  className="card-interactive group flex h-full flex-col"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-900 text-white transition-all duration-300 group-hover:scale-110 group-hover:bg-accent-500">
                      <CatalogIcon name={product.icon} />
                    </span>
                    <span className="rounded-lg bg-accent-50 px-2.5 py-1 text-xs font-bold tracking-wide text-accent-700 dark:bg-accent-950/60 dark:text-accent-300">
                      {product.code}
                    </span>
                  </div>

                  <h3 className="mt-5 text-xl font-bold text-ink-900 group-hover:text-accent-700 dark:text-white dark:group-hover:text-accent-400">
                    {product.name}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-ink-600 dark:text-ink-300">
                    {product.summary}
                  </p>

                  <ul className="mt-5 flex flex-wrap gap-2">
                    {product.features.slice(0, 4).map((feature) => (
                      <li
                        key={feature.title}
                        className="rounded-full bg-ink-100 px-3 py-1.5 text-xs font-medium text-ink-700 dark:bg-ink-800 dark:text-ink-200"
                      >
                        {feature.title}
                      </li>
                    ))}
                    {product.features.length > 4 ? (
                      <li className="rounded-full px-2 py-1.5 text-xs font-semibold text-ink-400 dark:text-ink-500">
                        +{product.features.length - 4} more
                      </li>
                    ) : null}
                  </ul>

                  <span className="btn-ghost mt-auto pt-6">
                    Explore {product.name}
                    <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M3 10a1 1 0 0 1 1-1h9.6l-3.3-3.3a1 1 0 0 1 1.4-1.4l5 5a1 1 0 0 1 0 1.4l-5 5a1 1 0 0 1-1.4-1.4L13.6 11H4a1 1 0 0 1-1-1Z" clipRule="evenodd" />
                    </svg>
                  </span>
                </Link>
              </Reveal>
            ))}
          </ul>

          {/* Pointer across to the services */}
          <Reveal delay={120} className="mt-10">
            <div className="rounded-3xl border border-ink-200 bg-ink-50/70 p-7 sm:p-9 dark:border-ink-800 dark:bg-ink-900/50">
              <h2 className="h3">Need something a product does not cover?</h2>
              <p className="mt-3 max-w-2xl prose-body">
                Our services handle the work around these systems — websites and infrastructure,
                custom software, AI analytics, Google Ads, SEO and e-commerce growth.
              </p>
              <ul className="mt-6 flex flex-wrap gap-2.5">
                {SERVICES.map((service) => (
                  <li key={service.slug}>
                    <Link
                      href={`/services/${service.slug}`}
                      className="inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink-700 transition-all hover:-translate-y-0.5 hover:border-accent-400 hover:text-accent-700 dark:border-ink-800 dark:bg-ink-900 dark:text-ink-200 dark:hover:border-accent-600 dark:hover:text-accent-400"
                    >
                      <CatalogIcon name={service.icon} className="h-4 w-4" />
                      {service.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      <CtaBand
        heading="Not sure which system you need first?"
        sub="Tell us how the business runs today. We will tell you which product pays back fastest — or that you do not need one yet."
      />
    </>
  );
}
