import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProduct, PRODUCTS } from "@/lib/products";
import { SITE } from "@/lib/site";
import {
  breadcrumbSchema,
  faqSchema,
  pageMetadata,
  productSchema,
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
  const product = getProduct(slug);
  if (!product) return { title: "Product not found", robots: { index: false, follow: false } };

  return pageMetadata({
    title: product.metaTitle,
    description: product.metaDescription,
    path: `/products/${product.slug}`,
    keywords: product.keywords,
  });
}

export default async function ProductPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const pageUrl = `${SITE.url}/products/${product.slug}`;
  const others = PRODUCTS.filter((p) => p.slug !== product.slug);

  return (
    <>
      <JsonLd
        data={[
          productSchema(product),
          faqSchema(product.faqs, pageUrl),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Products", path: "/products" },
            { name: product.name, path: `/products/${product.slug}` },
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
              { name: "Products", href: "/products" },
              { name: product.name },
            ]}
          />

          <div className="mt-8 grid gap-12 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-7">
              <Reveal>
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-900 text-white">
                    <CatalogIcon name={product.icon} className="h-7 w-7" />
                  </span>
                  <span className="rounded-xl bg-accent-500 px-3 py-1.5 text-sm font-bold text-white">
                    {product.code}
                  </span>
                </div>
                <h1 className="h1 mt-6">{product.longName}</h1>
              </Reveal>

              <Reveal delay={90}>
                <div className="mt-7 space-y-5">
                  {product.intro.map((paragraph) => (
                    <p key={paragraph.slice(0, 40)} className="lede">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </Reveal>

              <Reveal delay={150}>
                <p className="mt-7 rounded-2xl border border-ink-200 bg-ink-50/80 px-5 py-4 text-sm text-ink-700 dark:border-ink-800 dark:bg-ink-900/60 dark:text-ink-200">
                  <span className="font-semibold text-ink-900 dark:text-white">Built for: </span>
                  {product.audience}
                </p>
              </Reveal>

              <Reveal delay={210}>
                <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Link href="#enquire" className="btn-cta group">
                    Book a demo
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

            {/* Pain points */}
            <Reveal variant="right" delay={140} className="lg:col-span-5">
              <div className="card border-ink-300/70 bg-white sm:p-8 dark:bg-ink-900/70">
                <h2 className="text-base font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                  Sound familiar?
                </h2>
                <ul className="mt-5 space-y-4">
                  {product.painPoints.map((point) => (
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


      {/* Features */}
      <section aria-labelledby="features-heading" className="border-y border-ink-200 bg-ink-50/60 py-20 dark:border-ink-800 dark:bg-ink-900/40">
        <div className="container-page">
          <Reveal className="max-w-2xl">
            <span className="eyebrow">What is included</span>
            <h2 id="features-heading" className="h2 mt-5">
              {product.code} key features
            </h2>
          </Reveal>

          <ul className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {product.features.map((feature, index) => (
              <Reveal as="li" key={feature.title} delay={index * 55}>
                <div className="card h-full">
                  <h3 className="text-base font-bold text-ink-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-ink-600 dark:text-ink-300">
                    {feature.detail}
                  </p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* Rollout */}
      <section aria-labelledby="rollout-heading" className="py-20 sm:py-24">
        <div className="container-page">
          <Reveal className="max-w-2xl">
            <span className="eyebrow">Getting it running</span>
            <h2 id="rollout-heading" className="h2 mt-5">
              How a {product.name.toLowerCase()} rollout works
            </h2>
          </Reveal>

          <ol className="mt-12 space-y-4">
            {product.rollout.map((step, index) => (
              <Reveal as="li" key={step.step} delay={index * 70}>
                <div className="group flex gap-5 rounded-2xl border border-ink-200 bg-white p-6 transition-all duration-300 hover:border-accent-300 hover:shadow-card dark:border-ink-800 dark:bg-ink-900/60 dark:hover:border-accent-800">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-900 text-sm font-bold text-white transition-colors group-hover:bg-accent-500">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-ink-900 dark:text-white">{step.step}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-600 dark:text-ink-300">
                      {step.detail}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* FAQ */}
      <section aria-labelledby="product-faq-heading" className="border-t border-ink-200 py-20 dark:border-ink-800">
        <div className="container-page">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">Questions</span>
            <h2 id="product-faq-heading" className="h2 mt-5">
              {product.name}: straight answers
            </h2>
          </Reveal>
          <Reveal delay={100} className="mx-auto mt-12 max-w-3xl">
            <FaqList faqs={product.faqs} />
          </Reveal>
        </div>
      </section>

      {/* Lead form */}
      <section id="enquire" aria-labelledby="product-enquire-heading" className="scroll-mt-24 border-t border-ink-200 py-20 dark:border-ink-800">
        <div className="container-page">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <Reveal variant="left" className="lg:col-span-5">
              <span className="eyebrow">Next step</span>
              <h2 id="product-enquire-heading" className="h2 mt-5">
                See {product.code} on your own numbers
              </h2>
              <p className="lede mt-5">
                Tell us a little about how you operate today and we will walk you through{" "}
                {product.name} with your scenario rather than a canned demo — usually within one
                business day.
              </p>
            </Reveal>

            <Reveal variant="right" delay={100} className="lg:col-span-7">
              <div className="card sm:p-9">
                <LeadForm formToken={issueFormToken()} defaultService={product.longName} />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Internal links to the other products */}
      <section aria-labelledby="other-products-heading" className="border-t border-ink-200 py-16 dark:border-ink-800">
        <div className="container-page">
          <h2 id="other-products-heading" className="text-sm font-bold uppercase tracking-[0.14em] text-ink-500 dark:text-ink-400">
            Other products
          </h2>
          <ul className="mt-6 flex flex-wrap gap-3">
            {others.map((other) => (
              <li key={other.slug}>
                <Link
                  href={`/products/${other.slug}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink-700 transition-all hover:-translate-y-0.5 hover:border-accent-400 hover:text-accent-700 dark:border-ink-800 dark:bg-ink-900 dark:text-ink-200 dark:hover:border-accent-600 dark:hover:text-accent-400"
                >
                  <CatalogIcon name={other.icon} className="h-4 w-4" />
                  <span className="text-ink-400 dark:text-ink-500">{other.code}</span>
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
