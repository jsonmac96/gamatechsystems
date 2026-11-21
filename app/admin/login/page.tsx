import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSession, sanitiseReturnTo } from "@/lib/auth";
import { LOGIN_FAIL_THRESHOLD } from "@/lib/rate-limit";
import Logo from "@/components/Logo";
import LoginForm from "@/components/admin/LoginForm";

/** The admin login screen must never be indexed or cached. */
export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // Already signed in? Go straight through.
  const session = await getSession();
  if (session) redirect("/admin");

  const params = await searchParams;
  const nextRaw = typeof params.next === "string" ? params.next : undefined;
  // Only ever accept an internal /admin path — otherwise this is an open redirect.
  const next = sanitiseReturnTo(nextRaw) ?? "";
  const passwordChanged = params.changed === "1";

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden px-5 py-12">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-ink-950 via-ink-900 to-brand-950" />
        <div className="blob left-[-6rem] top-[-5rem] h-80 w-80 animate-drift bg-brand-700/30" />
        <div
          className="blob bottom-[-6rem] right-[-5rem] h-80 w-80 animate-drift bg-accent-600/15"
          style={{ animationDelay: "-9s" }}
        />
        <div className="absolute inset-0 opacity-[0.07] grid-backdrop" />
      </div>

      <div className="w-full max-w-md animate-scale-in">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2.5" aria-label="GamaTech Systems — home">
            <Logo className="h-11 w-11" />
            <span className="text-xl font-bold tracking-tight text-white">
              GamaTech<span className="text-brand-400"> Systems</span>
            </span>
          </Link>
        </div>

        <div className="mt-8 rounded-3xl border border-ink-800 bg-ink-900/80 p-8 shadow-lift backdrop-blur-xl">
          <h1 className="text-2xl font-bold text-white">Admin sign in</h1>
          <p className="mt-2 text-sm text-ink-300">
            Authorised staff only. Every sign-in attempt is logged.
          </p>

          {passwordChanged ? (
            <div
              role="status"
              className="mt-6 rounded-xl border border-brand-700 bg-brand-950/50 px-4 py-3 text-sm font-medium text-brand-200"
            >
              Password changed. Please sign in with your new password.
            </div>
          ) : null}

          <div className="mt-7">
            <LoginForm next={next} failThreshold={LOGIN_FAIL_THRESHOLD} />
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-ink-400">
          {LOGIN_FAIL_THRESHOLD} incorrect attempts lock sign-in for one minute. Repeated failures
          extend the lockout.
        </p>

        <p className="mt-4 text-center text-sm">
          <Link href="/" className="text-ink-400 transition-colors hover:text-brand-300">
            ← Back to the website
          </Link>
        </p>
      </div>
    </div>
  );
}
