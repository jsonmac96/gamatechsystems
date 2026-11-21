/**
 * Hand-rolled input validation.
 *
 * Deliberately dependency-free: every public entry point (lead form, login,
 * blog editor) runs through these functions on the server, so validation can
 * never be skipped by disabling JavaScript or posting directly to the action.
 * Client-side `required`/`maxLength` attributes are a convenience only.
 *
 * Each validator returns a *cleaned* value, never the raw input, so downstream
 * code only ever sees text of a known shape and length.
 */

export type FieldErrors = Record<string, string>;

export type Validated<T> =
  | { ok: true; value: T }
  | { ok: false; errors: FieldErrors };

// ---------------------------------------------------------------------------
// Primitive cleaners
// ---------------------------------------------------------------------------

/** Coerce to string, strip control characters, collapse whitespace, trim. */
export function cleanText(raw: unknown, maxLength = 500): string {
  if (typeof raw !== "string") return "";
  return raw
    .normalize("NFKC")
    // Remove C0/C1 control characters except tab and newline.
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, "")
    // Remove zero-width and bidi-override characters used to spoof text.
    .replace(/[​-‏‪-‮⁠-⁤﻿]/g, "")
    .replace(/[ \t]+/g, " ")
    .trim()
    .slice(0, maxLength);
}

/** Like `cleanText` but preserves newlines (for message bodies). */
export function cleanMultiline(raw: unknown, maxLength = 5000): string {
  if (typeof raw !== "string") return "";
  return raw
    .normalize("NFKC")
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, "")
    .replace(/[​-‏‪-‮⁠-⁤﻿]/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, maxLength);
}

// ---------------------------------------------------------------------------
// Email
// ---------------------------------------------------------------------------

/**
 * Pragmatic email validation.
 *
 * A single local part, a dotted domain, no spaces, sane lengths. This is
 * intentionally stricter than the RFC: addresses the regex would reject are
 * vanishingly rare in practice, whereas accepting header-injection characters
 * would be a real problem the moment these addresses are emailed.
 */
const EMAIL_RE =
  /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,24}$/;

export function validateEmail(raw: unknown): { ok: true; value: string } | { ok: false; error: string } {
  const value = cleanText(raw, 254).toLowerCase();
  if (!value) return { ok: false, error: "Email address is required." };
  if (value.length > 254) return { ok: false, error: "That email address is too long." };
  // Reject anything that could be used for header injection downstream.
  if (/[\s,;:<>()[\]\\"]/.test(value)) {
    return { ok: false, error: "Enter a valid email address." };
  }
  if (!EMAIL_RE.test(value)) return { ok: false, error: "Enter a valid email address." };

  const [local, domain] = value.split("@") as [string, string];
  if (local.length > 64) return { ok: false, error: "Enter a valid email address." };
  if (domain.includes("..")) return { ok: false, error: "Enter a valid email address." };
  // Catch the most common typo'd domains early rather than losing the lead.
  if (/^(gmial|gmai|gmal|gmaill)\.com$/.test(domain)) {
    return { ok: false, error: "Did you mean gmail.com?" };
  }
  return { ok: true, value };
}

// ---------------------------------------------------------------------------
// Phone (Philippine-friendly, but tolerant of international formats)
// ---------------------------------------------------------------------------

export function validatePhone(
  raw: unknown,
  { required = false }: { required?: boolean } = {},
): { ok: true; value: string } | { ok: false; error: string } {
  const cleaned = cleanText(raw, 32);
  if (!cleaned) {
    return required ? { ok: false, error: "Phone number is required." } : { ok: true, value: "" };
  }
  const digits = cleaned.replace(/[^\d]/g, "");
  if (digits.length < 7 || digits.length > 15) {
    return { ok: false, error: "Enter a valid phone number." };
  }
  if (!/^[+\d][\d\s().-]*$/.test(cleaned)) {
    return { ok: false, error: "Enter a valid phone number." };
  }
  return { ok: true, value: cleaned };
}

// ---------------------------------------------------------------------------
// URL slug
// ---------------------------------------------------------------------------

/**
 * Build a clean, lowercase, hyphenated slug.
 * Used for blog URLs, so it must never contain path separators or `..`.
 */
export function slugify(raw: unknown, maxLength = 80): string {
  return cleanText(raw, 300)
    .toLowerCase()
    .normalize("NFKD")
    // Drop combining marks left over from decomposition (é -> e).
    .replace(/[̀-ͯ]/g, "")
    .replace(/['’"“”]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength)
    .replace(/-+$/g, "");
}

/** True when `value` is a slug safe to put in a URL path and a SQL parameter. */
export function isValidSlug(value: unknown): value is string {
  return typeof value === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) && value.length <= 80;
}

// ---------------------------------------------------------------------------
// Enum helper
// ---------------------------------------------------------------------------

export function oneOf<T extends string>(
  raw: unknown,
  allowed: readonly T[],
  fallback: T,
): T {
  const value = cleanText(raw, 60);
  return (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

// ---------------------------------------------------------------------------
// Lead form
// ---------------------------------------------------------------------------

export const SERVICE_OPTIONS = [
  "Software Development",
  "Systems Automation",
  "Web Development",
  "Custom Software",
  "SEO",
  "AEO",
  "Marketing",
  "Not sure yet",
] as const;

export const BUDGET_OPTIONS = [
  "Under ₱50,000",
  "₱50,000 – ₱150,000",
  "₱150,000 – ₱500,000",
  "₱500,000+",
  "Prefer to discuss",
] as const;

export type LeadInput = {
  name: string;
  email: string;
  phone: string;
  company: string;
  service: string;
  budget: string;
  message: string;
  sourcePath: string;
};

/**
 * Validate a lead submission.
 *
 * Returns `botSuspected` when the honeypot field was filled in or the message
 * looks like link spam. The *timing* half of the bot check lives in the action,
 * which verifies a server-signed token — see lib/form-token.ts.
 */
export function validateLead(form: {
  get(key: string): unknown;
}): Validated<LeadInput> & { botSuspected?: boolean } {
  const errors: FieldErrors = {};

  const name = cleanText(form.get("name"), 80);
  if (name.length < 2) errors.name = "Please enter your full name.";
  else if (name.length > 80) errors.name = "That name is too long.";
  else if (!/[A-Za-zÀ-ÿĀ-ſ]/.test(name)) errors.name = "Please enter your full name.";
  else if (/https?:\/\/|<[a-z]/i.test(name)) errors.name = "Please enter your full name.";

  const email = validateEmail(form.get("email"));
  if (!email.ok) errors.email = email.error;

  const phone = validatePhone(form.get("phone"));
  if (!phone.ok) errors.phone = phone.error;

  const company = cleanText(form.get("company"), 120);
  const service = oneOf(form.get("service"), SERVICE_OPTIONS, "Not sure yet");
  const budget = oneOf(form.get("budget"), BUDGET_OPTIONS, "Prefer to discuss");

  const message = cleanMultiline(form.get("message"), 2000);
  if (message.length < 10) {
    errors.message = "Tell us a little more — at least 10 characters.";
  } else if (message.length > 2000) {
    errors.message = "Please keep your message under 2,000 characters.";
  }

  const sourcePathRaw = cleanText(form.get("sourcePath"), 200);
  const sourcePath = sourcePathRaw.startsWith("/") && !sourcePathRaw.startsWith("//")
    ? sourcePathRaw
    : "/";

  // Honeypot: a hidden field real users never see, let alone fill in.
  const honeypot = cleanText(form.get("website_url"), 200);
  const botSuspected = honeypot.length > 0;

  // An obvious link-spam payload in the message body.
  const linkCount = (message.match(/https?:\/\//gi) ?? []).length;
  const spammy = linkCount >= 4 || /\[url=|\bviagra\b|\bcasino\b|\bcrypto airdrop\b/i.test(message);

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    botSuspected: botSuspected || spammy,
    value: {
      name,
      email: email.ok ? email.value : "",
      phone: phone.ok ? phone.value : "",
      company,
      service,
      budget,
      message,
      sourcePath,
    },
  };
}

// ---------------------------------------------------------------------------
// Blog post
// ---------------------------------------------------------------------------

export type PostInput = {
  slug: string;
  title: string;
  excerpt: string;
  bodyMd: string;
  coverAlt: string;
  tags: string;
  metaTitle: string;
  metaDescription: string;
  status: "draft" | "published";
  authorName: string;
};

export function validatePost(form: { get(key: string): unknown }): Validated<PostInput> {
  const errors: FieldErrors = {};

  const title = cleanText(form.get("title"), 140);
  if (title.length < 5) errors.title = "Give the post a title of at least 5 characters.";

  const slugSource = cleanText(form.get("slug"), 120) || title;
  const slug = slugify(slugSource);
  if (!isValidSlug(slug)) {
    errors.slug = "The URL slug must contain letters, numbers and hyphens only.";
  }

  const excerpt = cleanMultiline(form.get("excerpt"), 300);
  if (excerpt.length > 0 && excerpt.length < 20) {
    errors.excerpt = "An excerpt should be at least 20 characters, or left blank.";
  }

  const bodyMd = cleanMultiline(form.get("bodyMd"), 60000);
  if (bodyMd.length < 80) errors.bodyMd = "The article body should be at least 80 characters.";

  const coverAlt = cleanText(form.get("coverAlt"), 160);
  const tags = cleanText(form.get("tags"), 160)
    .split(",")
    .map((t) => cleanText(t, 32))
    .filter(Boolean)
    .slice(0, 8)
    .join(", ");

  const metaTitle = cleanText(form.get("metaTitle"), 70);
  const metaDescription = cleanText(form.get("metaDescription"), 165);
  if (metaDescription.length > 0 && metaDescription.length < 50) {
    errors.metaDescription =
      "A meta description works best between 50 and 160 characters, or leave it blank.";
  }

  const status = oneOf(form.get("status"), ["draft", "published"] as const, "draft");
  const authorName = cleanText(form.get("authorName"), 80) || "GamaTech Systems";

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: {
      slug,
      title,
      excerpt,
      bodyMd,
      coverAlt,
      tags,
      metaTitle,
      metaDescription,
      status,
      authorName,
    },
  };
}
