/**
 * Single source of truth for brand, contact and service content.
 *
 * Page metadata, JSON-LD structured data, the sitemap, the navigation and the
 * marketing copy all read from here, so there is one place to change a phone
 * number or add a service and no risk of the sitemap drifting from the routes.
 */

export const SITE = {
  name: "GamaTech Systems",
  legalName: "GamaTech Systems",
  shortName: "GamaTech",
  tagline: "Software and systems that run your business",
  description:
    "GamaTech Systems builds custom software, automation and growth systems for small and medium businesses in the Philippines — from internal tools and web apps to SEO, AEO and marketing.",
  // Read from the environment at render time so staging and production differ
  // without a code change. Falls back to the production hostname.
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.gamatechsystems.com").replace(/\/+$/, ""),
  locale: "en_PH",
  language: "en-PH",
  email: "hello@gamatechsystems.com",
  phoneDisplay: "+63 917 000 0000",
  phoneHref: "+639170000000",
  address: {
    street: "",
    city: "Metro Manila",
    region: "NCR",
    postalCode: "",
    country: "PH",
    countryName: "Philippines",
  },
  founded: "2021",
  areaServed: ["Philippines", "Metro Manila", "Cebu", "Davao", "Southeast Asia"],
  hours: "Mon–Fri, 9:00–18:00 PHT",
  social: {
    facebook: "https://www.facebook.com/gamatechsystems",
    linkedin: "https://www.linkedin.com/company/gamatechsystems",
  },
} as const;

export type ServiceSlug =
  | "software-development"
  | "systems-automation"
  | "web-development"
  | "custom-software"
  | "seo"
  | "aeo"
  | "marketing";

export type Service = {
  slug: ServiceSlug;
  /** Short label for navigation and cards. */
  name: string;
  /** Full H1 / structured-data name. */
  longName: string;
  /** One-sentence value proposition (used in cards and meta descriptions). */
  summary: string;
  /** SEO title, under 60 characters where possible. */
  metaTitle: string;
  metaDescription: string;
  icon: "code" | "automation" | "web" | "custom" | "seo" | "aeo" | "marketing";
  /** Opening paragraphs for the service page. */
  intro: string[];
  /** Concrete deliverables. */
  deliverables: { title: string; detail: string }[];
  /** Typical problems this service solves, phrased the way clients say them. */
  painPoints: string[];
  /** The delivery process, step by step. */
  process: { step: string; detail: string }[];
  /** Answer-engine-friendly question/answer pairs (rendered as FAQPage schema). */
  faqs: { q: string; a: string }[];
  /** Indicative engagement shape. */
  engagement: string;
  keywords: string[];
};

export const SERVICES: readonly Service[] = [
  {
    slug: "software-development",
    name: "Software Development",
    longName: "Software Development for Philippine SMEs",
    summary:
      "Full-cycle development of the web and mobile applications your business runs on — scoped, built and supported by one accountable team.",
    metaTitle: "Software Development Philippines",
    metaDescription:
      "GamaTech Systems builds reliable web and mobile software for Philippine SMEs. Fixed-scope discovery, two-week releases, documented handover and ongoing support.",
    icon: "code",
    intro: [
      "Most SMEs do not need a bigger team — they need software that stops the daily firefighting. We design and build the applications that carry your operations: order and inventory systems, booking platforms, dashboards, client portals and the internal tools nobody else sells off the shelf.",
      "Every engagement starts with a paid discovery sprint that produces a written scope, a clickable prototype and a fixed price. You decide whether to build before you commit a peso to development.",
    ],
    deliverables: [
      { title: "Discovery and technical scope", detail: "Workflow mapping, data model, architecture decision record and a fixed-price build plan." },
      { title: "Production application", detail: "Web or mobile, built on mainstream, well-supported technology your next developer will recognise." },
      { title: "Automated test suite", detail: "Coverage of the paths that would cost you money if they broke, so releases stay safe." },
      { title: "Deployment pipeline", detail: "One-command deploys, staging environment, database backups and monitoring." },
      { title: "Documentation and handover", detail: "Runbooks, architecture notes and recorded walkthroughs — you own everything." },
    ],
    painPoints: [
      "Spreadsheets have become the system of record, and nobody trusts the numbers.",
      "Off-the-shelf software covers 70% of the workflow and fights you on the rest.",
      "The last developer disappeared and left no documentation.",
      "Reporting takes three days of manual consolidation every month.",
    ],
    process: [
      { step: "Discovery sprint", detail: "One to two weeks mapping the current workflow, the data and the constraints. Output: scope, prototype, fixed price." },
      { step: "Build in two-week increments", detail: "Working software on a staging URL every fortnight. You review as it is built, not at the end." },
      { step: "User acceptance testing", detail: "Your team runs real work through the system while we are still on the clock." },
      { step: "Launch and stabilise", detail: "Phased cutover, data migration, training sessions and two weeks of hypercare." },
      { step: "Support and iterate", detail: "A monthly retainer for fixes, small features and version upgrades — or a clean handover." },
    ],
    faqs: [
      { q: "How much does custom software cost in the Philippines?", a: "A focused internal tool typically runs ₱250,000 to ₱600,000; a multi-role operational platform ₱800,000 to ₱2.5 million. We quote a fixed price after a paid discovery sprint, so the number you approve is the number you pay." },
      { q: "How long does development take?", a: "A first usable version is normally live in 8 to 14 weeks. We ship to a staging environment every two weeks, so you see progress throughout rather than waiting for a single reveal." },
      { q: "Who owns the source code?", a: "You do, in full, from the first commit. Code lives in a repository under your account, and the handover package includes documentation, credentials and deployment runbooks." },
      { q: "Can you take over software another developer built?", a: "Yes. We begin with a technical audit covering security, dependencies and test coverage, then give you a written assessment and a remediation plan before changing anything." },
    ],
    engagement: "Paid discovery sprint from ₱45,000, credited against the build. Fixed-price projects or a monthly retainer thereafter.",
    keywords: ["software development Philippines", "software company Manila", "SME software development", "web application development Philippines"],
  },
  {
    slug: "systems-automation",
    name: "Systems Automation",
    longName: "Systems and Workflow Automation",
    summary:
      "Remove the manual re-typing between your tools. We connect the systems you already pay for and automate the work in between.",
    metaTitle: "Business Process Automation Philippines",
    metaDescription:
      "Automate quoting, invoicing, onboarding and reporting. GamaTech Systems connects your existing tools so Philippine SMEs stop re-typing data between systems.",
    icon: "automation",
    intro: [
      "Automation is the fastest return on software spend available to an SME, because the work already exists — somebody is doing it by hand. We find the handoffs where data is copied, re-typed or chased, and we close them.",
      "We do not rip out your tools. If your team lives in Google Sheets, Xero, Shopify, Lazada, Viber and a Facebook inbox, that is the system we automate.",
    ],
    deliverables: [
      { title: "Process audit", detail: "A measured map of every manual handoff, with hours and error rates attached to each one." },
      { title: "Integrations", detail: "Reliable connections between your accounting, e-commerce, CRM, inventory and messaging tools." },
      { title: "Automated documents", detail: "Quotes, invoices, delivery receipts and payroll summaries generated and filed without typing." },
      { title: "Scheduled reporting", detail: "The numbers management asks for, delivered to an inbox or dashboard every morning." },
      { title: "Alerting and error handling", detail: "When an automation fails, a human is told immediately — silence is never treated as success." },
    ],
    painPoints: [
      "The same order is typed into three different systems.",
      "Month-end close takes a week of copy-paste.",
      "Stock levels online never match stock levels in the warehouse.",
      "Customer follow-ups depend on somebody remembering.",
    ],
    process: [
      { step: "Audit", detail: "Two to five days shadowing the actual process, timing each step and quantifying the cost of the manual work." },
      { step: "Prioritise", detail: "We rank candidates by hours saved per peso spent and start with the highest-return one." },
      { step: "Build and pilot", detail: "The first automation runs in parallel with the manual process until it has proven itself." },
      { step: "Roll out", detail: "Switch over, train the team, and document the exception paths." },
      { step: "Monitor", detail: "Dashboards and alerts so you know the automation is still working months later." },
    ],
    faqs: [
      { q: "What business processes are worth automating first?", a: "Start where data is re-typed between two systems, where a document is assembled by hand, or where a follow-up depends on memory. Order-to-invoice, stock synchronisation and month-end reporting are the three that repay fastest for Philippine SMEs." },
      { q: "Do we have to replace our existing software?", a: "No. Most of our automation work connects tools clients already pay for — Google Workspace, Xero, QuickBooks, Shopify, Lazada, Shopee and Viber among them. Replacing a tool is a decision we would only recommend with a clear business case." },
      { q: "How quickly does automation pay for itself?", a: "A typical first automation saves 20 to 60 staff hours a month and pays for itself within one to four months. The audit quantifies this before you commit to a build." },
      { q: "What happens when an automation breaks?", a: "Every workflow we build has explicit error handling: failures are retried, then escalated to a named person with the failing record attached. Nothing is allowed to fail silently." },
    ],
    engagement: "Process audit from ₱25,000. Individual automations from ₱60,000, or a monthly automation retainer.",
    keywords: ["business process automation Philippines", "workflow automation SME", "systems integration Philippines", "RPA Philippines"],
  },
  {
    slug: "web-development",
    name: "Web Development",
    longName: "Web Development and Website Design",
    summary:
      "Fast, accessible, search-ready websites built to convert visitors into enquiries — not template installs that slow to a crawl.",
    metaTitle: "Web Development Philippines",
    metaDescription:
      "Hand-built websites for Philippine SMEs: sub-second load times, mobile-first, accessible, SEO-ready and wired to capture leads. Built by GamaTech Systems.",
    icon: "web",
    intro: [
      "A business website has one job: turn a stranger's attention into a conversation your sales team can have. We build sites that do that measurably — fast on a mobile connection, clear about what you sell, and instrumented so you can see which pages produce enquiries.",
      "Every site ships with the technical SEO groundwork already done: clean URLs, one H1 per page, structured data, a real sitemap, image alt text and Core Web Vitals in the green.",
    ],
    deliverables: [
      { title: "Design system", detail: "A consistent set of type, colour and components — not a page-by-page redesign that drifts." },
      { title: "Hand-built front end", detail: "No page-builder bloat. Sub-second first paint on a 4G connection." },
      { title: "Content management", detail: "An admin area your marketing person can actually use, without touching code." },
      { title: "Lead capture", detail: "Validated, spam-resistant forms wired to your inbox and your CRM." },
      { title: "Analytics and Core Web Vitals", detail: "Measurement set up on day one, with a performance budget enforced in the build." },
    ],
    painPoints: [
      "The site takes six seconds to load on a phone and visitors leave.",
      "Nobody can update a price without emailing the agency.",
      "Enquiries arrive with no indication of which page produced them.",
      "The design looks right on a laptop and breaks on mobile.",
    ],
    process: [
      { step: "Content and structure", detail: "Decide what each page must prove before anything is designed." },
      { step: "Design", detail: "Mobile-first layouts and a reusable component set, reviewed in the browser rather than a static mockup." },
      { step: "Build", detail: "Hand-coded, accessible markup with a performance budget enforced on every commit." },
      { step: "SEO and analytics", detail: "Metadata, structured data, sitemap, redirects from old URLs, and conversion tracking." },
      { step: "Launch and measure", detail: "Go live, then review real traffic and conversion data after 30 days." },
    ],
    faqs: [
      { q: "How much does a business website cost in the Philippines?", a: "A focused five to eight page site with lead capture runs ₱120,000 to ₱280,000. A larger site with a blog, service pages and a custom admin typically runs ₱280,000 to ₱600,000." },
      { q: "How long does a website take to build?", a: "Four to eight weeks for a standard business site, assuming content is ready. Content preparation is usually the longest step, so we start it on day one." },
      { q: "Will the website work well on mobile?", a: "Yes. We build mobile-first and test on real devices on Philippine mobile networks, because that is how most of your visitors will arrive." },
      { q: "Do you also handle hosting and maintenance?", a: "Yes. Managed hosting, security patching, backups, uptime monitoring and content updates are available as a monthly plan, or we can hand everything to your own team with documentation." },
    ],
    engagement: "Websites from ₱120,000. Optional managed hosting and maintenance from ₱8,000 per month.",
    keywords: ["web development Philippines", "website design Philippines", "web developer Manila", "SME website Philippines"],
  },
  {
    slug: "custom-software",
    name: "Custom Software",
    longName: "Custom Software Built Around Your Operation",
    summary:
      "When the off-the-shelf product almost fits, the gap is where your margin leaks. We build the system that fits exactly.",
    metaTitle: "Custom Software Development for SMEs",
    metaDescription:
      "Bespoke ERP, CRM, inventory and field-service systems for Philippine SMEs. Built around how your business actually works, owned entirely by you.",
    icon: "custom",
    intro: [
      "Generic software makes you adapt to its assumptions. For a business whose advantage is in how it operates, that is a real cost: workarounds, shadow spreadsheets and staff who know the exceptions by heart.",
      "Custom software is worth it when the process is your differentiator, when licence costs scale badly with headcount, or when no vendor serves your niche. We will tell you honestly when a configured off-the-shelf product is the better buy.",
    ],
    deliverables: [
      { title: "Operational core", detail: "The one system your team works in daily, modelled on your real workflow and vocabulary." },
      { title: "Role-based access control", detail: "Permissions enforced on the server for every action, so staff see exactly what their role allows." },
      { title: "Reporting and exports", detail: "The reports your managers, accountants and regulators need, generated on demand." },
      { title: "Data migration", detail: "Historic records moved across, reconciled and verified against your existing figures." },
      { title: "Audit trail", detail: "Who changed what, when — essential for financial and inventory systems." },
    ],
    painPoints: [
      "Licence fees rise every time you hire, for features you never use.",
      "Your process does not fit the vendor's idea of your industry.",
      "Critical business logic lives in one person's head.",
      "Three systems hold three different versions of the truth.",
    ],
    process: [
      { step: "Honest assessment", detail: "We compare building against configuring an existing product, with real numbers. Sometimes the answer is: do not build." },
      { step: "Domain modelling", detail: "Workshops to capture the entities, states and rules your business actually runs on." },
      { step: "Incremental build", detail: "The highest-value module first, in production and earning before the rest is built." },
      { step: "Migration and parallel run", detail: "Old and new side by side until the numbers reconcile exactly." },
      { step: "Ownership transfer", detail: "Code, infrastructure, documentation and training — or an ongoing support retainer, your choice." },
    ],
    faqs: [
      { q: "When is custom software the right choice over off-the-shelf?", a: "Build when your process is a competitive advantage, when per-seat licensing scales badly against your headcount, when no vendor serves your niche, or when integration between existing tools is itself the hard problem. Otherwise configuring a proven product is cheaper and faster, and we will say so." },
      { q: "What happens if we stop working with you?", a: "Nothing breaks. The code is in your repository, hosted on your infrastructure, under a licence you own outright, with documentation written for a developer who has never met us." },
      { q: "Can custom software integrate with our accounting system?", a: "Yes. Xero, QuickBooks and SAP Business One integrations are routine, as are BIR-compliant reporting exports for Philippine statutory requirements." },
      { q: "How do you keep a custom system secure?", a: "Server-side authorisation on every action, parameterised database queries, hashed credentials, rate-limited authentication, encrypted transport, audited dependencies and a logged trail of every change. The same standards this website is built to." },
    ],
    engagement: "Fixed-price modules after a discovery sprint. Typical first phase ₱300,000 to ₱900,000.",
    keywords: ["custom software development Philippines", "bespoke software SME", "custom ERP Philippines", "custom CRM Philippines"],
  },
  {
    slug: "seo",
    name: "SEO",
    longName: "Search Engine Optimisation",
    summary:
      "Technical and content SEO that earns qualified traffic from people already searching for what you sell.",
    metaTitle: "SEO Services Philippines",
    metaDescription:
      "Technical SEO, local SEO and content strategy for Philippine SMEs. Core Web Vitals, structured data, Google Business Profile and measurable organic growth.",
    icon: "seo",
    intro: [
      "SEO is not a monthly report of rankings nobody acts on. It is three things done properly: a site search engines can crawl and render, pages that answer what people actually search for, and enough authority that those pages are trusted.",
      "We work on all three, report on enquiries rather than vanity positions, and tell you plainly which work moved the number.",
    ],
    deliverables: [
      { title: "Technical audit and fixes", detail: "Crawlability, indexation, Core Web Vitals, canonical tags, structured data and mobile usability — fixed, not just listed." },
      { title: "Keyword and intent mapping", detail: "One page per intent, mapped to the stage of the buying decision it serves." },
      { title: "On-page optimisation", detail: "Titles, meta descriptions, heading hierarchy, internal links and image alt text across the site." },
      { title: "Local SEO", detail: "Google Business Profile, Philippine citations, service-area pages and review strategy." },
      { title: "Content production", detail: "Articles and service pages written to rank and to convince a human reader." },
      { title: "Monthly reporting", detail: "Impressions, clicks, rankings and — the number that matters — enquiries attributed to organic search." },
    ],
    painPoints: [
      "You rank for your own brand name and nothing else.",
      "Traffic goes up but enquiries do not.",
      "A previous agency built hundreds of thin pages that now dilute the site.",
      "Competitors with worse service outrank you.",
    ],
    process: [
      { step: "Audit and baseline", detail: "Full technical crawl, Search Console review and a documented starting position." },
      { step: "Fix the foundations", detail: "Indexation, speed and structured data first — content cannot outrun a broken site." },
      { step: "Build the content map", detail: "The set of pages you need to own your category, prioritised by commercial value." },
      { step: "Publish and earn links", detail: "Consistent publishing plus genuine local and industry citations." },
      { step: "Measure and iterate", detail: "Monthly review against enquiries, not impressions." },
    ],
    faqs: [
      { q: "How long does SEO take to show results?", a: "Technical fixes can move rankings within two to six weeks. Content-driven growth in a competitive Philippine market typically shows clear movement at three to four months and compounds from there. Anyone promising page one in a fortnight is selling you something else." },
      { q: "How much do SEO services cost in the Philippines?", a: "A one-off technical audit runs ₱35,000 to ₱80,000. Ongoing SEO retainers start at ₱35,000 a month for local service businesses and rise with the breadth of content production." },
      { q: "Do you guarantee first-page rankings?", a: "No, and no honest agency does — Google's ranking systems are not ours to guarantee. We commit to the work, to transparent reporting, and to being measured on qualified enquiries." },
      { q: "Is local SEO different from regular SEO?", a: "Yes. Local SEO adds Google Business Profile optimisation, consistent Philippine business citations, location and service-area pages, and review generation. For a business serving one city it is usually the highest-return SEO work available." },
    ],
    engagement: "Technical audit from ₱35,000. Ongoing retainers from ₱35,000 per month.",
    keywords: ["SEO services Philippines", "SEO agency Manila", "local SEO Philippines", "technical SEO Philippines"],
  },
  {
    slug: "aeo",
    name: "AEO",
    longName: "Answer Engine Optimisation (AEO)",
    summary:
      "Be the source that AI assistants and search answers quote when someone asks about your category.",
    metaTitle: "Answer Engine Optimisation (AEO) Philippines",
    metaDescription:
      "Get cited by ChatGPT, Google AI Overviews, Perplexity and Copilot. GamaTech Systems structures your content so answer engines quote your business, not a competitor.",
    icon: "aeo",
    intro: [
      "A growing share of buying research never reaches a results page. Someone asks an assistant, reads a synthesised answer, and contacts whichever two or three businesses it named. If you are not in that answer, you were never in the running.",
      "Answer Engine Optimisation is the discipline of being the source worth quoting: unambiguous facts, structured data an engine can parse, answer-first writing, and a consistent presence across the places these systems draw from.",
    ],
    deliverables: [
      { title: "Answer-engine visibility audit", detail: "What ChatGPT, Google AI Overviews, Perplexity and Copilot currently say about your category — and who they cite." },
      { title: "Entity and knowledge-graph work", detail: "Consistent, machine-readable facts about your business across your site, Google Business Profile and major directories." },
      { title: "Structured data implementation", detail: "Organization, LocalBusiness, Service, FAQPage, Article and Breadcrumb schema, validated and monitored." },
      { title: "Answer-first content", detail: "Pages that state the answer in the first two sentences, then support it — the shape engines extract." },
      { title: "Citable assets", detail: "Original data, pricing transparency and clear definitions that give an engine a reason to quote you." },
      { title: "Citation tracking", detail: "Monthly monitoring of which assistants mention you, for which prompts, alongside which competitors." },
    ],
    painPoints: [
      "AI assistants recommend competitors and never mention you.",
      "Your pricing and service details are too vague to be quoted.",
      "Your business details differ across every directory that lists you.",
      "Organic traffic is falling while impressions hold steady.",
    ],
    process: [
      { step: "Baseline prompts", detail: "We record how the major assistants answer the 30 to 60 prompts your buyers would actually type." },
      { step: "Fix the entity", detail: "Make your name, address, services and claims identical and machine-readable everywhere they appear." },
      { step: "Restructure for extraction", detail: "Rewrite key pages answer-first, with explicit questions as headings and schema to match." },
      { step: "Publish citable material", detail: "Transparent pricing, original benchmarks and plain definitions an engine can lift with confidence." },
      { step: "Track citations", detail: "Re-run the prompt set monthly and report where you now appear." },
    ],
    faqs: [
      { q: "What is Answer Engine Optimisation (AEO)?", a: "AEO is the practice of making your business the source that AI assistants and AI-generated search answers cite. Where SEO optimises for a ranked list of links, AEO optimises for being quoted inside a synthesised answer — which depends on structured data, factual consistency and answer-first writing." },
      { q: "How is AEO different from SEO?", a: "SEO earns a click from a results page; AEO earns a mention inside an answer the user may never click past. They share foundations — crawlable pages, clear content, authority — but AEO leans much harder on structured data, unambiguous facts and content shaped for extraction rather than browsing." },
      { q: "Can you actually influence what ChatGPT says about my business?", a: "You cannot control it, but you can materially influence it. These systems draw on your website, your structured data and third-party sources about you. Making those consistent, specific and easy to parse is what moves the needle — and we track the change prompt by prompt." },
      { q: "Does AEO replace SEO?", a: "No. Answer engines largely draw from pages that already rank and are already crawlable, so AEO builds on SEO rather than replacing it. The two are best run together." },
    ],
    engagement: "AEO audit from ₱45,000. Combined SEO + AEO retainers from ₱55,000 per month.",
    keywords: ["answer engine optimisation", "AEO services Philippines", "AI search optimisation", "generative engine optimisation Philippines"],
  },
  {
    slug: "marketing",
    name: "Marketing",
    longName: "Digital Marketing and Demand Generation",
    summary:
      "Paid, content and lifecycle marketing run as one system, measured on cost per qualified enquiry.",
    metaTitle: "Digital Marketing for SMEs — Philippines",
    metaDescription:
      "Google Ads, Meta Ads, email and content marketing for Philippine SMEs. One system, tracked end to end, measured on cost per qualified lead by GamaTech Systems.",
    icon: "marketing",
    intro: [
      "Marketing fails for SMEs when the channels are run as separate experiments. Ads send traffic to a page nobody optimised, the enquiry lands in an inbox nobody works, and no one can say which peso produced which customer.",
      "We run marketing as one system — traffic, landing page, follow-up and measurement — so every channel is accountable to the same number: cost per qualified enquiry.",
    ],
    deliverables: [
      { title: "Measurement foundation", detail: "Conversion tracking, GA4, call tracking and CRM attribution set up before any spend." },
      { title: "Paid search and social", detail: "Google Ads and Meta Ads built around buying intent, not reach, with weekly optimisation." },
      { title: "Landing pages", detail: "Purpose-built pages per campaign, tested and iterated against conversion rate." },
      { title: "Email and lifecycle", detail: "Nurture sequences, re-engagement and retention flows that work the leads you already have." },
      { title: "Content and social", detail: "A publishing cadence that compounds instead of a feed that goes quiet." },
      { title: "Reporting", detail: "Spend, enquiries, cost per qualified lead and pipeline — in one monthly view you can act on." },
    ],
    painPoints: [
      "You spend on ads but cannot say what a customer costs to acquire.",
      "Leads arrive and nobody follows up for three days.",
      "Facebook reach is falling and nothing has replaced it.",
      "Marketing and sales report different numbers.",
    ],
    process: [
      { step: "Measurement first", detail: "No budget goes live until conversions are tracked end to end. Spending blind is the most expensive option." },
      { step: "Offer and message", detail: "Sharpen what you are actually selling and why someone should choose you this month." },
      { step: "Launch small", detail: "Controlled budget across two channels to find what converts before scaling." },
      { step: "Optimise weekly", detail: "Creative, audience and landing-page iteration on a weekly cycle." },
      { step: "Scale what works", detail: "Shift budget toward the lowest cost per qualified enquiry and keep testing the next channel." },
    ],
    faqs: [
      { q: "What marketing budget does an SME need to start?", a: "Plan on ₱40,000 to ₱80,000 a month in combined ad spend and management for a single city service business. Below roughly ₱25,000 in media spend there is rarely enough data to optimise on, so we would recommend SEO and content first." },
      { q: "Which channel works best for Philippine SMEs?", a: "It depends on intent. Google Ads captures people already looking to buy and usually wins on cost per qualified lead; Meta Ads build demand and work well for visual and local offers. Most of our clients run both, weighted by what the measurement shows." },
      { q: "How do you measure marketing performance?", a: "On cost per qualified enquiry and, where the sales cycle allows, on closed revenue. Impressions, reach and engagement are diagnostics, not results." },
      { q: "Do you require a long contract?", a: "A three-month initial term, because measurement and optimisation need that long to be meaningful, then month to month. No automatic annual renewals." },
    ],
    engagement: "Management from ₱30,000 per month plus media spend. Three-month initial term, then monthly.",
    keywords: ["digital marketing Philippines", "Google Ads agency Philippines", "Meta Ads Philippines", "lead generation Philippines"],
  },
] as const;

export function getService(slug: string): Service | undefined {
  return SERVICES.find((s) => s.slug === slug);
}

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Insights" },
  { href: "/contact", label: "Contact" },
] as const;

/** Site-wide questions, used for the home-page FAQ and FAQPage schema. */
export const COMPANY_FAQS = [
  {
    q: "What does GamaTech Systems do?",
    a: "GamaTech Systems is a Philippine software company that builds and runs the systems small and medium businesses depend on. We cover software development, systems automation, web development and custom software, plus the SEO, AEO and marketing work that brings customers to them.",
  },
  {
    q: "Who do you work with?",
    a: "Small and medium businesses in the Philippines, typically between 5 and 200 staff, in retail and e-commerce, logistics, professional services, healthcare, manufacturing and construction. We work with owners and operations leads, not procurement committees.",
  },
  {
    q: "How much does a project cost?",
    a: "Websites start at ₱120,000, automation projects at ₱60,000, and custom software phases at ₱300,000. Every build is quoted at a fixed price after a paid discovery sprint, so the figure you approve is the figure you pay.",
  },
  {
    q: "How do engagements start?",
    a: "With a 30-minute call to understand the problem, then a written proposal within three working days. Build work begins with a paid discovery sprint that produces a scope, a prototype and a fixed price before you commit to development.",
  },
  {
    q: "Do you work with businesses outside Metro Manila?",
    a: "Yes. We work remotely with clients across the Philippines and Southeast Asia, with on-site visits for discovery workshops and launch training where a project warrants it.",
  },
  {
    q: "Who owns the code and data you build?",
    a: "You do, completely. Repositories sit under your account, infrastructure is in your name, and every engagement ends with a documented handover package. There is no lock-in.",
  },
] as const;

export const PROOF_POINTS = [
  { value: "40+", label: "systems shipped for Philippine SMEs" },
  { value: "2 weeks", label: "between working releases" },
  { value: "60%", label: "average manual hours removed by automation" },
  { value: "<1s", label: "load time on the sites we build" },
] as const;

export const INDUSTRIES = [
  "Retail & e-commerce",
  "Logistics & distribution",
  "Professional services",
  "Healthcare & clinics",
  "Manufacturing",
  "Construction & trades",
  "Education",
  "Food & beverage",
] as const;
