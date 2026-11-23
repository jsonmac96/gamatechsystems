"use client";

import { useActionState } from "react";
import { useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { usePathname } from "next/navigation";
import { submitLead } from "@/app/actions/lead";
import { initialLeadFormState } from "@/lib/form-state";
import { BUDGET_OPTIONS, SERVICE_OPTIONS } from "@/lib/validate";
import { SITE } from "@/lib/site";

/**
 * Lead capture form.
 *
 * Progressive enhancement: this is a real `<form>` wired to a Server Action,
 * so it submits and validates even if the client bundle never loads. The
 * client-side pieces — the pending state, the inline errors, the success
 * panel — are enhancements on top.
 *
 * Two anti-spam measures are rendered here and checked on the server:
 *   - a honeypot `website_url` field, hidden from sight and from assistive
 *     technology, which only an automated filler would complete;
 *   - `formToken`, a timestamp the server signed when it rendered this form.
 *     The server compares it against the clock on submit, so a post that
 *     arrives milliseconds after render is treated as automated. The value is
 *     produced server-side precisely so it does not depend on a client timer
 *     having ticked, and cannot be forged.
 */
export default function LeadForm({
  formToken,
  defaultService,
  compact = false,
}: {
  /** Signed timestamp issued by the server component rendering this form. */
  formToken: string;
  defaultService?: string;
  compact?: boolean;
}) {
  const [state, formAction] = useActionState(submitLead, initialLeadFormState);
  const pathname = usePathname();
  const successRef = useRef<HTMLDivElement>(null);

  // Move focus to the confirmation so screen-reader users hear the result.
  useEffect(() => {
    if (state.status === "success") successRef.current?.focus();
  }, [state.status]);

  if (state.status === "success") {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        aria-live="polite"
        className="animate-scale-in rounded-3xl border border-brand-300 bg-gradient-to-br from-brand-50 to-white p-8 text-center shadow-card sm:p-10 dark:border-brand-800 dark:from-ink-900 dark:to-ink-950"
      >
        <span className="relative mx-auto flex h-16 w-16 items-center justify-center">
          <span className="absolute inset-0 animate-pulse-ring rounded-full bg-brand-400/60" />
          <span className="relative inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-500 text-white">
            <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m5 13 4.5 4.5L19 7.5" />
            </svg>
          </span>
        </span>
        <h2 className="mt-6 text-2xl font-bold text-ink-900 dark:text-white">Enquiry received</h2>
        <p className="mx-auto mt-3 max-w-md text-ink-600 dark:text-ink-300">{state.message}</p>
        <p className="mt-6 text-sm text-ink-500 dark:text-ink-400">
          Need us sooner? Call{" "}
          <a href={`tel:${SITE.phoneHref}`} className="font-semibold text-brand-700 underline underline-offset-2 dark:text-brand-300">
            {SITE.phoneDisplay}
          </a>
        </p>
      </div>
    );
  }

  const values = state.values ?? {};
  const err = state.errors;

  return (
    <form action={formAction} noValidate className={compact ? "space-y-4" : "space-y-5"}>
      {/* Context for the admin: which page produced this lead. */}
      <input type="hidden" name="sourcePath" value={pathname} />
      {/* Server-signed render timestamp; see lib/form-token.ts. */}
      <input type="hidden" name="formToken" value={formToken} />

      {/* Honeypot. Hidden from sight and from the accessibility tree, and
          never focusable, so no real visitor can fill it in. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website_url">Website (leave blank)</label>
        <input id="website_url" name="website_url" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      {state.status === "error" && state.message ? (
        <div
          role="alert"
          className="animate-fade-in rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200"
        >
          {state.message}
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="name"
          label="Full name"
          required
          error={err.name}
          autoComplete="name"
          placeholder="Juan Dela Cruz"
          defaultValue={values.name}
          maxLength={80}
        />
        <Field
          id="email"
          label="Work email"
          type="email"
          required
          error={err.email}
          autoComplete="email"
          placeholder="juan@yourcompany.ph"
          defaultValue={values.email}
          maxLength={254}
        />
        <Field
          id="phone"
          label="Mobile number"
          type="tel"
          error={err.phone}
          autoComplete="tel"
          placeholder="+63 917 123 4567"
          defaultValue={values.phone}
          maxLength={32}
          hint="Optional, but it is the fastest way to reach you."
        />
        <Field
          id="company"
          label="Company"
          error={err.company}
          autoComplete="organization"
          placeholder="Your business name"
          defaultValue={values.company}
          maxLength={120}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="service" className="field-label">
            What do you need help with?
          </label>
          <select
            id="service"
            name="service"
            className="field"
            defaultValue={values.service ?? defaultService ?? "Not sure yet"}
          >
            {SERVICE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="budget" className="field-label">
            Indicative budget
          </label>
          <select id="budget" name="budget" className="field" defaultValue={values.budget ?? "Prefer to discuss"}>
            {BUDGET_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <p className="field-hint">A range is enough — it helps us scope realistically.</p>
        </div>
      </div>

      <div>
        <label htmlFor="message" className="field-label">
          Tell us about the problem <span className="text-red-500 dark:text-red-400">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={compact ? 4 : 5}
          required
          maxLength={2000}
          aria-invalid={err.message ? true : undefined}
          aria-describedby={err.message ? "message-error" : "message-hint"}
          className={`field resize-y ${err.message ? "field-error" : ""}`}
          placeholder="We are a distributor with 3 branches. Orders come in by Viber and get typed into Excel, then re-typed into Xero. Month-end takes a week."
          defaultValue={values.message}
        />
        {err.message ? (
          <p id="message-error" className="error-text">
            <ErrorIcon />
            {err.message}
          </p>
        ) : (
          <p id="message-hint" className="field-hint">
            The more specific you are, the more useful our first reply will be.
          </p>
        )}
      </div>

      <SubmitButton compact={compact} />

      <p className="text-center text-xs leading-relaxed text-ink-500 dark:text-ink-400">
        We reply within one business day. Your details are used only to answer your enquiry —
        never sold, never added to a list you did not ask for. See our{" "}
        <a href="/privacy" className="underline underline-offset-2 hover:text-brand-700 dark:hover:text-brand-300">
          privacy policy
        </a>
        .
      </p>
    </form>
  );
}

/** Submit button with a pending state driven by the form's own status. */
function SubmitButton({ compact }: { compact: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className={`btn-cta w-full ${compact ? "py-4 text-base" : ""}`}>
      {pending ? (
        <>
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
            <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
          Sending your enquiry…
        </>
      ) : (
        <>
          Get my free consultation
          <svg className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 12h15M13 6l6 6-6 6" />
          </svg>
        </>
      )}
    </button>
  );
}

type FieldProps = {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  placeholder?: string;
  autoComplete?: string;
  defaultValue?: string;
  maxLength?: number;
};

function Field({
  id,
  label,
  type = "text",
  required = false,
  error,
  hint,
  placeholder,
  autoComplete,
  defaultValue,
  maxLength,
}: FieldProps) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label} {required ? <span className="text-red-500 dark:text-red-400">*</span> : null}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        required={required}
        maxLength={maxLength}
        placeholder={placeholder}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`field ${error ? "field-error" : ""}`}
      />
      {error ? (
        <p id={`${id}-error`} className="error-text">
          <ErrorIcon />
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="field-hint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function ErrorIcon() {
  return (
    <svg className="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm0 4a.9.9 0 0 1 .9.9v3.4a.9.9 0 0 1-1.8 0V6.9A.9.9 0 0 1 10 6Zm0 7.2a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
