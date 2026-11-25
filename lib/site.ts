/**
 * Single source of truth for brand, contact and company content.
 *
 * Page metadata, JSON-LD, the sitemap, the navigation and the marketing copy
 * all read from here, so there is one place to change a phone number and no
 * risk of the sitemap drifting from the routes.
 *
 * The catalogue itself lives next door:
 *   - `lib/products.ts` — the six core products (M5–M10)
 *   - `lib/services.ts` — the six services delivered around them
 */

export const SITE = {
  name: "GaMatech Systems",
  legalName: "GaMatech Systems",
  shortName: "GaMatech",
  tagline: "Business systems that run themselves",
  description:
    "GaMatech Systems builds and implements the core business systems growing companies run on — restaurant and retail POS, ERP, payroll and HRIS, service desk and CRM — plus the websites, software, AI analytics and digital marketing around them. Based in the Philippines, serving clients worldwide.",
  // Read from the environment at render time so staging and production differ
  // without a code change.
  url: (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "https://www.gamatechsystems.com")
  ).replace(/\/+$/, ""),
  locale: "en_US",
  language: "en",
  email: "sales@gamatechsystems.com",
  phoneDisplay: "+63 917 185 5534",
  phoneHref: "+639171855534",
  address: {
    city: "Bacolod City",
    region: "Negros Occidental",
    country: "PH",
    countryName: "Philippines",
  },
  founded: "2021",
  /** Where clients are served. The registered address above stays in the Philippines. */
  areaServed: ["Worldwide"],
  /** Opening hours as shown on the site. Keep in step with `openingHours`. */
  hours: "Mon–Fri, 8 AM–6 PM PHT",
  /** The same hours for structured data (24-hour clock, Philippine Time). */
  openingHours: {
    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opens: "08:00",
    closes: "18:00",
  },
  social: {
    facebook: "https://www.facebook.com/gamatechsystems",
    linkedin: "https://www.linkedin.com/company/gamatechsystems",
  },
  /** Brand colours, taken from the logo artwork. */
  brand: {
    navy: "#0A1A3E",
    orange: "#E7580A",
    mist: "#F4F5F9",
  },
} as const;

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Insights" },
  { href: "/contact", label: "Contact" },
] as const;

/** Site-wide questions, used for the home-page FAQ and FAQPage schema. */
export const COMPANY_FAQS = [
  {
    q: "What does GaMatech Systems do?",
    a: "GaMatech Systems builds and implements the core systems a business runs on. There are six products — Restaurant Suite, Retail Suite, ERP, Payroll & HRIS, Triage service desk and CRM — and six services around them: websites and infrastructure, custom software development, AI analytics and training, Google Ads management, SEO and e-commerce growth.",
  },
  {
    q: "Do I buy a product or a service?",
    a: "A product if a standard system fits: it is faster, cheaper and already maintained. A service when the work is specific to you, or when you need the website, marketing or analytics around a system you already have. Most clients begin with one product and add services as they grow.",
  },
  {
    q: "Who do you work with?",
    a: "Small and medium businesses, typically between 5 and 200 staff — restaurants and food groups, retailers and distributors, manufacturers, clinics and professional services firms. We are based in the Philippines and work with clients worldwide, with owners and operations leads rather than procurement committees.",
  },
  {
    q: "How much does a system cost?",
    a: "Products are quoted per site and per module after a short scoping call, with implementation priced separately and fixed. Services start at ₱35,000 a month for SEO and ₱30,000 a month plus media for Google Ads; custom software is fixed-price after a paid discovery sprint.",
  },
  {
    q: "How long does implementation take?",
    a: "A Restaurant or Retail Suite outlet is usually live in two to four weeks. Payroll takes two parallel pay cycles before cutover. A full ERP rollout runs three to six months for the first live modules. We never cut over without running the old and new side by side first.",
  },
  {
    q: "Do you work with clients outside the Philippines?",
    a: "Yes. We are based in Bacolod City and work with clients worldwide. Most scoping, implementation, training and support runs remotely; on-site visits for installation, discovery workshops or go-live training are arranged where a project needs them.",
  },
  {
    q: "Who owns our data?",
    a: "You do. Data can be exported in full at any time, infrastructure is registered in your name, and custom development is handed over with the source code and documentation. There is no lock-in.",
  },
] as const;

export const PROOF_POINTS = [
  { value: "6", label: "core systems, built and maintained in-house" },
  { value: "2–4 wks", label: "to a live POS outlet" },
  { value: "1 ledger", label: "from the till to the financial statements" },
  { value: "<1s", label: "load time on the sites we build" },
] as const;

export const INDUSTRIES = [
  "Restaurants & food groups",
  "Retail & convenience",
  "Distribution & wholesale",
  "Manufacturing",
  "E-commerce sellers",
  "Clinics & healthcare",
  "Professional services",
  "Construction & trades",
] as const;
