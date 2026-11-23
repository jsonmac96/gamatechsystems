import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/site";
import { organizationSchema, webSiteSchema, DEFAULT_OG_IMAGE } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";

/**
 * Root layout.
 *
 * Owns the site-wide metadata defaults, the Organization/WebSite structured
 * data, and the small inline script that drives scroll reveals.
 */

/**
 * Site typeface: Plus Jakarta Sans, a geometric sans close in spirit to the
 * GaMatech wordmark, with the extra-bold and light weights the logo uses.
 *
 * `next/font` downloads it at build time and serves it from this domain, so
 * there is no request to Google from the visitor's browser and the CSP's
 * `font-src 'self'` needs no exception. It also emits a size-adjusted
 * fallback, so text does not jump when the font finishes loading.
 */
const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  // Makes every relative `alternates.canonical` in a page resolve absolutely.
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — Business Systems for SMEs Worldwide`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  generator: undefined,
  keywords: [
    "business systems for SMEs",
    "restaurant POS system",
    "retail POS software",
    "ERP for SMEs",
    "payroll and HRIS software",
    "CRM software",
    "service desk software",
    "custom software development",
    "SME software company",
    "SME software",
  ],
  authors: [{ name: SITE.name, url: SITE.url }],
  creator: SITE.name,
  publisher: SITE.name,
  alternates: {
    canonical: "/",
    languages: { en: "/", "x-default": "/" },
  },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    locale: SITE.locale,
    url: SITE.url,
    title: `${SITE.name} — Business Systems for SMEs Worldwide`,
    description: SITE.description,
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — Business Systems for SMEs Worldwide`,
    description: SITE.description,
    images: [DEFAULT_OG_IMAGE.url],
  },
  robots: {
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
  category: "technology",
  formatDetection: { telephone: true, address: false, email: true },
  referrer: "strict-origin-when-cross-origin",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Never block zoom: pinch-to-zoom is an accessibility requirement.
  maximumScale: 5,
  // The site is set on white, so the browser chrome matches it.
  themeColor: "#ffffff",
  colorScheme: "light",
};

/**
 * Animation enabler.
 *
 * The CSS that hides a not-yet-revealed element is scoped to `html.js-anim`,
 * and this is the only thing that adds that class. The ordering matters: the
 * class is applied in the document head, before first paint, so there is no
 * flash of content that then disappears — while a page whose JavaScript never
 * runs simply shows everything, because the hiding rules never match.
 *
 * It also respects `prefers-reduced-motion` by not enabling animation at all
 * for visitors who have asked for less of it.
 */
const ENABLE_ANIMATION = `
(function(){
  try{
    var m = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
    if (m && m.matches) return;
    document.documentElement.classList.add('js-anim');
  }catch(e){}
})();`;

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Nonce issued per request by proxy.ts, required by the CSP.
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={sans.variable}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" sizes="64x64" />
        <link rel="manifest" href="/site.webmanifest" />
        {/* Enables the reveal animations. Without it nothing is ever hidden. */}
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: ENABLE_ANIMATION }} />
        {/* Belt and braces: force everything visible with JavaScript disabled. */}
        <noscript>
          <style
            dangerouslySetInnerHTML={{
              __html: `[data-reveal]{opacity:1 !important;transform:none !important}`,
            }}
          />
        </noscript>
      </head>
      <body className="min-h-dvh bg-white text-ink-900 dark:bg-ink-950 dark:text-ink-50">
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        {children}
        <JsonLd data={[organizationSchema(), webSiteSchema()]} />
      </body>
    </html>
  );
}
