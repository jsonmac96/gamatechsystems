import type { FieldErrors } from "@/lib/validate";

/**
 * Shapes and initial values for every `useActionState` form on the site.
 *
 * These live in a plain module rather than beside their Server Actions
 * because a `"use server"` file may only export async functions — exporting a
 * constant object from one is a build error. Keeping them here also means a
 * client component can import the initial state without pulling in any
 * server-only code.
 */

// --- Public lead form ------------------------------------------------------

export type LeadFormState = {
  status: "idle" | "success" | "error";
  message: string;
  errors: FieldErrors;
  /** Echoed back so the form can repopulate after a failed submit. */
  values?: Record<string, string>;
};

export const initialLeadFormState: LeadFormState = {
  status: "idle",
  message: "",
  errors: {},
};

// --- Admin sign-in ---------------------------------------------------------

export type LoginState = {
  error: string;
  /** Seconds remaining on a lockout, so the form can show a countdown. */
  retryAfterSeconds?: number;
  username?: string;
};

export const initialLoginState: LoginState = { error: "" };

// --- Password change -------------------------------------------------------

export type PasswordState = { error: string; success: string };

export const initialPasswordState: PasswordState = { error: "", success: "" };

// --- Blog post editor ------------------------------------------------------

export type PostFormState = {
  error: string;
  errors: FieldErrors;
  values?: Record<string, string>;
};

export const initialPostFormState: PostFormState = { error: "", errors: {} };
