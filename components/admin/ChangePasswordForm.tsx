"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { changePasswordAction } from "@/app/actions/admin";
import { initialPasswordState } from "@/lib/form-state";

/**
 * Password change form.
 *
 * The strength meter is a hint only — `checkPasswordStrength` runs again on
 * the server, so a password that fails policy is rejected there regardless of
 * what this component displays.
 */
export default function ChangePasswordForm({ minLength }: { minLength: number }) {
  const [state, formAction] = useActionState(changePasswordAction, initialPasswordState);
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");

  const strength = scorePassword(next, minLength);
  const mismatch = confirm.length > 0 && next !== confirm;

  return (
    <form action={formAction} className="space-y-5">
      {state.error ? (
        <div
          role="alert"
          className="animate-fade-in rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200"
        >
          {state.error}
        </div>
      ) : null}

      <div>
        <label htmlFor="currentPassword" className="field-label">
          Current password <span className="text-red-600 dark:text-red-400">*</span>
        </label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          required
          autoComplete="current-password"
          maxLength={1024}
          className="field"
        />
      </div>

      <div>
        <label htmlFor="newPassword" className="field-label">
          New password <span className="text-red-600 dark:text-red-400">*</span>
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          required
          minLength={minLength}
          maxLength={1024}
          autoComplete="new-password"
          value={next}
          onChange={(event) => setNext(event.target.value)}
          aria-describedby="password-strength"
          className="field"
        />

        <div id="password-strength" className="mt-2.5">
          <div className="flex gap-1.5" aria-hidden="true">
            {[0, 1, 2, 3].map((index) => (
              <span
                key={index}
                className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                  index < strength.score ? strength.barClass : "bg-ink-200 dark:bg-ink-800"
                }`}
              />
            ))}
          </div>
          <p className={`mt-1.5 text-xs font-medium ${strength.textClass}`} role="status">
            {next.length === 0
              ? `At least ${minLength} characters, mixing letters, numbers and symbols.`
              : strength.label}
          </p>
        </div>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="field-label">
          Confirm new password <span className="text-red-600 dark:text-red-400">*</span>
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          maxLength={1024}
          autoComplete="new-password"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          aria-invalid={mismatch ? true : undefined}
          aria-describedby={mismatch ? "confirm-error" : undefined}
          className={`field ${mismatch ? "field-error" : ""}`}
        />
        {mismatch ? (
          <p id="confirm-error" className="error-text">
            The two passwords do not match.
          </p>
        ) : null}
      </div>

      <div className="rounded-xl bg-brand-50 px-4 py-3 text-xs text-brand-900 dark:bg-brand-950/40 dark:text-brand-200">
        Use a passphrase you have never used anywhere else — four or five unrelated words with a
        number and a symbol is both stronger and easier to remember than a short, complicated one.
      </div>

      <SubmitButton disabled={mismatch || next.length < minLength} />
    </form>
  );
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-3.5 text-base font-bold text-white shadow-glow transition-all duration-200 enabled:hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
    >
      {pending ? "Updating…" : "Change password"}
    </button>
  );
}

function scorePassword(
  password: string,
  minLength: number,
): { score: number; label: string; barClass: string; textClass: string } {
  if (password.length === 0) {
    return { score: 0, label: "", barClass: "bg-ink-200", textClass: "text-ink-500 dark:text-ink-400" };
  }

  let score = 0;
  if (password.length >= minLength) score += 1;
  if (password.length >= 18) score += 1;

  const classes = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((re) => re.test(password)).length;
  if (classes >= 3) score += 1;
  if (classes === 4) score += 1;

  if (password.length < minLength) {
    return {
      score: 1,
      label: `Too short — ${minLength - password.length} more character${
        minLength - password.length === 1 ? "" : "s"
      } needed.`,
      barClass: "bg-red-500",
      textClass: "text-red-600 dark:text-red-400",
    };
  }

  const levels = [
    { score: 1, label: "Weak — add more length and variety.", barClass: "bg-red-500", textClass: "text-red-600 dark:text-red-400" },
    { score: 2, label: "Fair — mix in another character type.", barClass: "bg-accent-500", textClass: "text-accent-700 dark:text-accent-400" },
    { score: 3, label: "Good.", barClass: "bg-brand-500", textClass: "text-brand-700 dark:text-brand-300" },
    { score: 4, label: "Strong.", barClass: "bg-green-500", textClass: "text-green-700 dark:text-green-400" },
  ];

  return levels[Math.min(score, 4) - 1] ?? levels[0]!;
}
