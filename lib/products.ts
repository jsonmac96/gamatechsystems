/**
 * GaMatech Systems core products.
 *
 * The product codes (M5–M10), names and key-feature lists come straight from
 * the company's product plan. Everything else on this page — the positioning
 * sentence, the "who it is for" line and the FAQs — is supporting copy built
 * around those features.
 */

export type ProductSlug =
  | "restaurant-suite"
  | "retail-suite"
  | "erp"
  | "payroll-hris"
  | "triage"
  | "crm";

export type Product = {
  slug: ProductSlug;
  /** Internal product code, e.g. "M5". Shown as a badge. */
  code: string;
  /** Short name for navigation and cards. */
  name: string;
  /** Full name used as the page H1 and in structured data. */
  longName: string;
  /** One-sentence positioning. */
  summary: string;
  metaTitle: string;
  metaDescription: string;
  icon: "restaurant" | "retail" | "erp" | "people" | "triage" | "crm";
  /** Who the product is built for. */
  audience: string;
  /** Opening paragraphs for the product page. */
  intro: string[];
  /**
   * The key features, verbatim from the product plan (tidied for spelling),
   * each with a sentence explaining what it does.
   */
  features: { title: string; detail: string }[];
  /** Problems this product removes, phrased the way operators describe them. */
  painPoints: string[];
  /** What rollout looks like. */
  rollout: { step: string; detail: string }[];
  faqs: { q: string; a: string }[];
  keywords: string[];
};

export const PRODUCTS: readonly Product[] = [
  {
    slug: "restaurant-suite",
    code: "M5",
    name: "Restaurant Suite",
    longName: "M5 Restaurant Suite",
    summary:
      "Everything a restaurant runs on in one system: POS, kitchen display, mobile order taking, back office and inventory down to the recipe.",
    metaTitle: "M5 Restaurant Suite — POS & Kitchen System",
    metaDescription:
      "Restaurant POS, kitchen display, mobile order taker, back office and recipe-level inventory with production. Built by GaMatech Systems for Philippine food businesses.",
    icon: "restaurant",
    audience:
      "Single outlets through to multi-branch restaurant groups, commissaries and food service operators.",
    intro: [
      "Most restaurant software stops at the till. M5 covers the whole operation — the order taken at the table, the ticket on the kitchen screen, the stock it consumed, the production run that replenished it, and the margin it left behind.",
      "Because the POS and inventory share one database, food cost is a live number rather than something you reconstruct at month end. Sell a dish and its recipe is deducted from stock immediately.",
    ],
    features: [
      { title: "Point of sale", detail: "Fast, offline-tolerant ordering with split bills, discounts, senior and PWD handling, and void controls." },
      { title: "Kitchen display", detail: "Tickets routed to the right station as they are rung up, with timing so nobody has to shout across the line." },
      { title: "Mobile order taker", detail: "Waiters take orders at the table on a phone; the kitchen sees them before they reach the counter." },
      { title: "Back office", detail: "Menus, prices, discounts, user permissions and branch settings, managed centrally." },
      { title: "Inventory with production", detail: "Recipe-level deduction, commissary production runs, transfers between branches, spoilage and wastage." },
      { title: "Dashboard", detail: "Net sales, average ticket, food cost percentage, gross profit and estimated net income, updated as you trade." },
    ],
    painPoints: [
      "Food cost is a guess until the accountant finishes the month.",
      "The POS and the stock sheet disagree, and nobody can say which is right.",
      "Orders get lost between the floor and the kitchen on a busy night.",
      "Each branch reports its numbers in a slightly different format.",
    ],
    rollout: [
      { step: "Menu and recipe build", detail: "We load your menu, recipes and units of measure, and reconcile them against your current stock list." },
      { step: "Hardware and install", detail: "POS terminals, kitchen screens and printers set up and tested in the outlet." },
      { step: "Parallel run", detail: "The new system runs alongside your current process for a trading week until the numbers match." },
      { step: "Staff training", detail: "Separate sessions for cashiers, kitchen staff and managers, with a printed quick reference." },
      { step: "Go live and support", detail: "We are on site for the first full service day, then on call." },
    ],
    faqs: [
      { q: "Does the POS work when the internet goes down?", a: "Yes. The terminal keeps taking orders and printing receipts offline, then syncs automatically once the connection returns. Losing internet during service should never stop you trading." },
      { q: "Can it track food cost per dish?", a: "Yes. Each menu item is linked to a recipe, so selling it deducts the component ingredients from stock. That gives you a live food cost percentage and gross profit per dish, rather than a figure reconstructed weeks later." },
      { q: "Does it handle more than one branch?", a: "Yes. Branches share one back office, with stock transfers between them, per-branch dashboards and a consolidated group view. A central commissary can run production for the others." },
      { q: "Is it BIR compliant?", a: "The system produces the sales records, VAT breakdowns and discount logs your accountant needs. BIR accreditation of a specific POS configuration is handled as part of the rollout — talk to us about where you are in that process." },
    ],
    keywords: ["restaurant POS Philippines", "kitchen display system", "restaurant inventory software", "food cost software Philippines"],
  },
  {
    slug: "retail-suite",
    code: "M6",
    name: "Retail Suite",
    longName: "M6 Retail Suite",
    summary:
      "POS, back office and batch-aware inventory for retailers who need stock, tax and margin to agree with each other.",
    metaTitle: "M6 Retail Suite — Retail POS & Inventory",
    metaDescription:
      "Retail POS with batch management, back office, tax handling, dashboards and inventory management. Built by GaMatech Systems for Philippine retailers.",
    icon: "retail",
    audience:
      "Single shops, multi-branch retailers, distributors and anyone handling goods with batches or expiry dates.",
    intro: [
      "Retail margin leaks in small places: a batch sold below cost, a tax setting nobody checked, stock counted twice. M6 closes those gaps by keeping the till, the stockroom and the books on one set of numbers.",
      "Batch management is built in rather than bolted on, so products with expiry dates, serial numbers or varying landed cost behave correctly all the way through to the margin report.",
    ],
    features: [
      { title: "Point of sale", detail: "Barcode scanning, held transactions, returns, discounts and multiple tender types." },
      { title: "Batch management", detail: "Track goods by batch or lot with expiry dates and the cost each batch actually landed at." },
      { title: "Inventory management", detail: "Receiving, transfers, adjustments and stock counts, with variance reporting that names the difference." },
      { title: "Back office", detail: "Products, pricing, promotions, suppliers, branches and staff permissions in one place." },
      { title: "Taxes", detail: "VAT, zero-rated and exempt lines handled correctly at the till and carried through to reporting." },
      { title: "Dashboard", detail: "Sales, margin, stock value and fast and slow movers, per branch and consolidated." },
    ],
    painPoints: [
      "Stock on the system never matches stock on the shelf.",
      "Expired goods are discovered by a customer rather than by a report.",
      "Margin reporting cannot account for the cost each batch was bought at.",
      "Branch prices and promotions drift apart.",
    ],
    rollout: [
      { step: "Catalogue load", detail: "Products, barcodes, suppliers and opening stock imported and verified against a physical count." },
      { step: "Tax and pricing setup", detail: "VAT treatment, price levels and promotion rules configured and tested on real transactions." },
      { step: "Hardware install", detail: "Terminals, scanners and receipt printers set up per branch." },
      { step: "Counted handover", detail: "A full stock count on cutover so the opening balance is known to be right." },
      { step: "Training and support", detail: "Cashier and supervisor training, then ongoing support." },
    ],
    faqs: [
      { q: "What does batch management actually give me?", a: "Every receipt of stock is tracked as its own batch, with its own cost and expiry date. You can sell oldest-first, get warned before stock expires, and see true margin per sale — because the system knows what that specific unit cost you, not an average." },
      { q: "Can it run several branches?", a: "Yes. Each branch has its own terminals and stock, under one back office, with transfers between branches and both per-branch and consolidated reporting." },
      { q: "Will it work with our existing barcodes and scanners?", a: "Standard USB and Bluetooth scanners work out of the box, and existing barcodes are imported with the catalogue. We confirm hardware compatibility during scoping." },
      { q: "How is this different from the Restaurant Suite?", a: "The Restaurant Suite adds kitchen display, mobile order taking and recipe-based production, which retail does not need. The Retail Suite instead leans on batch and expiry tracking. Pick by whether you sell what you make or what you buy." },
    ],
    keywords: ["retail POS Philippines", "inventory management system Philippines", "batch tracking software", "retail software SME"],
  },
  {
    slug: "erp",
    code: "M7",
    name: "ERP",
    longName: "M7 ERP",
    summary:
      "Accounting, production, sales, purchasing and warehousing on one ledger, with approval procedures and a customer portal.",
    metaTitle: "M7 ERP — Accounting, Production & Inventory",
    metaDescription:
      "ERP for Philippine SMEs: accounting, production, sales, purchasing, approvals, WMS, batch management and configurable valuation. From GaMatech Systems.",
    icon: "erp",
    audience:
      "Manufacturers, distributors and growing businesses whose spreadsheets and separate tools no longer reconcile.",
    intro: [
      "An ERP earns its place when the cost of disagreement between departments exceeds the cost of the system. If sales, purchasing, production and accounting each keep their own version of the truth, month end becomes an archaeology exercise.",
      "M7 puts them on one ledger. A purchase order becomes a receipt, becomes stock at a known cost, becomes a production input, becomes a sale — each step posting to accounts automatically and each one traceable backwards.",
    ],
    features: [
      { title: "Accounting", detail: "General ledger, receivables, payables, bank reconciliation and financial statements, posted from the transactions themselves." },
      { title: "Production", detail: "Bills of material, work orders, routing and work-in-progress, with actual against standard cost." },
      { title: "Sales", detail: "Quotations, sales orders, deliveries and invoicing, with credit limits enforced at the point of order." },
      { title: "Purchasing", detail: "Requisitions, purchase orders, goods receipt and three-way matching against the supplier invoice." },
      { title: "Approval procedures", detail: "Configurable approval chains by document type and value, with a full history of who approved what." },
      { title: "Inventory management and WMS", detail: "Multi-warehouse stock, bin locations, picking, putaway and cycle counts." },
      { title: "Batch management", detail: "Lot and expiry tracking carried from goods receipt through production to despatch." },
      { title: "Configurable valuation method", detail: "FIFO, moving average or standard cost, chosen per item category to suit how you actually buy." },
      { title: "Customer portal", detail: "Customers check their orders, deliveries, invoices and statements themselves instead of emailing your team." },
      { title: "Online dashboard", detail: "Cash position, receivables ageing, stock value, production throughput and margin in one view." },
      { title: "Open integration", detail: "A documented API so the ERP can exchange data with your e-commerce, logistics or banking systems." },
    ],
    painPoints: [
      "Three systems hold three different stock figures.",
      "Nobody can say what a finished unit actually cost to make.",
      "Purchase approvals happen over chat and leave no record.",
      "Customers phone to ask where their delivery is, and someone has to go and look.",
    ],
    rollout: [
      { step: "Process mapping", detail: "We document how your business actually works today, including the exceptions, before configuring anything." },
      { step: "Chart of accounts and masters", detail: "Accounts, items, suppliers, customers and opening balances loaded and reconciled with your accountant." },
      { step: "Module-by-module rollout", detail: "Usually inventory and purchasing first, then sales, then production, then accounting close." },
      { step: "Parallel close", detail: "One full month run in parallel with your existing process, reconciled line by line." },
      { step: "Cutover and support", detail: "Go live, with hypercare through the first month-end close." },
    ],
    faqs: [
      { q: "How long does an ERP rollout take?", a: "Plan on three to six months for a first live module set, and nine to twelve for full coverage including a parallel accounting close. Anyone promising a full ERP in six weeks is describing an installation, not a rollout." },
      { q: "Which inventory valuation methods are supported?", a: "FIFO, moving average and standard cost, configurable per item category — so raw materials and finished goods can be valued differently if that is how your accountant treats them." },
      { q: "Can it integrate with our existing systems?", a: "Yes. There is a documented API, and we routinely connect e-commerce platforms, marketplaces, logistics providers and accounting exports. Integration points are agreed during process mapping." },
      { q: "Do we have to take the whole thing at once?", a: "No, and we would advise against it. Most clients start with inventory and purchasing, prove the numbers, then add sales, production and the accounting close in stages." },
    ],
    keywords: ["ERP Philippines", "ERP for SMEs", "manufacturing ERP Philippines", "inventory ERP WMS"],
  },
  {
    slug: "payroll-hris",
    code: "M8",
    name: "Payroll & HRIS",
    longName: "M8 Payroll & HRIS",
    summary:
      "Payroll, time and attendance, and the full employee lifecycle — with a self-service portal so HR stops answering the same questions.",
    metaTitle: "M8 Payroll & HRIS — Philippine Payroll System",
    metaDescription:
      "Philippine payroll and HRIS: timekeeping, deductions, payslips, leave, onboarding, offboarding and performance management, with an employee self-service portal.",
    icon: "people",
    audience:
      "Businesses from around 20 staff upwards, especially those running shifts across several sites.",
    intro: [
      "Payroll is the one system that is wrong in public. Everyone notices a late or short payslip, and every correction costs trust as well as time.",
      "M8 computes pay from the attendance data itself, applies statutory and company deductions, and publishes payslips to an employee portal — so the questions HR spends its week answering are answered by the system instead.",
    ],
    features: [
      { title: "Payroll", detail: "Multiple pay periods and rate types, overtime, night differential, holiday pay and thirteenth month." },
      { title: "Deductions", detail: "SSS, PhilHealth, Pag-IBIG and withholding tax, plus loans and company deductions, applied automatically." },
      { title: "Time and attendance", detail: "Biometric or app-based clock in, shift schedules, and exception handling for late, undertime and overtime." },
      { title: "Absence management", detail: "Leave requests, balances, accruals and approvals, visible to both employee and manager." },
      { title: "Holiday calendar", detail: "National, local and company holidays, with the correct premium applied by pay rules." },
      { title: "Employee portal", detail: "Staff check their own schedule, leave balance and payslips without going through HR." },
      { title: "Payslip viewing", detail: "Payslips published to the portal with a full breakdown, and downloadable as PDF." },
      { title: "Employee onboarding", detail: "A checklist-driven start: documents collected, accounts created, equipment issued, nothing forgotten." },
      { title: "Employee offboarding", detail: "Clearance, final pay computation and access revocation, tracked to completion." },
      { title: "Performance management", detail: "Goals, review cycles and one-to-one records kept in the employee's file." },
      { title: "Performance evaluation", detail: "Structured evaluation forms with scoring, approvals and a comparable history." },
    ],
    painPoints: [
      "Payroll takes two people three days, and still needs corrections.",
      "Timesheets arrive as photographs of a logbook.",
      "Leave balances live in a spreadsheet only one person understands.",
      "A resignation leaves accounts active for weeks afterwards.",
    ],
    rollout: [
      { step: "Policy capture", detail: "Pay rules, shift patterns, premiums and leave policies documented precisely, including the exceptions." },
      { step: "Employee data load", detail: "Staff records, rates, balances and statutory details imported and checked." },
      { step: "Parallel payroll", detail: "Two cycles run alongside your current process and reconciled to the peso before cutover." },
      { step: "Portal rollout", detail: "Employees onboarded to the self-service portal with a short guide." },
      { step: "Go live", detail: "First live run supervised end to end, with support through the next statutory filing." },
    ],
    faqs: [
      { q: "Does it handle Philippine statutory deductions?", a: "Yes — SSS, PhilHealth, Pag-IBIG and withholding tax are computed per cycle, with the contribution tables maintained as they change. Company loans and other deductions are applied alongside them." },
      { q: "Can employees see their own payslips?", a: "Yes. Payslips are published to the employee portal with a full breakdown and can be downloaded as PDF, which removes most of HR's routine enquiries." },
      { q: "What timekeeping hardware does it support?", a: "Common biometric devices, plus app-based clock in with geofencing for field staff. Existing devices are assessed during scoping — in most cases they can be kept." },
      { q: "How do we move across without a payroll disaster?", a: "By running two complete cycles in parallel and reconciling them to the peso before switching. We do not cut over on faith." },
    ],
    keywords: ["payroll system Philippines", "HRIS Philippines", "timekeeping payroll software", "employee self service portal"],
  },
  {
    slug: "triage",
    code: "M9",
    name: "Triage",
    longName: "M9 Triage",
    summary:
      "A service desk that queues, prioritises and tracks every request against an SLA — with a customer portal and knowledge base.",
    metaTitle: "M9 Triage — Service Desk & Ticketing",
    metaDescription:
      "Ticketing with queuing, multi-level priority, SLA management, a customer portal and a knowledge base. Service desk software from GaMatech Systems.",
    icon: "triage",
    audience:
      "Support teams, service departments, IT helpdesks and any business where requests arrive faster than they can be handled.",
    intro: [
      "Support fails quietly. Nothing crashes — requests simply sit in an inbox, the loudest customer is served first, and nobody can say how long anything actually took.",
      "M9 puts structure around that: every request becomes a ticket, every ticket has a priority and an owner, and every response is measured against an SLA you set.",
    ],
    features: [
      { title: "Queuing", detail: "Incoming requests land in the right queue by type, product or team, rather than one shared inbox." },
      { title: "Multi priority level tickets", detail: "Several priority tiers, each with its own response and resolution targets." },
      { title: "Ticket management", detail: "Assignment, escalation, internal notes, attachments and a complete history on every ticket." },
      { title: "SLA management", detail: "Response and resolution clocks per priority, with warnings before a breach rather than a report after it." },
      { title: "Customer portal", detail: "Customers raise tickets, see progress and reply without an email thread going missing." },
      { title: "Customer knowledge base", detail: "Published articles that deflect the repetitive questions before they become tickets." },
    ],
    painPoints: [
      "Requests arrive by email, chat and phone, and none of them are counted.",
      "Whoever shouts loudest gets served first.",
      "Nobody knows how long a typical fix actually takes.",
      "The same question is answered from scratch every week.",
    ],
    rollout: [
      { step: "Queue and priority design", detail: "We map request types to queues and agree what each priority level means in practice." },
      { step: "SLA definition", detail: "Response and resolution targets set per priority, matched to what your team can genuinely deliver." },
      { step: "Portal and knowledge base", detail: "Customer portal branded and seeded with articles for your most common requests." },
      { step: "Pilot", detail: "One team runs live for two weeks while the rest continue as they are." },
      { step: "Rollout and review", detail: "Full launch, then a review of SLA attainment after the first month." },
    ],
    faqs: [
      { q: "What is SLA management in practice?", a: "Each priority level carries a response target and a resolution target. The clock starts when a ticket arrives, pauses when it is waiting on the customer, and warns the owner before a breach — so problems surface while they can still be fixed." },
      { q: "Can customers raise tickets themselves?", a: "Yes. The customer portal lets them open a ticket, track its progress, add information and see your replies, which removes the uncertainty that generates chasing emails." },
      { q: "Does the knowledge base actually reduce tickets?", a: "It does when it is maintained. We seed it with articles for your most common requests during rollout and surface relevant articles as a customer types their question." },
      { q: "Can it work alongside our existing email?", a: "Yes. Support mailboxes can be routed into queues so customers carry on emailing as they always have, while your team works in a structured system." },
    ],
    keywords: ["service desk software Philippines", "ticketing system", "SLA management software", "customer support portal"],
  },
  {
    slug: "crm",
    code: "M10",
    name: "CRM",
    longName: "M10 CRM",
    summary:
      "Lead and opportunity management across multiple pipelines, with Kanban views, dashboards and AI-assisted process automation.",
    metaTitle: "M10 CRM — Lead & Pipeline Management",
    metaDescription:
      "CRM with lead management, multiple pipelines, Kanban and list views, AI-assisted process automation, dashboards and opportunity management.",
    icon: "crm",
    audience:
      "Sales teams running more than one kind of deal, and owners who want a forecast they can believe.",
    intro: [
      "A CRM is only worth having if the pipeline in it matches reality. Most do not, because logging activity costs the salesperson time and gives them nothing back.",
      "M10 is built the other way round: automation does the admin, the board shows the rep what to do next, and the forecast is a by-product of work that was going to happen anyway.",
    ],
    features: [
      { title: "Lead management", detail: "Capture from the website, ads, marketplaces and manual entry, with deduplication and routing to an owner." },
      { title: "Multi pipelines", detail: "Separate pipelines per product, channel or team, each with its own stages and probabilities." },
      { title: "Different views including Kanban", detail: "Work the same data as a Kanban board, a list, a calendar or a forecast — whichever suits the task." },
      { title: "Process automation with AI boards", detail: "Routine steps handled automatically: follow-up tasks, stage movement, reminders and summaries drafted for review." },
      { title: "Opportunities management", detail: "Values, expected close dates, competitors and decision makers, with a full activity history." },
      { title: "Dashboards", detail: "Pipeline by stage, conversion rates, activity levels and forecast against target, per rep and per team." },
    ],
    painPoints: [
      "Leads sit for days because nobody owned them.",
      "The forecast is a number the sales manager makes up on a Friday.",
      "Deal history lives in one person's phone.",
      "Different products are tracked in different spreadsheets.",
    ],
    rollout: [
      { step: "Pipeline design", detail: "Stages defined around what the customer does, not what your team hopes they will do." },
      { step: "Data import", detail: "Existing contacts and open deals imported, deduplicated and assigned to owners." },
      { step: "Automation setup", detail: "The follow-ups and routine updates your team currently does by hand, automated first." },
      { step: "Team onboarding", detail: "Short, role-specific training — reps learn the board, managers learn the forecast." },
      { step: "Review", detail: "A check after 30 days against real usage, adjusting stages and automation to what the team actually does." },
    ],
    faqs: [
      { q: "What does AI actually do in the CRM?", a: "It handles the admin around a deal: drafting follow-up messages for a rep to approve, summarising long email threads, flagging deals that have gone quiet, and suggesting the next action from what happened on similar deals. It does not move deals or contact customers on its own." },
      { q: "Why would we need multiple pipelines?", a: "Because a two-week transactional sale and a six-month enterprise deal do not share stages. Separate pipelines keep each forecast honest while still rolling up into one dashboard." },
      { q: "Will it capture leads from our website?", a: "Yes. Website forms, landing pages, ad platforms and marketplace enquiries can all feed the CRM directly, with routing rules deciding who picks each one up." },
      { q: "How long before the team is actually using it?", a: "Most teams are working in it within a fortnight. Adoption depends far more on the pipeline matching how they really sell than on training, which is why pipeline design comes first." },
    ],
    keywords: ["CRM Philippines", "sales pipeline software", "lead management system", "CRM with AI automation"],
  },
] as const;

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}
