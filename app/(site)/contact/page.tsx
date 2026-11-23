import type { Metadata } from "next";
import { COMPANY_FAQS, SITE } from "@/lib/site";
import { breadcrumbSchema, faqSchema, pageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import Reveal from "@/components/Reveal";
import Breadcrumbs from "@/components/Breadcrumbs";
import LeadForm from "@/components/LeadForm";
import FaqList from "@/components/FaqList";
import { issueFormToken } from "@/lib/form-token";

export const metadata: Metadata = pageMetadata({
  title: "Contact Us — Free Consultation",
  description:
    "Talk to us about software, automation, web development, SEO, AEO or marketing for your business. Free consultation, reply within one business day.",
  path: "/contact",
  keywords: ["contact GaMatech Systems", "software consultation", "free IT consultation"],
});

export default function ContactPage() {
  const contactSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: `Contact ${SITE.name}`,
    url: `${SITE.url}/contact`,
    description:
      "Book a free consultation with GaMatech Systems about software, automation, web development or growth.",
    mainEntity: { "@id": `${SITE.url}/#organization` },
  };

  return (
    <>
      <JsonLd
        data={[
          contactSchema,
          faqSchema(COMPANY_FAQS.slice(0, 4), `${SITE.url}/contact`),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Contact", path: "/contact" },
          ]),
        ]}
      />

      <section className="relative overflow-hidden py-14 sm:py-20">
        <div aria-hidden="true" className="parallax-bg pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-50 to-white dark:from-brand-950 dark:to-ink-950" />
          <div className="absolute inset-0 opacity-25 grid-backdrop [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
        </div>

        <div className="container-page">
          <Breadcrumbs trail={[{ name: "Home", href: "/" }, { name: "Contact" }]} />

          <div className="mt-8 grid gap-12 lg:grid-cols-12 lg:gap-16">
            {/* Copy + contact details */}
            <div className="lg:col-span-5">
              <Reveal>
                <span className="eyebrow">Free consultation</span>
                <h1 className="h1 mt-5">Let&rsquo;s talk about what is slowing you down</h1>
                <p className="lede mt-6">
                  Fill in the form and you will hear from a person who has read it — usually the
                  same day, always within one business day.
                </p>
              </Reveal>

              <Reveal delay={110}>
                <dl className="mt-10 space-y-6">
                  <ContactRow
                    label="Email"
                    icon={
                      <path d="M3 7.5 12 13l9-5.5M4.5 5.5h15a1.5 1.5 0 0 1 1.5 1.5v10a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17V7a1.5 1.5 0 0 1 1.5-1.5Z" />
                    }
                  >
                    <a
                      href={`mailto:${SITE.email}`}
                      className="font-semibold text-accent-700 hover:underline dark:text-accent-400"
                    >
                      {SITE.email}
                    </a>
                  </ContactRow>

                  <ContactRow
                    label="Phone"
                    icon={
                      <path d="M6.5 3.5h2.8l1.4 3.5-2 1.4a10.5 10.5 0 0 0 5 5l1.4-2 3.5 1.4v2.8a1.9 1.9 0 0 1-2.1 1.9A14.6 14.6 0 0 1 4.6 5.6 1.9 1.9 0 0 1 6.5 3.5Z" />
                    }
                  >
                    <a
                      href={`tel:${SITE.phoneHref}`}
                      className="font-semibold text-accent-700 hover:underline dark:text-accent-400"
                    >
                      {SITE.phoneDisplay}
                    </a>
                    <span className="mt-0.5 block text-sm text-ink-500 dark:text-ink-400">
                      {SITE.hours}
                    </span>
                  </ContactRow>

                  <ContactRow
                    label="Location"
                    icon={
                      <>
                        <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" />
                        <circle cx="12" cy="10" r="2.5" />
                      </>
                    }
                  >
                    <span className="font-semibold text-ink-900 dark:text-white">
                      {SITE.address.city}, {SITE.address.countryName}
                    </span>
                    <span className="mt-0.5 block text-sm text-ink-500 dark:text-ink-400">
                      Remote-first, serving clients worldwide
                    </span>
                  </ContactRow>
                </dl>
              </Reveal>

              <Reveal delay={180}>
                <div className="mt-10 rounded-2xl border border-accent-200 bg-accent-50/70 p-6 dark:border-accent-900 dark:bg-accent-950/25">
                  <h2 className="text-base font-bold text-ink-900 dark:text-white">
                    What happens after you send this
                  </h2>
                  <ol className="mt-4 space-y-3 text-sm text-ink-700 dark:text-ink-200">
                    {[
                      "We read it and reply within one business day — with questions, not a brochure.",
                      "A 30-minute call to understand the operation and the constraints.",
                      "A written proposal within three working days, including an indicative price.",
                    ].map((step, index) => (
                      <li key={step} className="flex gap-3">
                        <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-700 text-xs font-bold text-white">
                          {index + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </Reveal>
            </div>

            {/* Form */}
            <Reveal variant="right" delay={90} className="lg:col-span-7">
              <div className="card sm:p-9">
                <h2 className="text-xl font-bold text-ink-900 dark:text-white">
                  Tell us about your project
                </h2>
                <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">
                  Fields marked <span className="text-red-500 dark:text-red-400">*</span> are required.
                </p>
                <div className="mt-7">
                  <LeadForm formToken={issueFormToken()} />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section aria-labelledby="contact-faq-heading" className="border-t border-ink-200 py-20 dark:border-ink-800">
        <div className="container-page">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 id="contact-faq-heading" className="h2">
              Before you ask
            </h2>
          </Reveal>
          <Reveal delay={100} className="mx-auto mt-10 max-w-3xl">
            <FaqList faqs={COMPANY_FAQS.slice(0, 4)} />
          </Reveal>
        </div>
      </section>
    </>
  );
}

function ContactRow({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <span className="mt-0.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-50 text-accent-600 dark:bg-accent-950/50 dark:text-accent-400">
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {icon}
        </svg>
      </span>
      <div>
        <dt className="text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400">
          {label}
        </dt>
        <dd className="mt-1">{children}</dd>
      </div>
    </div>
  );
}
