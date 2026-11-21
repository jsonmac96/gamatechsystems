import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { logoutAction } from "@/app/actions/admin";
import Logo from "@/components/Logo";
import AdminNav from "@/components/admin/AdminNav";

/**
 * Admin layout.
 *
 * This renders the shell only. The authorisation decision is made by
 * `requireSession()` inside each admin page and each admin Server Action —
 * never here alone, and never in `proxy.ts`. A layout is not a security
 * boundary (it does not run before a Server Action, and a nested route could
 * be added without one), so the check lives where the data is actually
 * touched.
 */
export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | GamaTech Admin" },
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Read-only here: used to decide whether to draw the chrome. Pages still
  // enforce their own access.
  const session = await getSession();
  const pathname = (await headers()).get("x-invoke-path") ?? "";
  const isLoginRoute = pathname.startsWith("/admin/login");

  // The login page renders standalone, without the admin chrome.
  if (!session || isLoginRoute) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-dvh flex-col bg-ink-50 dark:bg-ink-950">
      <header className="sticky top-0 z-40 border-b border-ink-200 bg-white/90 backdrop-blur-xl dark:border-ink-800 dark:bg-ink-900/90">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-5 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center gap-2.5" aria-label="Admin dashboard">
              <Logo className="h-8 w-8" />
              <span className="hidden text-base font-bold tracking-tight text-ink-900 sm:inline dark:text-white">
                GamaTech<span className="text-brand-500"> Admin</span>
              </span>
            </Link>
          </div>

          <AdminNav />

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden text-sm font-medium text-ink-500 transition-colors hover:text-brand-700 sm:inline dark:text-ink-400 dark:hover:text-brand-300"
            >
              View site
            </Link>
            <Link
              href="/admin/account"
              className="hidden text-sm font-semibold text-ink-700 transition-colors hover:text-brand-700 sm:inline dark:text-ink-200 dark:hover:text-brand-300"
            >
              {session.displayName}
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-xl border border-ink-300 px-3.5 py-2 text-sm font-semibold text-ink-700 transition-colors hover:border-red-400 hover:text-red-600 dark:border-ink-700 dark:text-ink-200 dark:hover:border-red-700 dark:hover:text-red-400"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      {session.mustChangePassword ? (
        <div className="border-b border-accent-400 bg-accent-500/15 px-5 py-3 text-center text-sm font-semibold text-accent-700 dark:text-accent-400">
          Your password was set by an administrator.{" "}
          <Link href="/admin/account" className="underline underline-offset-2">
            Change it now
          </Link>
          .
        </div>
      ) : null}

      <main id="main" className="mx-auto w-full max-w-7xl flex-1 px-5 py-8 sm:px-6 sm:py-10">
        {children}
      </main>

      <footer className="border-t border-ink-200 py-6 dark:border-ink-800">
        <p className="mx-auto max-w-7xl px-5 text-xs text-ink-500 sm:px-6 dark:text-ink-400">
          GamaTech Systems admin · All actions are recorded in the audit log.
        </p>
      </footer>
    </div>
  );
}
