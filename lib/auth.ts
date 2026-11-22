import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  audit,
  execute,
  ms,
  now,
  pruneExpired,
  queryOne,
  ready,
  secondsFromNow,
} from "@/lib/db";
import { env } from "@/lib/env";
import { keyedHash, randomToken } from "@/lib/crypto";
import { getClientContext } from "@/lib/request-context";
import {
  checkLoginThrottle,
  clearLoginFailures,
  formatCooldown,
  recordLoginAttempt,
} from "@/lib/rate-limit";
import { hashPassword, needsRehash, verifyPassword } from "@/lib/password.mjs";

/**
 * Session-based admin authentication.
 *
 * Design notes:
 *  - The cookie carries a 32-byte random token. The database stores only an
 *    HMAC of it, so a stolen database cannot be turned into a live session.
 *  - Cookies are HttpOnly (no JavaScript access, so XSS cannot read them),
 *    SameSite=Strict (so no cross-site request carries them, which is CSRF
 *    protection at the transport level) and Secure whenever the site is HTTPS.
 *  - Sessions have both an absolute lifetime (8 hours) and an idle timeout
 *    (2 hours), and are revoked server-side on logout.
 *  - Every admin page and action calls `requireSession()`. Authorisation is
 *    never left to middleware alone, which can be bypassed at the edge.
 */

const COOKIE_NAME = "gts_session";
const ABSOLUTE_LIFETIME_SECONDS = 60 * 60 * 8; // 8 hours
const IDLE_TIMEOUT_SECONDS = 60 * 60 * 2; // 2 hours

export type AdminSession = {
  userId: number;
  username: string;
  displayName: string;
  mustChangePassword: boolean;
};

type UserRow = {
  id: number;
  username: string;
  display_name: string;
  password_hash: string;
  must_change_pw: boolean;
  is_active: boolean;
};

type SessionRow = {
  token_hash: string;
  user_id: number;
  last_seen_at: Date;
  absolute_expires_at: Date;
  username: string;
  display_name: string;
  must_change_pw: boolean;
  is_active: boolean;
};

const tokenHash = (token: string) => keyedHash("session", token);

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------

export type LoginOutcome =
  | { ok: true }
  | { ok: false; message: string; retryAfterSeconds?: number };

/**
 * Attempt a login. On success a session cookie is set as a side effect.
 *
 * The failure message is deliberately identical for "unknown user", "wrong
 * password" and "disabled account" so the form cannot be used to enumerate
 * which usernames exist.
 */
export async function login(
  usernameRaw: string,
  password: string,
): Promise<LoginOutcome> {
  await ready();
  const username = normaliseUsername(usernameRaw);
  const { ipHash, uaHash } = await getClientContext();

  const GENERIC_FAILURE = "Incorrect username or password.";

  // 1. Throttle first, before touching the password at all.
  const throttle = await checkLoginThrottle(username, ipHash);
  if (throttle.locked) {
    await audit({
      actor: username || "unknown",
      action: "login.locked_out",
      detail: `cooldown ${throttle.retryAfterSeconds}s after ${throttle.failuresSoFar} failures`,
      ipHash,
    });
    return {
      ok: false,
      retryAfterSeconds: throttle.retryAfterSeconds,
      message: `Too many failed attempts. Try again in ${formatCooldown(
        throttle.retryAfterSeconds,
      )}.`,
    };
  }

  // 2. Basic shape checks. Still counted as attempts so blank-form spam throttles.
  if (!username || typeof password !== "string" || password.length === 0) {
    await recordLoginAttempt(username, ipHash, false);
    return { ok: false, message: GENERIC_FAILURE };
  }

  const user = await queryOne<UserRow>(
    `SELECT id, username, display_name, password_hash, must_change_pw, is_active
       FROM admin_users WHERE username = $1`,
    [username],
  );

  // 3. Verify. When the user does not exist, verify against a dummy hash so
  //    the request takes the same amount of time either way.
  const storedHash = user?.password_hash ?? "scrypt$131072$8$1$AAAAAAAAAAAAAAAAAAAAAA$AAAA";
  const passwordOk = await verifyPassword(password, storedHash);

  if (!user || !passwordOk || !user.is_active) {
    await recordLoginAttempt(username, ipHash, false);
    const after = await checkLoginThrottle(username, ipHash);
    await audit({
      actor: username,
      action: "login.failed",
      detail: user ? "bad password or inactive account" : "unknown username",
      ipHash,
    });
    if (after.locked) {
      return {
        ok: false,
        retryAfterSeconds: after.retryAfterSeconds,
        message: `Too many failed attempts. Try again in ${formatCooldown(
          after.retryAfterSeconds,
        )}.`,
      };
    }
    const left = after.remainingAttempts;
    return {
      ok: false,
      message:
        left > 0 && left < 3
          ? `${GENERIC_FAILURE} ${left} attempt${left === 1 ? "" : "s"} left before a 1-minute lock.`
          : GENERIC_FAILURE,
    };
  }

  // 4. Success: clear failures, rotate the stored hash if policy has tightened,
  //    and issue a fresh session (preventing session fixation).
  await recordLoginAttempt(username, ipHash, true);
  await clearLoginFailures(username, ipHash);

  if (needsRehash(user.password_hash)) {
    try {
      const upgraded = await hashPassword(password);
      await execute(
        `UPDATE admin_users SET password_hash = $1, password_changed_at = $2 WHERE id = $3`,
        [upgraded, now(), user.id],
      );
    } catch {
      /* a failed upgrade must not block a valid login */
    }
  }

  await execute(`UPDATE admin_users SET last_login_at = $1 WHERE id = $2`, [now(), user.id]);

  // Invalidate any other sessions for this account, so a stolen cookie dies
  // the moment the real owner signs in again.
  await execute(`DELETE FROM sessions WHERE user_id = $1`, [user.id]);

  const token = randomToken(32);
  const issuedAt = now();
  await execute(
    `INSERT INTO sessions
       (token_hash, user_id, created_at, last_seen_at, absolute_expires_at, ip_hash, user_agent_hash)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      tokenHash(token),
      user.id,
      issuedAt,
      issuedAt,
      secondsFromNow(ABSOLUTE_LIFETIME_SECONDS),
      ipHash,
      uaHash,
    ],
  );

  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.useSecureCookies,
    sameSite: "strict",
    path: "/",
    maxAge: ABSOLUTE_LIFETIME_SECONDS,
  });

  await audit({ actor: username, action: "login.success", ipHash });
  await pruneExpired();

  return { ok: true };
}

// ---------------------------------------------------------------------------
// Session lookup
// ---------------------------------------------------------------------------

/** Resolve the current session, or `null` when not signed in. */
export async function getSession(): Promise<AdminSession | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token || token.length < 20 || token.length > 128) return null;

  await ready();

  const row = await queryOne<SessionRow>(
    `SELECT s.token_hash, s.user_id, s.last_seen_at, s.absolute_expires_at,
            u.username, u.display_name, u.must_change_pw, u.is_active
       FROM sessions s
       JOIN admin_users u ON u.id = s.user_id
      WHERE s.token_hash = $1`,
    [tokenHash(token)],
  );

  if (!row) return null;

  const current = Date.now();
  const absoluteExpired = ms(row.absolute_expires_at) <= current;
  const idleExpired = ms(row.last_seen_at) + IDLE_TIMEOUT_SECONDS * 1000 <= current;

  if (absoluteExpired || idleExpired || !row.is_active) {
    await execute(`DELETE FROM sessions WHERE token_hash = $1`, [row.token_hash]);
    return null;
  }

  // Sliding idle window: touch the session, but never past its absolute expiry.
  await execute(`UPDATE sessions SET last_seen_at = $1 WHERE token_hash = $2`, [
    now(),
    row.token_hash,
  ]);

  return {
    userId: row.user_id,
    username: row.username,
    displayName: row.display_name || row.username,
    mustChangePassword: row.must_change_pw,
  };
}

/**
 * Require a signed-in admin, or redirect to the login screen.
 *
 * Called by every admin page and every admin Server Action — authorisation is
 * checked at the point of use, not inferred from how the request was routed.
 */
export async function requireSession(returnTo?: string): Promise<AdminSession> {
  const session = await getSession();
  if (!session) {
    const target = sanitiseReturnTo(returnTo);
    redirect(target ? `/admin/login?next=${encodeURIComponent(target)}` : "/admin/login");
  }
  return session;
}

// ---------------------------------------------------------------------------
// Logout
// ---------------------------------------------------------------------------

export async function logout(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;

  if (token) {
    try {
      await execute(`DELETE FROM sessions WHERE token_hash = $1`, [tokenHash(token)]);
    } catch {
      /* already gone */
    }
  }

  jar.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: env.useSecureCookies,
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
}

// ---------------------------------------------------------------------------
// Password change
// ---------------------------------------------------------------------------

export async function changePassword(
  userId: number,
  currentPassword: string,
  newPassword: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const row = await queryOne<Pick<UserRow, "id" | "username" | "password_hash">>(
    `SELECT id, username, password_hash FROM admin_users WHERE id = $1`,
    [userId],
  );

  if (!row) return { ok: false, message: "Account not found." };

  const ok = await verifyPassword(currentPassword, row.password_hash);
  if (!ok) {
    const { ipHash } = await getClientContext();
    await audit({ actor: row.username, action: "password.change_failed", ipHash });
    return { ok: false, message: "Your current password is incorrect." };
  }

  const hash = await hashPassword(newPassword);
  await execute(
    `UPDATE admin_users
        SET password_hash = $1, password_changed_at = $2, must_change_pw = false
      WHERE id = $3`,
    [hash, now(), userId],
  );

  // Force every session to re-authenticate with the new credentials.
  await execute(`DELETE FROM sessions WHERE user_id = $1`, [userId]);

  const { ipHash } = await getClientContext();
  await audit({ actor: row.username, action: "password.changed", ipHash });
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function normaliseUsername(raw: unknown): string {
  if (typeof raw !== "string") return "";
  return raw.trim().toLowerCase().normalize("NFKC").slice(0, 64);
}

/**
 * Only allow redirects back to our own admin area. Without this check,
 * `?next=https://evil.example` would turn the login page into an open redirect.
 */
export function sanitiseReturnTo(value: string | undefined | null): string | null {
  if (!value) return null;
  if (!value.startsWith("/admin")) return null;
  if (value.startsWith("//") || value.includes("\\")) return null;
  if (/[\r\n\t<>"']/.test(value)) return null;
  if (value.length > 200) return null;
  return value;
}
