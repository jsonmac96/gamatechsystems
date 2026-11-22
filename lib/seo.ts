import type { Metadata } from "next";
import { SITE, COMPANY_FAQS } from "@/lib/site";
import { PRODUCTS, type Product } from "@/lib/products";
import { SERVICES, type Service } from "@/lib/services";

/**
 * Metadata and JSON-LD builders.
 *
 * Everything SEO-related is generated from one place so no page can ship
 * without a canonical URL, an OpenGraph image or a description.
 */

export const DEFAULT_OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: `${SITE.name} — ${SITE.tagline}`,
};

type PageMetaOptions = {
  title: string;
  description: string;
  /** Site-root-relative path, e.g. "/services/seo". */
  path: string;
  keywords?: readonly string[];
  /** Set for article pages. */
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  /** Exclude from search indexes (admin screens, thank-you pages). */
  noIndex?: boolean;
  ogImage?: { url: string; alt: string; width?: number; height?: number };
};

/** Build a complete, canonical-tagged `Metadata` object for a page. */
export function pageMetadata(options: PageMetaOptions): Metadata {
  const path = normalisePath(options.path);
  const canonical = `${SITE.url}${path === "/" ? "" : path}`;
  const image = options.ogImage ?? DEFAULT_OG_IMAGE;

  return {
    title: options.title,
    description: options.description,
    keywords: options.keywords ? [...options.keywords] : undefined,
    alternates: { canonical },
    robots: options.noIndex
      ? { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
    openGraph: {
      type: options.type ?? "website",
      url: canonical,
      siteName: SITE.name,
      title: options.title,
      description: options.description,
      locale: SITE.locale,
      images: [
        {
          url: image.url,
          width: image.width ?? 1200,
          height: image.height ?? 630,
          alt: image.alt,
        },
      ],
      ...(options.type === "article"
        ? {
            publishedTime: options.publishedTime,
            modifiedTime: options.modifiedTime,
            authors: options.authors,
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: options.title,
      description: options.description,
      images: [image.url],
    },
  };
}

function normalisePath(path: string): string {
  if (!path.startsWith("/")) return `/${path}`;
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1);
  return path;
}

// ---------------------------------------------------------------------------
// JSON-LD
// ---------------------------------------------------------------------------

const ORG_ID = `${SITE.url}/#organization`;
const WEBSITE_ID = `${SITE.url}/#website`;

/** Organisation + LocalBusiness, emitted once site-wide in the root layout. */
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "ProfessionalService"],
    "@id": ORG_ID,
    name: SITE.name,
    legalName: SITE.legalName,
    alternateName: SITE.shortName,
    url: SITE.url,
    logo: { "@type": "ImageObject", url: `${SITE.url}/icon.svg`, width: 512, height: 512 },
    image: `${SITE.url}/opengraph-image`,
    description: SITE.description,
    foundingDate: SITE.founded,
    email: SITE.email,
    telephone: SITE.phoneHref,
    priceRange: "₱₱",
    address: {
      "@type": "PostalAddress",
      addressLocality: SITE.address.city,
      addressRegion: SITE.address.region,
      addressCountry: SITE.address.country,
    },
    areaServed: SITE.areaServed.map((name) => ({ "@type": "Place", name })),
    knowsAbout: [
      "restaurant point of sale",
      "retail point of sale",
      "enterprise resource planning",
      "payroll and HRIS",
      "service desk and ticketing",
      "customer relationship management",
      "custom software development",
      "AI analytics",
      "search engine optimisation",
      "Google Ads management",
      "e-commerce growth",
    ],
    sameAs: [SITE.social.facebook, SITE.social.linkedin],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "sales",
        email: SITE.email,
        telephone: SITE.phoneHref,
        availableLanguage: ["en", "fil"],
        areaServed: "PH",
      },
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Products and services",
      itemListElement: [
        ...PRODUCTS.map((product) => ({
          "@type": "Offer",
          itemOffered: {
            "@type": "SoftwareApplication",
            name: product.longName,
            applicationCategory: "BusinessApplication",
            description: product.summary,
            url: `${SITE.url}/products/${product.slug}`,
          },
        })),
        ...SERVICES.map((service) => ({
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: service.longName,
            description: service.summary,
            url: `${SITE.url}/services/${service.slug}`,
          },
        })),
      ],
    },
  };
}

/** WebSite node with a SearchAction, so search engines can offer sitelinks search. */
export function webSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE.url,
    name: SITE.name,
    description: SITE.description,
    inLanguage: SITE.language,
    publisher: { "@id": ORG_ID },
  };
}

/**
 * SoftwareApplication schema for a core product.
 *
 * Products are software, not services, so they use the application type —
 * which is what lets search and answer engines describe them correctly.
 */
export function productSchema(product: Product) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${SITE.url}/products/${product.slug}/#product`,
    name: product.longName,
    alternateName: `${product.code} ${product.name}`,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web browser",
    description: product.summary,
    url: `${SITE.url}/products/${product.slug}`,
    provider: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
    areaServed: SITE.areaServed.map((name) => ({ "@type": "Place", name })),
    audience: {
      "@type": "BusinessAudience",
      name: "Small and medium businesses worldwide",
    },
    featureList: product.features.map((feature) => feature.title),
    offers: {
      "@type": "Offer",
      priceCurrency: "PHP",
      // Pricing is quoted per site after scoping, so no figure is asserted here.
      availability: "https://schema.org/InStock",
      url: `${SITE.url}/contact`,
      seller: { "@id": ORG_ID },
    },
  };
}

export function serviceSchema(service: Service) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${SITE.url}/services/${service.slug}/#service`,
    name: service.longName,
    serviceType: service.name,
    description: service.summary,
    url: `${SITE.url}/services/${service.slug}`,
    provider: { "@id": ORG_ID },
    areaServed: SITE.areaServed.map((name) => ({ "@type": "Place", name })),
    audience: {
      "@type": "BusinessAudience",
      name: "Small and medium businesses worldwide",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `${service.name} deliverables`,
      itemListElement: service.deliverables.map((item) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: item.title, description: item.detail },
      })),
    },
  };
}

/**
 * FAQPage schema — the single most effective piece of AEO groundwork, because
 * it hands answer engines a clean question/answer pair to quote.
 */
export function faqSchema(faqs: readonly { q: string; a: string }[], pageUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${pageUrl}#faq`,
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };
}

export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE.url}${item.path === "/" ? "" : normalisePath(item.path)}`,
    })),
  };
}

export function articleSchema(input: {
  title: string;
  description: string;
  slug: string;
  publishedAt: string;
  updatedAt: string;
  author: string;
  tags: string[];
  wordCount: number;
}) {
  const url = `${SITE.url}/blog/${input.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: input.title.slice(0, 110),
    description: input.description,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    datePublished: input.publishedAt,
    dateModified: input.updatedAt,
    author: { "@type": "Organization", name: input.author, url: SITE.url },
    publisher: { "@id": ORG_ID },
    image: [`${SITE.url}/blog/${input.slug}/opengraph-image`],
    keywords: input.tags.join(", "),
    wordCount: input.wordCount,
    inLanguage: SITE.language,
    isAccessibleForFree: true,
  };
}

export function companyFaqSchema() {
  return faqSchema(COMPANY_FAQS, `${SITE.url}/`);
}

/**
 * Serialise JSON-LD for inlining in a <script type="application/ld+json"> tag.
 *
 * `<` is escaped to `<` so a value can never terminate the script element
 * early — the one XSS vector that inline JSON-LD actually has.
 */
export function jsonLdString(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
