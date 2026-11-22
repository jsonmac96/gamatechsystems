import "server-only";

/**
 * Centralised, validated access to environment configuration.
 *
 * Secrets are read here and nowhere else, so there is exactly one place to
 * audit. Nothing in this module is ever imported by client components —
 * `server-only` makes an accidental client import a build error.
 */

const isProd = process.env.NODE_ENV === "production";

function readSiteUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL ?? "").trim();
  // On Vercel, fall back to the project's production domain so a missing
  // variable degrades to correct canonical URLs rather than to localhost.
  const vercelProduction = vercelHost("VERCEL_PROJECT_PRODUCTION_URL");
  const fallback = vercelProduction ? `https://${vercelProduction}` : "http://localhost:3000";
  const value = raw || fallback;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(
      `NEXT_PUBLIC_SITE_URL is not a valid absolute URL: ${JSON.stringify(value)}`,
    );
  }
  // Enforce HTTPS for any real hostname: cookies are Secure-only and canonical
  // URLs must never advertise a plaintext origin. Loopback and `.local` hosts
  // are exempt so `next build` and local previews work without a certificate —
  // this check runs during the production build too, not just at runtime.
  if (url.protocol !== "https:" && !isLocalHost(url.hostname)) {
    throw new Error(
      `NEXT_PUBLIC_SITE_URL must use https:// for a public hostname (got ${JSON.stringify(value)}).`,
    );
  }
  // Normalise: no trailing slash, no query, no hash.
  return `${url.protocol}//${url.host}`;
}

/** True for loopback and development-only hostnames. */
function isLocalHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "0.0.0.0" ||
    host === "::1" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local")
  );
}

/**
 * 32 random bytes, hex encoded. Used to key HMACs for session tokens and IP
 * hashes.
 *
 * A real deployment must supply one. The requirement is keyed off whether the
 * site URL is a public hostname rather than off NODE_ENV, because
 * `next build` runs with NODE_ENV=production even when building locally — so
 * keying off NODE_ENV alone would make a local build impossible while still
 * not catching the case that actually matters.
 */
function readAppSecret(isPublicDeployment: boolean): Buffer {
  const raw = (process.env.APP_SECRET ?? "").trim();
  const placeholder = raw === "" || raw.startsWith("replace-me");

  if (placeholder) {
    if (isPublicDeployment) {
      throw new Error(
        "APP_SECRET is required for a public deployment (the site URL resolves to a public " +
          "hostname, from NEXT_PUBLIC_SITE_URL or Vercel's production domain). " +
          "Generate one with: openssl rand -hex 32",
      );
    }
    // Development only: a stable, obviously-fake key so local sessions survive
    // a restart without anyone being tempted to reuse it in production.
    return Buffer.from(
      "0".repeat(32) + "devonlydevonlydevonlydevonlydev1".slice(0, 32),
      "utf8",
    );
  }

  if (!/^[0-9a-fA-F]{64}$/.test(raw)) {
    throw new Error(
      "APP_SECRET must be exactly 64 hexadecimal characters (32 bytes). Generate with: openssl rand -hex 32",
    );
  }
  return Buffer.from(raw, "hex");
}

/**
 * PostgreSQL connection string.
 *
 * Required wherever the site actually runs. On a serverless host point this
 * at a **pooled** endpoint — on Neon, the host containing `-pooler` — so that
 * short-lived invocations do not exhaust the connection limit.
 */
function readDatabaseUrl(): string {
  const raw = (process.env.DATABASE_URL ?? "").trim();
  if (!raw) return "";
  if (!/^postgres(ql)?:\/\//.test(raw)) {
    throw new Error(
      "DATABASE_URL must be a postgres:// or postgresql:// connection string.",
    );
  }
  return raw;
}

/**
 * TLS is on unless the URL opts out. `sslmode=disable` and `sslmode=no-verify`
 * are for a local database only; a hosted provider always wants a verified
 * connection, and silently disabling verification is how credentials end up
 * exposed to whoever is between you and the database.
 */
function requiresSsl(url: string): boolean {
  if (!url) return false;
  const mode = /[?&]sslmode=([a-z-]+)/i.exec(url)?.[1]?.toLowerCase();
  if (mode === "disable" || mode === "no-verify") return false;
  // A local socket or localhost connection does not need TLS.
  try {
    const host = new URL(url).hostname.toLowerCase();
    if (host === "localhost" || host === "127.0.0.1" || host === "" || host === "::1") {
      return mode === "require" || mode === "verify-full";
    }
  } catch {
    /* fall through to the default */
  }
  return true;
}

function readAllowedOrigins(siteUrl: string): readonly string[] {
  const extra = (process.env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      try {
        const u = new URL(s);
        return `${u.protocol}//${u.host}`;
      } catch {
        throw new Error(`ALLOWED_ORIGINS contains an invalid origin: ${JSON.stringify(s)}`);
      }
    });
  const base = [siteUrl];
  if (!isProd) {
    base.push("http://localhost:3000", "http://127.0.0.1:3000");
  }
  // On Vercel the same build is served from several hostnames: the production
  // domain, a per-branch preview URL and a per-deployment URL. Vercel sets
  // these itself — they are not request input — so forms submitted from any of
  // them are genuinely same-site.
  for (const name of ["VERCEL_URL", "VERCEL_BRANCH_URL", "VERCEL_PROJECT_PRODUCTION_URL"]) {
    const host = vercelHost(name);
    if (host) base.push(`https://${host}`);
  }
  return Array.from(new Set([...base, ...extra]));
}

/**
 * A hostname from one of Vercel's system environment variables, which hold a
 * bare host such as `my-app-git-main-team.vercel.app` with no scheme.
 * Anything that does not look like a plain hostname is ignored.
 */
function vercelHost(name: string): string {
  const raw = (process.env[name] ?? "").trim().toLowerCase();
  if (!raw) return "";
  return /^[a-z0-9](?:[a-z0-9.-]{0,251}[a-z0-9])?$/.test(raw) ? raw : "";
}

const siteUrl = readSiteUrl();

/**
 * True when this process is serving a real, publicly reachable site — as
 * opposed to a local development server or a local production build.
 */
const isPublicDeployment = !isLocalHost(new URL(siteUrl).hostname);

export const env = {
  isProd,
  isDev: !isProd,
  isPublicDeployment,
  siteUrl,
  /** Whether cookies should carry the `Secure` attribute. */
  useSecureCookies: siteUrl.startsWith("https://"),
  databaseUrl: readDatabaseUrl(),
  /** Whether to negotiate TLS. Hosted providers require it; a local socket does not. */
  databaseSsl: requiresSsl(readDatabaseUrl()),
  appSecret: readAppSecret(isPublicDeployment),
  allowedOrigins: readAllowedOrigins(siteUrl),
  /** Only trust X-Forwarded-For when explicitly told to (prevents spoofed rate-limit keys). */
  trustProxy: process.env.TRUST_PROXY === "1",
  /**
   * First-run admin account, created only while no admin exists at all.
   * Exists for hosts where nobody can run `npm run admin:create` against the
   * database directly — e.g. Vercel with an integration-managed Neon database
   * whose credentials are write-only. Clear both variables once signed in.
   */
  bootstrapAdmin: {
    username: (process.env.ADMIN_BOOTSTRAP_USERNAME ?? "").trim().toLowerCase().slice(0, 64),
    password: process.env.ADMIN_BOOTSTRAP_PASSWORD ?? "",
  },
} as const;
