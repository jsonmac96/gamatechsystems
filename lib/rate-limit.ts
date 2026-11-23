import "server-only";
import { execute, ms, now, query, queryOne, secondsAgo } from "@/lib/db";

/**
 * Throttling.
 *
 * Two mechanisms live here:
 *
 *  1. `checkLoginThrottle` / `recordLoginAttempt` — the admin login lockout.
 *     Three consecutive wrong credentials trigger a 60-second cooldown, as
 *     specified. Because a patient attacker would otherwise just wait out each
 *     minute, the cooldown escalates for continued failures (1 min, then 5,
 *     15, 60) and resets completely on a successful login.
 *
 *  2. `consumeRateLimit` — a generic sliding-window counter used by the public
 *     lead form so one client cannot flood the inbox.
 *
 * State lives in the database rather than in process memory, so limits survive
 * a restart and hold across every serverless instance at once — which is the
 * whole point on a platform that may run dozens of them.
 */

// ---------------------------------------------------------------------------
// Login lockout
// ---------------------------------------------------------------------------

/** Failures required before the first lockout. */
export const LOGIN_FAIL_THRESHOLD = 3;

/**
 * Cooldown ladder in seconds, indexed by how many thresholds have been crossed.
 * 3 failures -> 60s, 6 -> 5 min, 9 -> 15 min, 12+ -> 60 min.
 */
const LOCKOUT_LADDER_SECONDS = [60, 300, 900, 3600] as const;

/** Failures older than this are forgotten, so an honest typo does not haunt you. */
const FAILURE_MEMORY_SECONDS = 60 * 30;

export type ThrottleState =
  | { locked: false; failuresSoFar: number; remainingAttempts: number }
  | { locked: true; retryAfterSeconds: number; failuresSoFar: number };

type AttemptRow = { succeeded: boolean; created_at: Date };

/**
 * Current lockout state for an account + source address pair.
 *
 * Evaluated for the username and the IP independently; whichever is more
 * restrictive wins. That stops both "hammer one account from everywhere" and
 * "spray many usernames from one host".
 */
export async function checkLoginThrottle(
  username: string,
  ipHash: string,
): Promise<ThrottleState> {
  const [byUser, byIp] = await Promise.all([
    evaluate("username", username),
    evaluate("ip_hash", ipHash),
  ]);

  if (byUser.locked || byIp.locked) {
    const retryAfterSeconds = Math.max(
      byUser.locked ? byUser.retryAfterSeconds : 0,
      byIp.locked ? byIp.retryAfterSeconds : 0,
    );
    return {
      locked: true,
      retryAfterSeconds,
      failuresSoFar: Math.max(byUser.failuresSoFar, byIp.failuresSoFar),
    };
  }

  const failures = Math.max(byUser.failuresSoFar, byIp.failuresSoFar);
  return {
    locked: false,
    failuresSoFar: failures,
    remainingAttempts: Math.max(0, LOGIN_FAIL_THRESHOLD - (failures % LOGIN_FAIL_THRESHOLD)),
  };
}

async function evaluate(
  column: "username" | "ip_hash",
  value: string,
): Promise<ThrottleState> {
  if (!value) {
    return { locked: false, failuresSoFar: 0, remainingAttempts: LOGIN_FAIL_THRESHOLD };
  }

  // The column name is a literal from this module's own union type, never from
  // user input; the *value* is always bound as a parameter.
  const sql =
    column === "username"
      ? `SELECT succeeded, created_at FROM login_attempts
           WHERE username = $1 AND created_at > $2
           ORDER BY created_at DESC LIMIT 50`
      : `SELECT succeeded, created_at FROM login_attempts
           WHERE ip_hash = $1 AND created_at > $2
           ORDER BY created_at DESC LIMIT 50`;

  const rows = await query<AttemptRow>(sql, [value, secondsAgo(FAILURE_MEMORY_SECONDS)]);

  // Count the unbroken run of failures since the most recent success.
  let failures = 0;
  let newestFailureAt: number | null = null;
  for (const row of rows) {
    if (row.succeeded) break;
    failures += 1;
    if (newestFailureAt === null) newestFailureAt = ms(row.created_at);
  }

  if (failures < LOGIN_FAIL_THRESHOLD || newestFailureAt === null) {
    return {
      locked: false,
      failuresSoFar: failures,
      remainingAttempts: Math.max(0, LOGIN_FAIL_THRESHOLD - failures),
    };
  }

  const tier = Math.min(
    Math.floor(failures / LOGIN_FAIL_THRESHOLD) - 1,
    LOCKOUT_LADDER_SECONDS.length - 1,
  );
  const cooldown = LOCKOUT_LADDER_SECONDS[tier] ?? 60;
  const remainingMs = newestFailureAt + cooldown * 1000 - Date.now();

  if (remainingMs <= 0) {
    // Cooldown served. Allow another try without wiping history, so the next
    // failure escalates to the following rung of the ladder.
    return { locked: false, failuresSoFar: failures, remainingAttempts: 1 };
  }

  return {
    locked: true,
    retryAfterSeconds: Math.max(1, Math.ceil(remainingMs / 1000)),
    failuresSoFar: failures,
  };
}

/** Record the outcome of a login attempt. */
export async function recordLoginAttempt(
  username: string,
  ipHash: string,
  succeeded: boolean,
): Promise<void> {
  await execute(
    `INSERT INTO login_attempts (username, ip_hash, succeeded, created_at)
     VALUES ($1, $2, $3, $4)`,
    [username.slice(0, 120), ipHash, succeeded, now()],
  );
}

/** Clear a user's failure history after a successful login. */
export async function clearLoginFailures(username: string, ipHash: string): Promise<void> {
  await execute(`DELETE FROM login_attempts WHERE username = $1 AND succeeded = false`, [
    username.slice(0, 120),
  ]);
  if (ipHash) {
    await execute(`DELETE FROM login_attempts WHERE ip_hash = $1 AND succeeded = false`, [
      ipHash,
    ]);
  }
}

// ---------------------------------------------------------------------------
// Generic sliding-window limiter
// ---------------------------------------------------------------------------

export type RateLimitResult =
  | { allowed: true; remaining: number }
  | { allowed: false; retryAfterSeconds: number };

/**
 * Count one event against `bucket` and report whether it is within budget.
 *
 * @param bucket     a stable key, e.g. `lead:<ipHash>`
 * @param limit      maximum events allowed in the window
 * @param windowSecs length of the sliding window in seconds
 */
export async function consumeRateLimit(
  bucket: string,
  limit: number,
  windowSecs: number,
): Promise<RateLimitResult> {
  const since = secondsAgo(windowSecs);
  const key = bucket.slice(0, 160);

  const row = await queryOne<{ n: number; oldest: Date | null }>(
    `SELECT COUNT(*)::bigint AS n, MIN(created_at) AS oldest
       FROM rate_events WHERE bucket = $1 AND created_at > $2`,
    [key, since],
  );

  const count = row?.n ?? 0;
  if (count >= limit) {
    const oldestMs = row?.oldest ? ms(row.oldest) : Date.now();
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((oldestMs + windowSecs * 1000 - Date.now()) / 1000),
    );
    return { allowed: false, retryAfterSeconds };
  }

  await execute(`INSERT INTO rate_events (bucket, created_at) VALUES ($1, $2)`, [key, now()]);
  return { allowed: true, remaining: Math.max(0, limit - count - 1) };
}

/** Human-friendly rendering of a cooldown, e.g. "58 seconds" or "4 minutes". */
export function formatCooldown(seconds: number): string {
  if (seconds < 60) return `${seconds} second${seconds === 1 ? "" : "s"}`;
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} minute${minutes === 1 ? "" : "s"}`;
}
