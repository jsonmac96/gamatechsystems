import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "@/lib/env";

/**
 * Signed form timestamps.
 *
 * The lead form needs to know how long a visitor had the page open, because a
 * submission that arrives milliseconds after render was not typed by a person.
 *
 * An earlier version measured this with a client-side timer written into a
 * hidden field. That was wrong twice over: a bot can simply send whatever
 * number it likes, and — worse — a real visitor whose submit beat the first
 * timer tick got flagged as a bot. This version has the *server* stamp and
 * sign the time at render, so the value is both tamper-proof and present from
 * the moment the HTML is produced.
 *
 * Format: `<issuedAtMs>.<hmac-base64url>`
 */

const MAX_AGE_MS = 3 * 60 * 60 * 1000; // a page older than 3 hours is stale
const MIN_AGE_MS = 1500; // nobody reads and fills a form in under 1.5s

function sign(issuedAt: string): string {
  return createHmac("sha256", env.appSecret)
    .update("form-token")
    .update("\u0000")
    .update(issuedAt)
    .digest("base64url");
}

/** Issue a token for a form being rendered now. */
export function issueFormToken(): string {
  const issuedAt = String(Date.now());
  return `${issuedAt}.${sign(issuedAt)}`;
}

export type FormTokenResult =
  /** Signature valid; `ageMs` is how long the form was on screen. */
  | { ok: true; ageMs: number }
  /** Missing, malformed, forged or expired. */
  | { ok: false; reason: "missing" | "malformed" | "bad-signature" | "expired" };

export function verifyFormToken(raw: unknown): FormTokenResult {
  if (typeof raw !== "string" || raw.length === 0) return { ok: false, reason: "missing" };
  if (raw.length > 200) return { ok: false, reason: "malformed" };

  const parts = raw.split(".");
  if (parts.length !== 2) return { ok: false, reason: "malformed" };

  const [issuedAt, signature] = parts as [string, string];
  if (!/^\d{10,16}$/.test(issuedAt)) return { ok: false, reason: "malformed" };

  const expected = sign(issuedAt);
  const a = Buffer.from(signature, "base64url");
  const b = Buffer.from(expected, "base64url");
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { ok: false, reason: "bad-signature" };
  }

  const ageMs = Date.now() - Number(issuedAt);
  // A negative age means a clock change; treat it as stale rather than instant.
  if (ageMs < -60_000 || ageMs > MAX_AGE_MS) return { ok: false, reason: "expired" };

  return { ok: true, ageMs };
}

/** True when the form was submitted implausibly fast for a human. */
export function isSuspiciouslyFast(ageMs: number): boolean {
  return ageMs >= 0 && ageMs < MIN_AGE_MS;
}
