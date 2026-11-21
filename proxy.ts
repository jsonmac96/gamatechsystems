import { NextResponse, type NextRequest } from "next/server";

/**
 * Per-request Content Security Policy.
 *
 * Next.js injects small inline bootstrap scripts, so a policy without
 * `unsafe-inline` needs a fresh nonce on every request. That nonce is passed
 * down via a request header, which Next automatically applies to the scripts
 * it emits.
 *
 * Note on scope: this file deliberately does **not** make authorisation
 * decisions. Admin access is enforced inside each page and Server Action by
 * `requireSession()`, because an edge-level check can be bypassed (see
 * CVE-2025-29927) and because a missing matcher entry would silently open a
 * route. Here we only add headers.
 *
 * In Next.js 16 this file is named `proxy.ts`; it is the renamed successor to
 * `middleware.ts`.
 */

const isProd = process.env.NODE_ENV === "production";

export default function proxy(request: NextRequest) {
  // 16 bytes of entropy, base64 encoded, per request.
  const nonce = Buffer.from(crypto.randomUUID().replace(/-/g, ""), "hex").toString("base64");

  const csp = [
    // Nothing is allowed unless a more specific directive permits it.
    `default-src 'self'`,
    // `strict-dynamic` lets Next's nonced bootstrap load its own chunks without
    // us having to enumerate every hashed filename.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${isProd ? "" : "'unsafe-eval'"}`.trim(),
    // Tailwind emits a stylesheet, but Next also inlines critical CSS.
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob:`,
    `font-src 'self' data:`,
    // No third-party endpoints are contacted, so same-origin only.
    `connect-src 'self'`,
    `media-src 'self'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-src 'none'`,
    `frame-ancestors 'none'`,
    `worker-src 'self' blob:`,
    `manifest-src 'self'`,
    isProd ? `upgrade-insecure-requests` : "",
  ]
    .filter(Boolean)
    .join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  // Strip any client-supplied nonce header so it cannot be reflected.
  requestHeaders.delete("content-security-policy");

  const response = NextResponse.next({ request: { headers: requestHeaders } });

  response.headers.set("Content-Security-Policy", csp);
  // Belt and braces: these are also set in next.config.ts, which covers static
  // responses that bypass this handler.
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}

export const config = {
  /**
   * Run on documents only. Static assets, the image optimiser and the favicon
   * do not need a CSP and skipping them keeps the response path cheap.
   */
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|llms.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff|woff2|ttf|otf|txt|xml|webmanifest)$).*)",
  ],
};
