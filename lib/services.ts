/**
 * GaMatech Systems services.
 *
 * These are the six "Other Services" lines from the company's product plan.
 * They sit alongside the core products in `lib/products.ts`: the products are
 * the systems we license and implement, the services are the work we do
 * around them.
 */

export type ServiceSlug =
  | "web-services"
  | "software-development"
  | "ai-analytics"
  | "google-ads"
  | "seo"
  | "ecommerce-growth";

export type Service = {
  slug: ServiceSlug;
  name: string;
  longName: string;
  summary: string;
  metaTitle: string;
  metaDescription: string;
  icon: "web" | "code" | "ai" | "ads" | "seo" | "cart";
  intro: string[];
  deliverables: { title: string; detail: string }[];
  painPoints: string[];
  faqs: { q: string; a: string }[];
  keywords: string[];
};

export const SERVICES: readonly Service[] = [
  {
    slug: "web-services",
    name: "Websites & Infrastructure",
    longName: "Website Building, Maintenance & Infrastructure",
    summary:
      "Websites built and then actually looked after — DNS, Cloudflare, mail delivery, certificates, backups and patching.",
    metaTitle: "Website Building & Maintenance",
    metaDescription:
      "Website building and maintenance, DNS configuration, Cloudflare setup and SMTP server management for businesses worldwide, by GaMatech Systems.",
    icon: "web",
    intro: [
      "A website is not a one-off purchase; it is a small piece of infrastructure that needs a domain pointing at it, a certificate that renews, mail that reaches the inbox and software that gets patched.",
      "We build the site and then run the unglamorous parts underneath it, so the first you hear about an expiring certificate is not a browser warning in front of a customer.",
    ],
    deliverables: [
      { title: "Website building", detail: "Fast, mobile-first, search-ready sites with a content editor your team can use." },
      { title: "Maintenance", detail: "Security patching, dependency updates, uptime monitoring, backups and restore tests." },
      { title: "DNS configuration", detail: "Records set up correctly the first time, with a documented zone you own." },
      { title: "Cloudflare setup", detail: "CDN, caching, TLS, firewall rules and bot protection in front of your origin." },
      { title: "SMTP and email delivery", detail: "SPF, DKIM and DMARC configured so your mail is authenticated and lands in the inbox." },
      { title: "Monitoring", detail: "Uptime and certificate expiry alerts that reach a person, not a dashboard nobody opens." },
    ],
    painPoints: [
      "The site goes down and nobody notices until a customer calls.",
      "Quotation emails land in the customer's spam folder.",
      "Only the previous developer knows where the domain is registered.",
      "The certificate expired on a Saturday.",
    ],
    faqs: [
      { q: "Why does email from our own domain go to spam?", a: "Almost always missing or wrong SPF, DKIM and DMARC records. Mail providers treat unauthenticated mail as suspicious. Configuring all three correctly is routine work and usually fixes deliverability within a day or two of propagation." },
      { q: "Do we have to move our hosting to you?", a: "No. We work with your existing registrar and host where that is sensible. If a move genuinely helps, we will explain why and manage it with no downtime." },
      { q: "What does Cloudflare actually give us?", a: "A cache close to your visitors so pages load faster, TLS certificates that renew themselves, protection against bot and denial-of-service traffic, and a firewall in front of your origin server." },
      { q: "Who owns the domain and accounts?", a: "You do. Everything is registered in your name under your billing, and we work as an authorised user. You can remove our access at any time without losing anything." },
    ],
    keywords: ["website maintenance", "DNS configuration", "Cloudflare setup", "SMTP email deliverability"],
  },
  {
    slug: "software-development",
    name: "Software Development",
    longName: "Custom Software Development",
    summary:
      "Bespoke systems for the parts of your operation no product covers — scoped, fixed-price and handed over with the code.",
    metaTitle: "Custom Software Development",
    metaDescription:
      "Custom software development for SMEs worldwide: discovery sprint, fixed price, releases every two weeks, documented handover and full code ownership.",
    icon: "code",
    intro: [
      "Our core products cover the systems most businesses need. Software development is for everything else: the workflow that is particular to you, the integration between two tools that refuse to talk, the internal application nobody sells off the shelf.",
      "Every build starts with a paid discovery sprint that produces a written scope, a clickable prototype and a fixed price. You decide whether to build before committing to the build.",
    ],
    deliverables: [
      { title: "Discovery sprint", detail: "Workflow mapping, data model, architecture decisions and a fixed-price build plan — yours to keep either way." },
      { title: "Production application", detail: "Web or mobile, on mainstream technology your next developer will recognise." },
      { title: "Integrations", detail: "Connections to your existing systems, including our own products where that is the shortest path." },
      { title: "Automated tests", detail: "Coverage of the paths that would cost you money if they broke." },
      { title: "Deployment pipeline", detail: "One-command deploys, a staging environment, backups and monitoring." },
      { title: "Documentation and handover", detail: "Runbooks, architecture notes and recorded walkthroughs. You own everything." },
    ],
    painPoints: [
      "An off-the-shelf tool covers 70% of the workflow and fights you on the rest.",
      "The previous developer left no documentation.",
      "Two systems hold the same data and neither is authoritative.",
      "A critical process exists only in one person's head.",
    ],
    faqs: [
      { q: "How much does custom software cost?", a: "A focused internal tool typically runs ₱250,000 to ₱600,000; a multi-role operational system ₱800,000 to ₱2.5 million. We quote a fixed price after a paid discovery sprint, so the number you approve is the number you pay." },
      { q: "Should we build, or configure one of your products?", a: "Configure, whenever a product fits. It is faster, cheaper and someone else maintains it. We will say so plainly — building something we could have configured is a bad outcome for both of us." },
      { q: "Who owns the source code?", a: "You do, in full, from the first commit. The repository sits under your account and the handover package includes documentation, credentials and deployment runbooks." },
      { q: "Can you take over software someone else built?", a: "Yes. We start with a technical audit covering security, dependencies and test coverage, then give you a written assessment and a remediation plan before changing anything." },
    ],
    keywords: ["custom software development", "bespoke software for SMEs", "system integration", "software company Philippines"],
  },
  {
    slug: "ai-analytics",
    name: "AI Analytics & Training",
    longName: "AI Analytics and Leveraging Training",
    summary:
      "Turn the data your systems already collect into decisions — and teach your team to use AI tools properly instead of guessing.",
    metaTitle: "AI Analytics & Team AI Training",
    metaDescription:
      "AI analytics on your own operational data, plus practical AI training for SME teams. Dashboards, forecasting and safe, useful day-to-day usage.",
    icon: "ai",
    intro: [
      "Most SMEs are sitting on years of sales, stock and customer data that nobody has ever asked a question of. The value is not in buying an AI product; it is in connecting what you already record to the decisions you already make.",
      "The other half of this service is people. Teams adopt AI tools whether or not anyone trains them, which is how confidential data ends up pasted into a public chatbot. We teach what to use, what it is good at, and where the line is.",
    ],
    deliverables: [
      { title: "Data review", detail: "What you are already collecting, how clean it is, and which questions it can honestly answer." },
      { title: "Analytics dashboards", detail: "The numbers your managers actually decide on, updated automatically rather than assembled by hand." },
      { title: "Forecasting and anomaly detection", detail: "Demand and cash forecasts, plus alerts when something moves outside its normal range." },
      { title: "AI-assisted workflows", detail: "Drafting, summarising, classifying and extracting — applied to the specific tasks eating your team's week." },
      { title: "Team training", detail: "Practical, role-specific sessions with your own documents and data, not generic slides." },
      { title: "Usage policy", detail: "A short, readable policy on what may and may not go into an AI tool, and why." },
    ],
    painPoints: [
      "Reporting means someone rebuilding the same spreadsheet every Monday.",
      "Staff are already pasting customer data into public AI tools.",
      "You bought an AI subscription and nobody can say what it changed.",
      "Decisions are made on last month's numbers.",
    ],
    faqs: [
      { q: "Do we need a data warehouse before any of this works?", a: "Usually not. Most SMEs get their first useful dashboards straight from the operational systems they already run. A warehouse is worth building later, once you know which questions you keep asking." },
      { q: "Is it safe to put our business data into AI tools?", a: "It depends entirely on the tool and the setting. Consumer tiers may train on what you submit; business tiers generally do not. We sort out which tools are acceptable, configure them correctly, and write a policy your staff can actually follow." },
      { q: "What does the training cover?", a: "Role-specific, hands-on sessions using your own documents: where these tools are reliable, where they confidently make things up, how to check output, and what must never be pasted in. Usually a half day per team." },
      { q: "Can you add AI to the systems we already run?", a: "Yes, where it earns its place. Our own CRM includes AI-assisted automation, and we add similar capabilities — classification, summarising, drafting — to existing systems through their APIs." },
    ],
    keywords: ["AI analytics", "AI training for business", "data dashboards SME", "business intelligence for SMEs"],
  },
  {
    slug: "google-ads",
    name: "Google Ads Management",
    longName: "Google Ads Management",
    summary:
      "Paid search aimed at people who are already looking to buy, measured on cost per qualified enquiry rather than clicks.",
    metaTitle: "Google Ads Management",
    metaDescription:
      "Google Ads management for SMEs. Conversion tracking first, intent-led campaigns, weekly optimisation and reporting on cost per qualified lead.",
    icon: "ads",
    intro: [
      "Google Ads is the fastest way to find out whether people want what you sell, because it puts you in front of demand that already exists. It is also the fastest way to spend money without learning anything, if conversions are not tracked properly.",
      "So we set up measurement before a peso is spent, start deliberately small, and scale only what produces enquiries your sales team is glad to receive.",
    ],
    deliverables: [
      { title: "Conversion tracking", detail: "Form submissions, calls and chats tracked end to end before any budget goes live." },
      { title: "Account build", detail: "Campaign structure around buying intent, with negative keywords that stop the obvious waste." },
      { title: "Ad copy and extensions", detail: "Multiple variants tested properly, with sitelinks, callouts and call extensions in place." },
      { title: "Landing pages", detail: "Pages built for the campaign rather than your homepage, which is where most ad budget quietly dies." },
      { title: "Weekly optimisation", detail: "Search term review, bid and budget adjustment, and pausing what does not convert." },
      { title: "Reporting", detail: "Spend, enquiries, cost per qualified lead and — where the sales cycle allows — revenue." },
    ],
    painPoints: [
      "You spend every month but cannot say what a customer costs to acquire.",
      "Ads point at a homepage that asks visitors to go hunting.",
      "Budget is going to search terms you would never have chosen.",
      "The agency reports impressions and clicks, never enquiries.",
    ],
    faqs: [
      { q: "What budget do we need to start?", a: "Around ₱30,000 to ₱60,000 a month in media spend for a single-city service business. Below roughly ₱25,000 there is rarely enough data to optimise on, and we would suggest SEO and content first." },
      { q: "How soon will we see results?", a: "Enquiries usually start in the first fortnight. A reliable cost per qualified lead takes six to eight weeks, because that is how long it takes to accumulate enough conversions to act on rather than guess from." },
      { q: "Who owns the ad account?", a: "You do. It is created under your billing with us as a managed user, so if we part ways you keep the account, the history and the learning." },
      { q: "Do you require a long contract?", a: "A three-month initial term, because measurement and optimisation need that long to mean anything, then month to month. No automatic annual renewals." },
    ],
    keywords: ["Google Ads management", "PPC management", "paid search management", "lead generation Google Ads"],
  },
  {
    slug: "seo",
    name: "Search Engine Optimization",
    longName: "Search Engine Optimization",
    summary:
      "Technical and content SEO that earns enquiries from people already searching for what you sell — reported on leads, not rankings.",
    metaTitle: "SEO Services — Technical, Local & Content",
    metaDescription:
      "Technical SEO, local SEO and content for SMEs. Core Web Vitals, structured data, Google Business Profile and reporting on qualified enquiries.",
    icon: "seo",
    intro: [
      "SEO is three things done properly: a site search engines can crawl and render, pages that answer what people actually search for, and enough credibility that those pages are trusted.",
      "We work on all three and report on enquiries rather than ranking positions, because a position is not a business outcome.",
    ],
    deliverables: [
      { title: "Technical audit and fixes", detail: "Crawlability, indexation, Core Web Vitals, canonicals and structured data — fixed, not merely listed in a report." },
      { title: "Keyword and intent mapping", detail: "One page per intent, mapped to the stage of the buying decision it serves." },
      { title: "On-page optimisation", detail: "Titles, meta descriptions, heading structure, internal links and image alt text across the site." },
      { title: "Local SEO", detail: "Google Business Profile, local directory citations, service-area pages and a review strategy." },
      { title: "Content production", detail: "Articles and service pages written to rank and to convince the person reading them." },
      { title: "Answer engine readiness", detail: "Structured data, consistent business facts and answer-first copy, so AI assistants can cite you accurately." },
      { title: "Monthly reporting", detail: "Impressions, clicks, positions and — the number that matters — enquiries attributed to organic search." },
    ],
    painPoints: [
      "You rank for your own brand name and nothing else.",
      "Traffic rises but enquiries do not.",
      "A previous agency left hundreds of thin pages diluting the site.",
      "Competitors with worse service outrank you.",
    ],
    faqs: [
      { q: "How long does SEO take to work?", a: "Technical fixes can move rankings in two to six weeks. Content-driven growth in a competitive market shows clear movement at three to four months and compounds from there. Anyone promising page one in a fortnight is selling something else." },
      { q: "How much does SEO cost?", a: "A one-off technical audit runs ₱35,000 to ₱80,000. Ongoing retainers start at ₱35,000 a month for local service businesses and rise with the breadth of content production." },
      { q: "Do you guarantee first-page rankings?", a: "No, and no honest agency does — Google's ranking systems are not ours to guarantee. We commit to the work, to transparent reporting, and to being measured on qualified enquiries." },
      { q: "Is local SEO different?", a: "Yes. It adds Google Business Profile optimisation, consistent local business citations, location pages and review generation. For a business serving one city it is usually the highest-return SEO work available." },
    ],
    keywords: ["SEO services", "technical SEO", "local SEO", "SEO agency Philippines"],
  },
  {
    slug: "ecommerce-growth",
    name: "E-commerce Growth",
    longName: "E-commerce Growth",
    summary:
      "Grow online revenue across your own store and the marketplaces — with stock, pricing and orders staying in one place.",
    metaTitle: "E-commerce Growth | Stores & Marketplaces",
    metaDescription:
      "E-commerce growth for online sellers: conversion optimisation, marketplace operations including Shopee and Lazada, inventory synchronisation and retention marketing.",
    icon: "cart",
    intro: [
      "Online growth rarely happens on one channel. Most sellers run their own store alongside Shopee, Lazada and TikTok Shop, and the operational cost of keeping those in step quietly eats the margin.",
      "We work both halves: lifting conversion and repeat purchase on the demand side, and connecting stock, pricing and orders on the operations side so growth does not create chaos.",
    ],
    deliverables: [
      { title: "Store conversion work", detail: "Product pages, checkout, payment and delivery options tested against real conversion data." },
      { title: "Marketplace operations", detail: "Shopee, Lazada and TikTok Shop listings, campaigns, vouchers and ratings managed deliberately." },
      { title: "Inventory synchronisation", detail: "One stock figure across every channel, so you stop overselling what you no longer have." },
      { title: "Pricing and promotions", detail: "Channel-aware pricing that accounts for commission and shipping before it claims a margin." },
      { title: "Retention marketing", detail: "Email, SMS and Viber flows for abandoned carts, replenishment and win-back." },
      { title: "Reporting", detail: "Revenue, contribution margin and customer acquisition cost per channel — not just gross sales." },
    ],
    painPoints: [
      "You sell an item on two channels that you only had one of.",
      "Marketplace fees mean the best-selling product makes the least money.",
      "Every order is re-typed into the accounting system by hand.",
      "Almost all revenue comes from first-time buyers.",
    ],
    faqs: [
      { q: "Should we sell on marketplaces or on our own store?", a: "Both, for different reasons. Marketplaces bring traffic you do not have to buy but keep the customer relationship and a double-digit commission. Your own store is more profitable and gives you the customer data. Most sellers should be on both, and know the contribution margin of each." },
      { q: "How do you stop overselling across channels?", a: "By making one system authoritative for stock and synchronising outward to every channel, so a sale anywhere decrements availability everywhere. Our Retail Suite and ERP do this natively; we can also connect an existing system." },
      { q: "Which platforms do you work with?", a: "Shopify and WooCommerce for own-brand stores, plus Shopee, Lazada and TikTok Shop. Where our own products are involved, orders can flow straight into inventory and accounting." },
      { q: "What is the fastest win for an existing store?", a: "Usually retention. Abandoned-cart and replenishment flows to customers who already bought from you cost almost nothing to run and typically pay back within a month — before any new acquisition spend." },
    ],
    keywords: ["ecommerce growth", "marketplace management", "online store optimisation", "ecommerce inventory sync"],
  },
] as const;

export function getService(slug: string): Service | undefined {
  return SERVICES.find((s) => s.slug === slug);
}
