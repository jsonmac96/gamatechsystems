"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  changePassword,
  login,
  logout,
  requireSession,
  sanitiseReturnTo,
} from "@/lib/auth";
import { assertSameOrigin } from "@/lib/request-context";
import {
  deleteLead,
  updateLeadNotes,
  updateLeadStatus,
  LEAD_STATUSES,
  type LeadStatus,
} from "@/lib/leads";
import {
  createPost,
  deletePost,
  setPostStatus,
  updatePost,
} from "@/lib/posts";
import { cleanMultiline, cleanText, validatePost } from "@/lib/validate";
import type { LoginState, PasswordState, PostFormState } from "@/lib/form-state";
import { checkPasswordStrength } from "@/lib/password.mjs";

/**
 * Admin Server Actions.
 *
 * Two rules hold for every action in this file:
 *
 *   1. `assertSameOrigin()` runs first — a state-changing request must come
 *      from this site.
 *   2. `requireSession()` runs before anything is read or written — except in
 *      `loginAction`, which is the one action that creates a session.
 *
 * Authorisation is therefore enforced at the point of use. There is no path
 * through which an unauthenticated request reaches a write.
 */

// ---------------------------------------------------------------------------
// Authentication
// ---------------------------------------------------------------------------

export async function loginAction(
  _previous: LoginState,
  formData: FormData,
): Promise<LoginState> {
  try {
    await assertSameOrigin();
  } catch {
    return { error: "Could not verify that request. Reload the page and try again." };
  }

  const username = cleanText(formData.get("username"), 64);
  const password = typeof formData.get("password") === "string"
    ? (formData.get("password") as string)
    : "";
  const next = sanitiseReturnTo(cleanText(formData.get("next"), 200));

  const result = await login(username, password);

  if (!result.ok) {
    return {
      error: result.message,
      retryAfterSeconds: result.retryAfterSeconds,
      // Keep the username so the operator does not retype it — but never the password.
      username,
    };
  }

  redirect(next ?? "/admin");
}

export async function logoutAction(): Promise<void> {
  await assertSameOrigin();
  await logout();
  redirect("/admin/login");
}

export async function changePasswordAction(
  _previous: PasswordState,
  formData: FormData,
): Promise<PasswordState> {
  await assertSameOrigin();
  const session = await requireSession();

  const current = asString(formData.get("currentPassword"));
  const next = asString(formData.get("newPassword"));
  const confirm = asString(formData.get("confirmPassword"));

  if (next !== confirm) {
    return { error: "The new passwords do not match.", success: "" };
  }

  const problems = checkPasswordStrength(next, { username: session.username });
  if (problems.length > 0) {
    return { error: problems.join(" "), success: "" };
  }

  const result = await changePassword(session.userId, current, next);
  if (!result.ok) {
    return { error: result.message, success: "" };
  }

  // changePassword revokes every session, so the operator must sign in again.
  redirect("/admin/login?changed=1");
}

// ---------------------------------------------------------------------------
// Leads
// ---------------------------------------------------------------------------

export async function updateLeadStatusAction(formData: FormData): Promise<void> {
  await assertSameOrigin();
  const session = await requireSession();

  const id = asId(formData.get("id"));
  const statusRaw = cleanText(formData.get("status"), 20);
  if (!id || !(LEAD_STATUSES as readonly string[]).includes(statusRaw)) return;

  updateLeadStatus(id, statusRaw as LeadStatus, session.username);
  revalidatePath("/admin/leads");
  revalidatePath("/admin");
}

export async function updateLeadNotesAction(formData: FormData): Promise<void> {
  await assertSameOrigin();
  const session = await requireSession();

  const id = asId(formData.get("id"));
  if (!id) return;

  updateLeadNotes(id, cleanMultiline(formData.get("notes"), 4000), session.username);
  revalidatePath("/admin/leads");
}

export async function deleteLeadAction(formData: FormData): Promise<void> {
  await assertSameOrigin();
  const session = await requireSession();

  const id = asId(formData.get("id"));
  if (!id) return;

  deleteLead(id, session.username);
  revalidatePath("/admin/leads");
  revalidatePath("/admin");
}

// ---------------------------------------------------------------------------
// Blog posts
// ---------------------------------------------------------------------------

export async function createPostAction(
  _previous: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  await assertSameOrigin();
  const session = await requireSession();

  const validated = validatePost(formData);
  if (!validated.ok) {
    return { error: "Please fix the highlighted fields.", errors: validated.errors, values: keepPostValues(formData) };
  }

  const result = createPost(validated.value, session.userId, session.username);
  if (!result.ok) {
    return {
      error: result.message,
      errors: result.field ? { [result.field]: result.message } : {},
      values: keepPostValues(formData),
    };
  }

  revalidateBlog(result.slug);
  redirect("/admin/posts?created=1");
}

export async function updatePostAction(
  _previous: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  await assertSameOrigin();
  const session = await requireSession();

  const id = asId(formData.get("id"));
  if (!id) return { error: "Unknown post.", errors: {} };

  const validated = validatePost(formData);
  if (!validated.ok) {
    return { error: "Please fix the highlighted fields.", errors: validated.errors, values: keepPostValues(formData) };
  }

  const result = updatePost(id, validated.value, session.username);
  if (!result.ok) {
    return {
      error: result.message,
      errors: result.field ? { [result.field]: result.message } : {},
      values: keepPostValues(formData),
    };
  }

  revalidateBlog(result.slug);
  redirect("/admin/posts?saved=1");
}

export async function setPostStatusAction(formData: FormData): Promise<void> {
  await assertSameOrigin();
  const session = await requireSession();

  const id = asId(formData.get("id"));
  const status = cleanText(formData.get("status"), 20);
  if (!id || (status !== "draft" && status !== "published")) return;

  setPostStatus(id, status, session.username);
  revalidateBlog();
  revalidatePath("/admin/posts");
}

export async function deletePostAction(formData: FormData): Promise<void> {
  await assertSameOrigin();
  const session = await requireSession();

  const id = asId(formData.get("id"));
  if (!id) return;

  deletePost(id, session.username);
  revalidateBlog();
  revalidatePath("/admin/posts");
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Refresh every public surface a post appears on. */
function revalidateBlog(slug?: string): void {
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/blog/${slug}`);
}

function asString(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value : "";
}

/** Parse a row id from form data. Returns null for anything that is not a positive integer. */
function asId(value: FormDataEntryValue | null): number | null {
  if (typeof value !== "string") return null;
  if (!/^\d{1,10}$/.test(value)) return null;
  const id = Number.parseInt(value, 10);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function keepPostValues(formData: FormData): Record<string, string> {
  const keys = [
    "title", "slug", "excerpt", "bodyMd", "coverAlt",
    "tags", "metaTitle", "metaDescription", "status", "authorName",
  ];
  const values: Record<string, string> = {};
  for (const key of keys) {
    const value = formData.get(key);
    if (typeof value === "string") values[key] = value.slice(0, 60000);
  }
  return values;
}
