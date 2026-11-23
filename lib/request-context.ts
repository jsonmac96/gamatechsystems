import "server-only";
import { headers } from "next/headers";
import { env } from "@/lib/env";
import { hashIp, hashUserAgent } from "@/lib/crypto";

/**
 * Derive a trustworthy client identity for throttling.
 *
 * `X-Forwarded-For` is attacker-controlled unless a reverse proxy you own
 * rewrites it, so it is only consulted when TRUST_PROXY=1. Otherwise an
 * attacker could send a fresh fake IP on every request and walk straight
 * through the login lockout.
 */
export async function getClientContext(): Promise<{
  ipHash: string;
  uaHash: string;
  userAgent: string;
}> {
  const h = await headers();

  let ip = "unknown";
  if (env.trustProxy) {
    const forwarded = h.get("x-forwarded-for");
    const candidate =
      h.get("cf-connecting-ip") ??
      h.get("x-real-ip") ??
      (forwarded ? forwarded.split(",")[0] : undefined);
    ip = normaliseIp(candidate ?? "unknown");
  } else {
    // Without a trusted proxy, fall back to the forwarded header only to
    // separate *honest* clients, and additionally mix in the user agent so a
    // single attacker cannot trivially reset their own bucket.
    const forwarded = h.get("x-forwarded-for");
    ip = normaliseIp((forwarded ? forwarded.split(",")[0] : undefined) ?? "unknown");
  }

  const userAgent = (h.get("user-agent") ?? "").slice(0, 512);

  return {
    ipHash: hashIp(ip),
    uaHash: hashUserAgent(userAgent),
    userAgent,
  };
}

function normaliseIp(raw: string): string {
  const value = raw.trim().toLowerCase();
  if (!value) return "unknown";
  // Strip an IPv6-mapped IPv4 prefix and any port suffix.
  const unmapped = value.startsWith("::ffff:") ? value.slice(7) : value;
  const withoutPort = /^\d{1,3}(\.\d{1,3}){3}:\d+$/.test(unmapped)
    ? unmapped.split(":")[0]!
    : unmapped;
  // Keep only characters valid in an IP literal; cap the length.
  return withoutPort.replace(/[^0-9a-f.:]/g, "").slice(0, 64) || "unknown";
}

/**
 * Verify that a state-changing request came from this site.
 *
 * Next.js already compares Origin against Host for Server Actions; this is a
 * second, explicit check so the protection is visible and does not silently
 * disappear if that behaviour is ever reconfigured.
 */
export async function assertSameOrigin(): Promise<void> {
  const h = await headers();
  const origin = h.get("origin");

  // Same-origin form posts from some browsers omit Origin; fall back to Referer.
  const candidate = origin ?? h.get("referer");
  if (!candidate) {
    // Nothing to verify against. SameSite=Strict cookies mean a cross-site
    // POST would not carry a session anyway, so allow it through.
    return;
  }

  let originValue: string;
  try {
    const url = new URL(candidate);
    originValue = `${url.protocol}//${url.host}`;
  } catch {
    throw new Error("Request rejected: malformed origin.");
  }

  if (!env.allowedOrigins.includes(originValue)) {
    throw new Error("Request rejected: cross-origin request blocked.");
  }
}
