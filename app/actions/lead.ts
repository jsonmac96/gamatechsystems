"use server";

import { audit, ready } from "@/lib/db";
import { createLead } from "@/lib/leads";
import { consumeRateLimit, formatCooldown } from "@/lib/rate-limit";
import { assertSameOrigin, getClientContext } from "@/lib/request-context";
import { validateLead } from "@/lib/validate";
import { isSuspiciouslyFast, verifyFormToken } from "@/lib/form-token";
import type { LeadFormState } from "@/lib/form-state";
import { SITE } from "@/lib/site";

/**
 * Public lead-capture action.
 *
 * Layered defences, in the order they run:
 *   1. Same-origin check — rejects a form posted from another site.
 *   2. Per-IP rate limit — 5 submissions an hour, 20 a day.
 *   3. Server-side validation — every field re-checked regardless of what the
 *      browser allowed, with length caps and control characters stripped.
 *   4. Honeypot + server-signed timing token — silently files obvious bots as
 *      spam rather than telling them they were caught.
 *   5. Parameterised insert — the stored row can contain no SQL.
 *
 * Note that nothing here echoes raw input back into HTML: the success screen is
 * static text, and React escapes any value it does render.
 */

const RATE_LIMIT_HOURLY = 5;
const RATE_LIMIT_DAILY = 20;

export async function submitLead(
  _previous: LeadFormState,
  formData: FormData,
): Promise<LeadFormState> {
  // 1. Origin
  try {
    await assertSameOrigin();
  } catch {
    return {
      status: "error",
      message: "We could not verify that request. Please reload the page and try again.",
      errors: {},
    };
  }

  const { ipHash } = await getClientContext();

  try {
    await ready();
  } catch {
    return {
      status: "error",
      message: `We could not save enquiries just now. Please email ${SITE.email} instead.`,
      errors: {},
      values: keepValues(formData),
    };
  }

  // 2. Rate limit
  const hourly = await consumeRateLimit(`lead:h:${ipHash}`, RATE_LIMIT_HOURLY, 3600);
  if (!hourly.allowed) {
    return {
      status: "error",
      message: `You have sent several enquiries already. Please try again in ${formatCooldown(
        hourly.retryAfterSeconds,
      )}, or email us directly.`,
      errors: {},
    };
  }
  const daily = await consumeRateLimit(`lead:d:${ipHash}`, RATE_LIMIT_DAILY, 86_400);
  if (!daily.allowed) {
    return {
      status: "error",
      message: "Daily enquiry limit reached from this connection. Please email us instead.",
      errors: {},
    };
  }

  // 3. Form token: server-stamped and signed at render time, so the age of the
  //    page is known without trusting a client-side timer.
  const token = verifyFormToken(formData.get("formToken"));
  if (!token.ok) {
    if (token.reason === "expired") {
      return {
        status: "error",
        message: "This page has been open for a while. Please reload it and send your enquiry again.",
        errors: {},
        values: keepValues(formData),
      };
    }
    // Missing, malformed or forged: almost certainly a script posting directly.
    return {
      status: "error",
      message: "We could not verify that request. Please reload the page and try again.",
      errors: {},
    };
  }

  // 4. Validation
  const result = validateLead(formData);

  if (!result.ok) {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      errors: result.errors,
      values: keepValues(formData),
    };
  }

  // 5. Bots: accept the request so the bot stops retrying, but file it as spam
  //    so it never reaches the real inbox view by default.
  const looksAutomated = result.botSuspected || isSuspiciouslyFast(token.ageMs);
  const status = looksAutomated ? "spam" : "new";

  try {
    await createLead(result.value, { ipHash, status });
  } catch {
    // Never surface a database error message to the public.
    await audit({ actor: "public", action: "lead.create_failed", ipHash });
    return {
      status: "error",
      message:
        `Something went wrong saving your enquiry. Please email ${SITE.email} and we will pick it up straight away.`,
      errors: {},
      values: keepValues(formData),
    };
  }

  return {
    status: "success",
    message:
      "Thank you — your enquiry is in. We reply to every message within one business day.",
    errors: {},
  };
}

/** Re-populate the form after a validation failure, minus the honeypot and token. */
function keepValues(formData: FormData): Record<string, string> {
  const keep = ["name", "email", "phone", "company", "service", "budget", "message"];
  const values: Record<string, string> = {};
  for (const key of keep) {
    const value = formData.get(key);
    if (typeof value === "string") values[key] = value.slice(0, 2000);
  }
  return values;
}
