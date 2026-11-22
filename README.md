# GaMatech Systems

Marketing website, lead-capture system and admin console for **GaMatech Systems** — a
Philippine software company serving small and medium businesses.

The catalogue has two halves, both taken from the company's product plan:

**Six core products** — the systems GaMatech builds and maintains in-house.

| Code | Product | Covers |
| --- | --- | --- |
| M5 | Restaurant Suite | Kitchen display, dashboard, mobile order taker, POS, back office, inventory with production |
| M6 | Retail Suite | Batch management, POS, back office, taxes, dashboard, inventory management |
| M7 | ERP | Accounting, production, sales, purchasing, approvals, customer portal, WMS, batch management, configurable valuation |
| M8 | Payroll & HRIS | Employee portal, payslips, absences, holidays, time and attendance, payroll, deductions, onboarding, offboarding, performance |
| M9 | Triage | Queuing, multi-priority tickets, ticket management, customer portal, knowledge base, SLA management |
| M10 | CRM | Lead management, multi pipelines, Kanban and other views, AI-assisted automation, dashboards, opportunities |

**Six services** — the work delivered around those systems: websites and infrastructure
(DNS, Cloudflare, SMTP), software development, AI analytics and training, Google Ads
management, search engine optimization, and e-commerce growth.

---

## Contents

- [What is here](#what-is-here)
- [Quick start](#quick-start)
- [Configuration](#configuration)
- [The admin console](#the-admin-console)
- [Security](#security)
- [SEO and AEO](#seo-and-aeo)
- [Project layout](#project-layout)
- [Deployment](#deployment)
- [Things worth knowing](#things-worth-knowing)

---

## What is here

**Public site**

| Route | Purpose |
| --- | --- |
| `/` | Home: hero with the six-product catalogue, products, services, industries, lead form, FAQ, latest articles |
| `/products` | All six core products |
| `/products/[slug]` | One page per product, with features, rollout, FAQ and lead form |
| `/services` | All six services |
| `/services/[slug]` | One page per service, each with its own FAQ and lead form |
| `/about` | Company, principles, industries |
| `/contact` | Contact details and the main enquiry form |
| `/blog` | Article index |
| `/blog/[slug]` | Article, with table of contents on longer pieces |
| `/privacy` | Privacy policy (Philippine Data Privacy Act) |

**Admin console** (`/admin`, sign-in required, never indexed)

| Route | Purpose |
| --- | --- |
| `/admin` | Dashboard: lead counts, pipeline, recent enquiries, audit trail |
| `/admin/leads` | Browse, search, filter, annotate, re-status, delete and export leads |
| `/admin/posts` | List, publish, unpublish and delete articles |
| `/admin/posts/new`, `/admin/posts/[id]/edit` | Markdown editor with a live search-result preview |
| `/admin/account` | Change password, review account and session details |

**Animation** — every section fades or slides in as it scrolls into view, the hero has a
drifting gradient backdrop and a floating panel of the six products, the industries strip scrolls
continuously, and the primary call-to-action carries a moving sheen. All of it collapses
to an instant state change for visitors with `prefers-reduced-motion: reduce`.

**Brand** — the logo is rebuilt as inline SVG from the supplied artwork
(`components/Logo.tsx`: the mark, an app-icon tile and the full lockup), and the palette
is taken from it — navy `#0A1A3E` as `brand`, orange `#E7580A` as `accent`. The source
PDFs are raster, so the mark is redrawn rather than traced; it is a single stroked
polyline whose corner radius comes from `stroke-linejoin: round`.

---

## Quick start

Requires **Node.js 22** (pinned in `package.json`).

```bash
npm install
```

```bash
cp .env.example .env.local
```

Generate a secret and paste it into `.env.local` as `APP_SECRET`:

```bash
openssl rand -hex 32
```

Point `DATABASE_URL` in `.env.local` at a PostgreSQL database — a free
[Neon](https://neon.tech) project, or a local server — then create the tables:

```bash
npm run db:migrate
```

Create your administrator account (the password is typed at a hidden prompt, so it never
reaches your shell history):

```bash
npm run admin:create
```

Start the development server:

```bash
npm run dev
```

The site is then at `http://localhost:3000` and the console at
`http://localhost:3000/admin/login`.

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build (fails on any type error) |
| `npm start` | Serve the production build |
| `npm run typecheck` | TypeScript only, no build |
| `npm run db:migrate` | Create or update the database schema (idempotent) |
| `npm run admin:create` | Create an admin, or reset an existing one's password |

---

## Configuration

All configuration is read in one place, `lib/env.ts`, and validated at startup — a
missing or malformed value fails loudly rather than silently degrading.

| Variable | Required | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | yes in production | Canonical origin. Must be `https://` for any non-local hostname; used for canonical tags, sitemap, OpenGraph and secure-cookie detection. |
| `APP_SECRET` | yes in production | Exactly 64 hex characters. Keys the HMACs for session tokens, IP hashes and form tokens. Rotating it logs everyone out, which is safe. |
| `DATABASE_URL` | yes | PostgreSQL connection string. On Vercel + Neon use the **pooled** string (host contains `-pooler`). TLS is on unless the URL says `sslmode=disable`. |
| `ALLOWED_ORIGINS` | no | Extra origins permitted to submit forms, comma separated. Only needed when the site answers on more than one hostname. |
| `TRUST_PROXY` | no | Set to `1` **only** behind a reverse proxy you control. See [Rate limiting](#rate-limiting-and-the-login-lockout). |

Content lives in three files, and every page, the sitemap and the structured data follow
from them:

- `lib/site.ts` — brand, contact details, navigation, company FAQs, industries
- `lib/products.ts` — the six core products
- `lib/services.ts` — the six services

---

## The admin console

### Signing in

Username and password, at `/admin/login`. There is no public sign-up: accounts exist only
when created with `npm run admin:create`.

Passwords created from the `ADMIN_PASSWORD` environment variable are flagged
`must_change_pw`, so the operator is prompted to set their own on first sign-in.

### Leads

Submissions from any form on the site land in `/admin/leads`. Each can be moved through a
pipeline (`new → contacted → qualified → won / lost`), annotated with internal notes, and
exported to CSV.

Submissions caught by the anti-spam checks are filed as `spam` and hidden from the default
view — choose the **spam** filter to review them.

### Blog

Articles are written in a restricted Markdown dialect: `##`/`###`/`####` headings,
`**bold**`, `*italic*`, `` `code` ``, fenced code blocks, bullet and numbered lists,
blockquotes, horizontal rules and `[links](/path)`.

Raw HTML in an article is **displayed as text, never rendered** — see
[Cross-site scripting](#cross-site-scripting) for why that is a deliberate design choice
rather than a limitation.

Drafts are unreachable publicly, even by guessing the URL, and never appear in the
sitemap. Publishing refreshes the home page, the blog index and the sitemap immediately.

---

## Security

The site was built against a security checklist and verified with an automated browser
suite (295 assertions, all passing) covering the lockout, access control, injection and
XSS handling, as well as SEO, mobile layout and the catalogue content.

### Authentication

| Control | Implementation |
| --- | --- |
| Password storage | scrypt (`N=2¹⁷, r=8, p=1`, 64-byte key, 16-byte random salt per password) using Node's own `crypto` — no third-party dependency in the auth path. Roughly 400 ms per verification, which also throttles offline cracking. |
| Hash format | Self-describing (`scrypt$N$r$p$salt$hash`), so cost parameters can be raised later and existing hashes upgrade transparently on next sign-in. |
| Comparison | Constant-time (`timingSafeEqual`). An unknown username still performs a full derivation, so response time does not reveal whether an account exists. |
| Password policy | 14 characters minimum, at least three character classes, no username substring, common-password rejection. |
| Sessions | 32 random bytes in the cookie; only an HMAC of the token is stored, so a database dump cannot be replayed as a live session. |
| Cookie flags | `HttpOnly` (XSS cannot read it), `SameSite=Strict` (no cross-site request carries it), `Secure` on HTTPS, `Path=/`. |
| Expiry | 8-hour absolute lifetime, 2-hour idle timeout, server-side revocation on sign-out. Signing in elsewhere invalidates all other sessions. |
| Error messages | Identical for unknown user, wrong password and disabled account, so the form cannot be used to enumerate usernames. |

### Rate limiting and the login lockout

**Three incorrect attempts lock sign-in for one minute**, as specified. A patient attacker
would otherwise simply wait each minute out, so the cooldown escalates: 3 failures → 1
minute, 6 → 5 minutes, 9 → 15 minutes, 12+ → 1 hour. A successful sign-in clears the
history.

The lockout is evaluated per **username** and per **source address** independently, which
blocks both "hammer one account from many hosts" and "spray many usernames from one host".
State lives in PostgreSQL, so it survives a restart and holds across every serverless
instance at once — essential on a platform that may run dozens of them.

It is enforced **entirely on the server**. The countdown and disabled fields in the UI are
a courtesy; re-enabling them in devtools changes nothing (there is a test for exactly
that).

The public lead form is separately limited to 5 submissions per hour and 20 per day per
address.

> **`TRUST_PROXY`** — `X-Forwarded-For` is attacker-controlled unless a reverse proxy you
> own rewrites it. Leave `TRUST_PROXY` unset for a directly exposed server; set it to `1`
> only behind Nginx, Cloudflare, Vercel or similar. Setting it when it is not true would
> let an attacker send a fresh fake address on every request and walk straight through the
> lockout.

### SQL injection

Every statement in the project is a prepared, parameterised statement. No SQL anywhere is
assembled from user input — the only interpolations are module-level constants (a column
list, a fixed `WHERE` fragment), each commented where it appears. `LIKE` wildcards in the
admin search box are escaped, so searching for `%` does not match every row.

### Cross-site scripting

Article bodies are operator-supplied text rendered into the page, which is the classic
home of stored XSS. Rather than sanitising output, `lib/markdown.ts` is safe by
construction:

1. The entire source is HTML-escaped **first**, so raw HTML becomes visible text.
2. Markup is generated **second**, only from this module's own string literals — the set
   of possible elements is fixed.
3. The single interpolated attribute, a link `href`, is restricted to `http:`, `https:`,
   `mailto:` and site-relative paths, so `javascript:` and `data:` URLs cannot appear.

This is verified against 30 payloads, and the browser suite re-checks the live DOM of a
published article for injected `<script>`, `<iframe>`, `<img>`, `on*` handlers and
`javascript:` hrefs. Everywhere else, React's own escaping applies — there is no
`dangerouslySetInnerHTML` in the admin at all.

### Headers and CSP

Set in `next.config.ts` and `proxy.ts`:

- **Content-Security-Policy** with a fresh per-request nonce and `strict-dynamic`; no
  `unsafe-inline` for scripts, `object-src 'none'`, `frame-ancestors 'none'`,
  `base-uri 'self'`, `form-action 'self'`
- `Strict-Transport-Security` (2 years, `includeSubDomains`, `preload`)
- `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` denying every feature the site does not use
- `Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy`
- `X-Powered-By` removed; admin and API responses add `no-store` and `noindex`

### Other measures

- **Authorisation at the point of use.** Every admin page and every admin Server Action
  calls `requireSession()` itself. The decision is never left to the layout or to
  `proxy.ts`, because an edge-level check can be bypassed (CVE-2025-29927) and a missing
  matcher entry would silently open a route.
- **CSRF.** `SameSite=Strict` cookies plus an explicit `Origin`/`Referer` check on every
  state-changing action, on top of the framework's own Server Action origin check.
- **Form tokens.** Each rendered lead form carries a server-signed timestamp. The server
  compares it on submit, so a post arriving milliseconds after render is treated as
  automated. Because it is signed server-side it cannot be forged, and — unlike a
  client-side timer — it cannot produce false positives against real visitors.
- **Honeypot.** A hidden field, removed from the accessibility tree and unfocusable.
  Submissions that fill it are accepted (so the bot stops retrying) and filed as spam.
- **Open-redirect protection.** `?next=` on the login page accepts only internal `/admin`
  paths.
- **CSV injection.** Exported cells beginning `=`, `+`, `-` or `@` are prefixed so a lead
  cannot execute formulas when the file is opened in Excel or Sheets.
- **IP privacy.** Raw IP addresses are never stored. Only a keyed HMAC is kept, which is
  enough to rate-limit but is not personal data to protect or disclose.
- **Audit log.** Every sign-in, lockout, lead change, post change and export is recorded.
- **Dependencies.** Four runtime dependencies (`next`, `react`, `react-dom`,
  `pg`). All are pure JavaScript, so there is no native module to compile at install
  time. `npm audit` reports **0 vulnerabilities**.
- **Secrets.** `.env*` is git-ignored (`.env.example` excepted), the database directory is
  created `0700` and git-ignored, and secrets are confined to `server-only` modules — an
  accidental client import is a build error. The client bundles were scanned to confirm no
  secret, hash or table name leaks into them.
- **Error messages.** Production responses never include stack traces or database errors.

### Not applicable here

- **Row-level security.** All data access goes through the server-side functions in
  `lib/`, each of which checks the session first, and the database role is never
  exposed to the browser — so there is no client that RLS would be protecting against.
  If you ever give a browser direct database access (Supabase client libraries, for
  example), enable RLS on every table before you do.
- **CORS** headers are deliberately not set, so the browser default (same-origin only)
  applies.
- **File upload validation** and **webhook signature verification** — there are no uploads
  and no inbound webhooks.

---

## SEO and AEO

**Technical**

- One `<h1>` per page, no skipped heading levels (verified in the test suite)
- Canonical URL on every page; `trailingSlash: false` keeps one URL per page
- Titles ≤ 65 characters, meta descriptions 50–170 characters, every page checked
- `sitemap.xml` generated from the routes and the database, so a new service or article
  cannot be forgotten; drafts and `/admin` are excluded
- `robots.txt` allowing the public site, disallowing `/admin` and `/api`
- OpenGraph and Twitter cards; the social image is generated at build time, so it cannot
  go missing
- All imagery is inline SVG or CSS — nothing to compress, no broken images, no layout
  shift. Decorative graphics are `aria-hidden`; meaningful ones carry a label.
- Mobile-first, verified at 390 px for horizontal overflow and minimum text size
- `prefers-reduced-motion` respected throughout

**Structured data** — `Organization` / `ProfessionalService`, `WebSite`,
`SoftwareApplication` (per product), `Service` (per service), `FAQPage`, `BlogPosting`,
`Blog`, `BreadcrumbList`, `ItemList`, `AboutPage` and `ContactPage`. Products use the
application type rather than the service type, which is what lets search and answer
engines describe them correctly.

**AEO (Answer Engine Optimisation)** — answer engines quote sources that are easy to parse
and unambiguous, so the site:

- answers questions in the first sentence, under the question itself as a heading
- mirrors every visible FAQ in `FAQPage` structured data
- publishes concrete, citable specifics (prices, timelines, what is included)
- serves `/llms.txt`, a plain-text brief for AI assistants
- explicitly welcomes `GPTBot`, `OAI-SearchBot`, `PerplexityBot`, `ClaudeBot`,
  `Google-Extended` and friends in `robots.txt`

---

## Project layout

```
app/
  (site)/              public marketing site (header + footer layout)
    products/          the six core products
    services/          the six services
  admin/               console — every page calls requireSession()
  actions/             Server Actions: lead.ts (public), admin.ts (authenticated)
  api/                 health check, CSV export
  layout.tsx           metadata defaults, site-wide JSON-LD, animation enabler
  sitemap.ts           robots.ts  opengraph-image.tsx  apple-icon.tsx
components/            UI; components/admin/ is console-only
  Logo.tsx             the mark, app-icon tile and full lockup, as inline SVG
  ProductConstellation.tsx  the hero panel linking to all six products
lib/
  env.ts               validated configuration — the only reader of process.env
  db.ts  schema.sql    PostgreSQL pool, query helpers and schema
  auth.ts              sessions, sign-in, password change
  password.mjs         scrypt hashing (plain JS: shared by the app and the CLI)
  rate-limit.ts        login lockout and the sliding-window limiter
  form-token.ts        signed form timestamps
  validate.ts          every input validator
  markdown.ts          the escape-first Markdown renderer
  leads.ts  posts.ts   data access
  seo.ts               metadata and JSON-LD builders
  site.ts              brand, contact, navigation, company FAQs
  products.ts          the six core products (M5–M10)
  services.ts          the six services
proxy.ts               per-request CSP nonce and security headers
scripts/               migrate.mjs, create-admin.mjs
```

---

## Deployment

The app is a standard Next.js application backed by PostgreSQL. It is built to run on
**Vercel with a Neon database**, and works the same on any Node host with any Postgres.

### Vercel + Neon

1. **Create the database.** In Vercel, open the project → *Storage* → *Create Database*
   → *Neon*, and connect it to the project. Vercel adds `DATABASE_URL` for you. (Or
   create a project at neon.tech and copy its **pooled** connection string — the one
   whose host contains `-pooler`.)
2. **Set the environment variables** under *Settings → Environment Variables*:
   - `DATABASE_URL` — the pooled Neon string, if Vercel did not add it
   - `APP_SECRET` — the output of `openssl rand -hex 32`
   - `NEXT_PUBLIC_SITE_URL` — optional; your public https address. If unset, the site uses
     Vercel's production domain, which switches to your custom domain once you add one
   - `TRUST_PROXY` — `1` (Vercel rewrites `X-Forwarded-For`, so it can be trusted)
3. **Create the tables and your admin account.** Either let the site do it on first run —
   set `ADMIN_BOOTSTRAP_USERNAME` and `ADMIN_BOOTSTRAP_PASSWORD` (mark the password
   *Sensitive*). The account is created only while no admin exists, must change its
   password at first sign-in, and the variables can be deleted afterwards. This is the
   route to take when Vercel manages the Neon credentials and you cannot read them.

   Or, if you can see the connection string, run the scripts from your own machine:

   ```bash
   DATABASE_URL='postgresql://…-pooler…/neondb?sslmode=require' npm run db:migrate
   ```

   ```bash
   DATABASE_URL='postgresql://…-pooler…/neondb?sslmode=require' npm run admin:create
   ```

4. **Redeploy.** The build needs no database access; the site connects at request time.

The app also creates any missing tables on its first query, so a forgotten step 3
migration does not take the site down — but run it anyway, so no visitor pays for it.

### Any other host

```bash
npm ci
npm run build
npm run db:migrate
npm run admin:create
npm start
```

Behind Nginx or Caddy, terminate TLS at the proxy and set `TRUST_PROXY=1`.

### Backups

Neon keeps point-in-time history (the window depends on your plan). For an independent
copy:

```bash
pg_dump "$DATABASE_URL" --format=custom --file=gamatech-$(date +%F).dump
```

Dumps contain every lead and admin password hash — store them like secrets.

---

## Things worth knowing

**Pages are server-rendered on each request, not prerendered.** This is a deliberate
trade-off: the strict CSP issues a fresh nonce per request, and a nonce cannot be baked
into static HTML. Statically prerendering these pages silently dropped all structured data
from blog articles during development, which is precisely the kind of bug that is
invisible until rankings fall. The cost is small — the only I/O is an indexed Postgres read
on the same machine — and every response still carries full cache-control headers for a
CDN in front.

**Scroll animations fail safe.** Content that has not yet been revealed is hidden only
under `html.js-anim`, a class added by a small inline script. If JavaScript is disabled,
blocked or broken, nothing is ever hidden. There is also a 5-second backstop that reveals
anything still pending. This was not theoretical: an earlier IntersectionObserver
implementation left a third of the home page permanently invisible depending on scroll
speed.

**`lib/password.mjs` is plain JavaScript, not TypeScript**, so the Next.js app, the
migration script and the admin CLI all import the one implementation. Two copies of
hashing code that drift apart is a very bad failure mode.

---

© GaMatech Systems. Built in the Philippines.
