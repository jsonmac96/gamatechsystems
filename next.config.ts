import type { NextConfig } from "next";

/**
 * Security headers that do not depend on a per-request nonce.
 * The Content-Security-Policy itself is issued per-request in `proxy.ts`
 * so that it can carry a fresh nonce for Next.js' inline bootstrap scripts.
 */
const securityHeaders = [
  // Force HTTPS for two years, including subdomains, and allow preloading.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Never let a browser guess a response's content type.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Legacy clickjacking defence (CSP frame-ancestors covers modern browsers).
  { key: "X-Frame-Options", value: "DENY" },
  // Don't leak full URLs (which can contain slugs/IDs) to third parties.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Switch off browser features this site has no use for.
  {
    key: "Permissions-Policy",
    value: [
      "accelerometer=()",
      "autoplay=()",
      "camera=()",
      "display-capture=()",
      "encrypted-media=()",
      "geolocation=()",
      "gyroscope=()",
      "magnetometer=()",
      "microphone=()",
      "midi=()",
      "payment=()",
      "picture-in-picture=()",
      "publickey-credentials-get=()",
      "screen-wake-lock=()",
      "serial=()",
      "hid=()",
      "idle-detection=()",
      "usb=()",
      "xr-spatial-tracking=()",
    ].join(", "),
  },
  // Cross-origin isolation hardening.
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
  { key: "Origin-Agent-Cluster", value: "?1" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Don't advertise the framework version to attackers fingerprinting the stack.
  poweredByHeader: false,
  // Canonicalise URLs: /about/ -> /about (one URL per page, good for SEO).
  trailingSlash: false,
  // Fail the production build on type errors rather than shipping them.
  typescript: { ignoreBuildErrors: false },
  // node-postgres optionally probes for a native addon; keep it out of the
  // bundler so it is loaded as a normal Node module at runtime.
  serverExternalPackages: ["pg"],
  // The schema file is read at runtime by lib/db.ts, so it must be shipped
  // even though nothing imports it as a module.
  outputFileTracingIncludes: { "/**": ["./lib/schema.sql"] },
  experimental: {
    // Cap the body of Server Action POSTs (lead form, admin forms) at 1 MB.
    serverActions: { bodySizeLimit: "1mb" },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    // No remote image hosts are allowed; all imagery is local SVG/CSS.
    remotePatterns: [],
    dangerouslyAllowSVG: false,
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        // Never let a proxy or browser cache an authenticated admin screen.
        source: "/admin/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, private" },
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
};

export default nextConfig;
