"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { loginAction } from "@/app/actions/admin";
import { initialLoginState } from "@/lib/form-state";

/**
 * Admin sign-in form.
 *
 * When the server reports a lockout it also returns the number of seconds
 * remaining. This component counts that down and keeps the submit button
 * disabled until it reaches zero, so the operator can see exactly how long to
 * wait instead of guessing. The countdown is purely a courtesy — the lockout
 * itself is enforced server-side in `lib/rate-limit.ts` and cannot be
 * bypassed by editing the page.
 */
export default function LoginForm({
  next,
  failThreshold,
}: {
  next: string;
  failThreshold: number;
}) {
  const [state, formAction] = useActionState(loginAction, initialLoginState);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!state.retryAfterSeconds) {
      setCooldown(0);
      return;
    }
    setCooldown(state.retryAfterSeconds);
    const id = window.setInterval(() => {
      setCooldown((seconds) => (seconds <= 1 ? 0 : seconds - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [state.retryAfterSeconds]);

  const locked = cooldown > 0;

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="next" value={next} />

      {state.error ? (
        <div
          role="alert"
          aria-live="assertive"
          className={`animate-fade-in rounded-xl border px-4 py-3 text-sm font-medium ${
            locked
              ? "border-accent-500/60 bg-accent-500/10 text-accent-400"
              : "border-red-800 bg-red-950/50 text-red-200"
          }`}
        >
          {locked ? (
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 2a4 4 0 0 0-4 4v2H5.5A1.5 1.5 0 0 0 4 9.5v7A1.5 1.5 0 0 0 5.5 18h9a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 14.5 8H14V6a4 4 0 0 0-4-4Zm2 6V6a2 2 0 1 0-4 0v2h4Z" clipRule="evenodd" />
              </svg>
              Too many failed attempts. Try again in {cooldown} second{cooldown === 1 ? "" : "s"}.
            </span>
          ) : (
            state.error
          )}
        </div>
      ) : null}

      <div>
        <label htmlFor="username" className="mb-1.5 block text-sm font-semibold text-ink-100">
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          required
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          maxLength={64}
          defaultValue={state.username ?? ""}
          disabled={locked}
          className="block w-full rounded-xl border border-ink-700 bg-ink-950/70 px-4 py-3 text-base text-white shadow-sm transition placeholder:text-ink-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/40 disabled:cursor-not-allowed disabled:opacity-60"
          placeholder="your.username"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-ink-100">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          maxLength={1024}
          disabled={locked}
          className="block w-full rounded-xl border border-ink-700 bg-ink-950/70 px-4 py-3 text-base text-white shadow-sm transition placeholder:text-ink-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/40 disabled:cursor-not-allowed disabled:opacity-60"
          placeholder="••••••••••••••"
        />
      </div>

      <SubmitButton locked={locked} cooldown={cooldown} />

      <p className="text-center text-xs text-ink-500">
        {failThreshold} wrong attempts trigger a 1-minute cooldown.
      </p>
    </form>
  );
}

function SubmitButton({ locked, cooldown }: { locked: boolean; cooldown: number }) {
  const { pending } = useFormStatus();
  const disabled = locked || pending;

  return (
    <button
      type="submit"
      disabled={disabled}
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-400 px-6 py-3.5 text-base font-bold text-ink-950 shadow-glow transition-all duration-200 enabled:hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? (
        <>
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
            <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
          Checking…
        </>
      ) : locked ? (
        `Locked — ${cooldown}s`
      ) : (
        "Sign in"
      )}
    </button>
  );
}
