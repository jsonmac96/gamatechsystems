import type { Metadata } from "next";
import { requireSession } from "@/lib/auth";
import { ms, queryOne } from "@/lib/db";
import { PASSWORD_POLICY } from "@/lib/password.mjs";
import ChangePasswordForm from "@/components/admin/ChangePasswordForm";

export const metadata: Metadata = {
  title: "Your account",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type UserMeta = {
  username: string;
  display_name: string;
  created_at: Date;
  password_changed_at: Date;
  last_login_at: Date | null;
};

export default async function AccountPage() {
  const session = await requireSession("/admin/account", { allowPendingPasswordChange: true });

  const [user, sessionRow] = await Promise.all([
    queryOne<UserMeta>(
      `SELECT username, display_name, created_at, password_changed_at, last_login_at
         FROM admin_users WHERE id = $1`,
      [session.userId],
    ),
    queryOne<{ n: number }>(
      `SELECT COUNT(*)::bigint AS n FROM sessions WHERE user_id = $1`,
      [session.userId],
    ),
  ]);
  const sessionCount = sessionRow?.n ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl dark:text-white">
          Your account
        </h1>
        <p className="mt-1.5 text-ink-600 dark:text-ink-300">
          Signed in as <span className="font-semibold">{session.username}</span>
        </p>
      </div>

      {session.mustChangePassword ? (
        <div
          role="alert"
          className="rounded-xl border border-accent-400 bg-accent-500/15 px-4 py-3 text-sm font-semibold text-accent-700 dark:text-accent-400"
        >
          This password was set by an administrator. Please change it now so you are the only
          person who knows it.
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-5">
        <section className="admin-card p-6 lg:col-span-3" aria-labelledby="password-heading">
          <h2 id="password-heading" className="text-lg font-bold text-ink-900 dark:text-white">
            Change password
          </h2>
          <p className="mt-1.5 text-sm text-ink-600 dark:text-ink-300">
            Changing your password signs out every device, including this one.
          </p>

          <div className="mt-6">
            <ChangePasswordForm minLength={PASSWORD_POLICY.minLength} />
          </div>
        </section>

        <section className="admin-card p-6 lg:col-span-2" aria-labelledby="details-heading">
          <h2 id="details-heading" className="text-sm font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400">
            Account details
          </h2>
          <dl className="mt-5 space-y-4 text-sm">
            <Row label="Username">{user?.username ?? session.username}</Row>
            <Row label="Display name">{user?.display_name || "—"}</Row>
            <Row label="Account created">{formatDate(user?.created_at)}</Row>
            <Row label="Password last changed">{formatDate(user?.password_changed_at)}</Row>
            <Row label="Last sign-in">{formatDate(user?.last_login_at)}</Row>
            <Row label="Active sessions">{sessionCount}</Row>
          </dl>

          <div className="mt-6 rounded-xl bg-ink-50 p-4 dark:bg-ink-950/60">
            <h3 className="text-sm font-semibold text-ink-900 dark:text-white">
              How this account is protected
            </h3>
            <ul className="mt-2.5 space-y-1.5 text-xs leading-relaxed text-ink-600 dark:text-ink-300">
              <li>Password stored as a salted scrypt hash, never in plain text.</li>
              <li>Three wrong attempts lock sign-in for one minute; repeats extend it.</li>
              <li>Session cookie is HttpOnly, Secure and SameSite=Strict.</li>
              <li>Sessions expire after 8 hours, or 2 hours of inactivity.</li>
              <li>Signing in elsewhere ends all other sessions.</li>
              <li>Every administrative action is written to the audit log.</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-ink-200 pb-3 last:border-0 last:pb-0 dark:border-ink-800">
      <dt className="text-ink-500 dark:text-ink-400">{label}</dt>
      <dd className="text-right font-medium text-ink-900 dark:text-white">{children}</dd>
    </div>
  );
}

function formatDate(input: Date | string | null | undefined): string {
  if (!input) return "—";
  const value = ms(input);
  if (!Number.isFinite(value) || value === 0) return "—";
  return new Date(value).toLocaleString("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Manila",
  });
}
