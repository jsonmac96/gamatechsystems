import "server-only";
import {
  createHmac,
  randomBytes,
  randomInt,
  timingSafeEqual,
} from "node:crypto";
import { env } from "@/lib/env";

/**
 * Keyed one-way helpers.
 *
 * Everything sensitive that must be *looked up* but not *read back* — session
 * tokens, client IP addresses — is stored as an HMAC keyed with APP_SECRET.
 * That makes the stored value useless on its own: a database dump cannot be
 * replayed as a session, and IPs cannot be recovered or rainbow-tabled.
 */

/** HMAC-SHA256 of `value` under a per-purpose derived key, hex encoded. */
export function keyedHash(purpose: string, value: string): string {
  return createHmac("sha256", env.appSecret)
    .update(purpose)
    .update("\u0000")
    .update(value)
    .digest("hex");
}

/** A cryptographically random, URL-safe token of `bytes` entropy. */
export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

/** Constant-time string comparison that does not leak length via early exit. */
export function safeEqual(a: string, b: string): boolean {
  const ha = createHmac("sha256", env.appSecret).update(a).digest();
  const hb = createHmac("sha256", env.appSecret).update(b).digest();
  return timingSafeEqual(ha, hb);
}

/** Random integer in [min, max] — used to jitter responses. */
export function randomBetween(min: number, max: number): number {
  if (max <= min) return min;
  return randomInt(min, max + 1);
}

/** Hash a client IP for storage. Never store or log the raw address. */
export function hashIp(ip: string): string {
  return keyedHash("ip", ip || "unknown");
}

/** Hash a user agent string for weak session binding. */
export function hashUserAgent(ua: string): string {
  return keyedHash("ua", (ua || "unknown").slice(0, 512));
}
