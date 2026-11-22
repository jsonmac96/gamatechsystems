import "server-only";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Pool, types } from "pg";
import { env } from "@/lib/env";
import { checkPasswordStrength, hashPassword } from "@/lib/password.mjs";

/**
 * PostgreSQL access layer.
 *
 * Uses `pg` (node-postgres), which talks to any PostgreSQL server — Neon,
 * Supabase, RDS or one on your laptop. It is pure JavaScript, so there is no
 * native module to compile at install time.
 *
 * On a serverless platform every invocation may open its own connection, so
 * point `DATABASE_URL` at a **pooled** endpoint. On Neon that is the host
 * containing `-pooler`; its built-in PgBouncer multiplexes those connections
 * and stops a busy site exhausting the database's connection limit.
 *
 * Rules enforced here and relied on by the rest of the app:
 *   - One pool per process, reused across requests (hot-reload safe).
 *   - Every query in this project is parameterised with `$1`-style
 *     placeholders. No SQL anywhere is built by concatenating user input,
 *     which is what makes injection structurally impossible rather than
 *     merely unlikely.
 *   - Timestamps are `timestamptz` and come back as JavaScript `Date`s.
 */

// `bigint` (OID 20) arrives as a string so precision is not lost. Every
// bigint this schema produces is a COUNT, which is always within safe integer
// range, so parse it to a number and keep the call sites simple.
types.setTypeParser(20, (value: string) => Number.parseInt(value, 10));

type Primitive = string | number | boolean | Date | null;

const globalForDb = globalThis as unknown as {
  __gamatechPool?: Pool;
  __gamatechMigrated?: Promise<void>;
};

function createPool(): Pool {
  if (!env.databaseUrl) {
    throw new Error(
      "DATABASE_URL is not set. Point it at a PostgreSQL database — see .env.example.",
    );
  }
  return new Pool({
    connectionString: pinVerifyFull(env.databaseUrl),
    // A small ceiling per instance: serverless invocations are short-lived and
    // the pooled endpoint multiplexes on the database side.
    max: 5,
    // Neon and most hosted providers require TLS. `rejectUnauthorized: false`
    // would silently accept any certificate, so verification stays on; set
    // `sslmode=require` (or `no-verify` locally) in the URL instead.
    ssl: env.databaseSsl ? { rejectUnauthorized: true } : undefined,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });
}

/**
 * Pin certificate verification in the connection string.
 *
 * Neon (and most hosts) hand out URLs ending `sslmode=require`. node-postgres 8
 * treats that as full verification, but warns that version 9 will adopt
 * libpq semantics, where `require` encrypts without checking the server
 * certificate. Rewriting it to `verify-full` keeps today's behaviour after any
 * future upgrade. `disable` and `no-verify` (local development) are left alone.
 */
function pinVerifyFull(url: string): string {
  return url.replace(/([?&]sslmode=)(require|prefer|verify-ca)(?=&|$)/i, "$1verify-full");
}

export function getPool(): Pool {
  if (!globalForDb.__gamatechPool) {
    globalForDb.__gamatechPool = createPool();
  }
  return globalForDb.__gamatechPool;
}

/**
 * Run a parameterised query and return the rows.
 *
 * `sql` is always a literal from this codebase; `params` carries every value
 * that came from a request.
 */
export async function query<T = Record<string, unknown>>(
  sql: string,
  params: readonly Primitive[] = [],
): Promise<T[]> {
  await ready();
  const result = await getPool().query(sql, params as Primitive[]);
  return result.rows as T[];
}

/** Run a query expected to match at most one row. */
export async function queryOne<T = Record<string, unknown>>(
  sql: string,
  params: readonly Primitive[] = [],
): Promise<T | undefined> {
  const rows = await query<T>(sql, params);
  return rows[0];
}

/** Run a statement and report how many rows it affected. */
export async function execute(
  sql: string,
  params: readonly Primitive[] = [],
): Promise<number> {
  await ready();
  const result = await getPool().query(sql, params as Primitive[]);
  return result.rowCount ?? 0;
}

/**
 * Apply `lib/schema.sql`. Idempotent, so it is safe to run on every boot.
 *
 * The schema lives in a `.sql` file rather than a string literal so the
 * migration script and the application share one definition. `next.config.ts`
 * lists it in `outputFileTracingIncludes` so it is always present in a
 * production deployment.
 */
export async function migrate(): Promise<void> {
  const schemaPath = join(/* turbopackIgnore: true */ process.cwd(), "lib", "schema.sql");
  const sql = readFileSync(schemaPath, "utf8");
  const pool = getPool();
  await pool.query(sql);
  await bootstrapAdmin(pool);
}

/**
 * Create the first admin account from ADMIN_BOOTSTRAP_USERNAME and
 * ADMIN_BOOTSTRAP_PASSWORD — but only when the admin table is completely
 * empty. Once any admin exists this is a no-op, so leftover variables can
 * never reset, replace or add an account.
 *
 * The account is flagged `must_change_pw`: the bootstrap password works for
 * exactly one sign-in before its owner has to choose their own.
 *
 * Uses the pool directly rather than `query()`, which waits on `ready()` and
 * would therefore wait on this very function.
 */
async function bootstrapAdmin(pool: Pool): Promise<void> {
  const { username, password } = env.bootstrapAdmin;
  if (!username || !password) return;

  const existing = await pool.query("SELECT 1 FROM admin_users LIMIT 1");
  if ((existing.rowCount ?? 0) > 0) return;

  // Same rules as the CLI. A bad value is skipped, not half-applied.
  if (!/^[a-z0-9][a-z0-9._-]{2,63}$/.test(username)) {
    console.warn("ADMIN_BOOTSTRAP_USERNAME is not a valid username; no admin was created.");
    return;
  }
  if (checkPasswordStrength(password, { username }).length > 0) {
    console.warn("ADMIN_BOOTSTRAP_PASSWORD does not meet the password policy; no admin was created.");
    return;
  }

  const hash = await hashPassword(password);
  // ON CONFLICT covers two cold-starting instances racing to create it.
  const inserted = await pool.query(
    `INSERT INTO admin_users
       (username, display_name, password_hash, must_change_pw, is_active, created_at, password_changed_at)
     VALUES ($1, $1, $2, true, true, now(), now())
     ON CONFLICT (username) DO NOTHING`,
    [username, hash],
  );
  if ((inserted.rowCount ?? 0) > 0) {
    await pool.query(
      `INSERT INTO audit_log (actor, action, target, detail, created_at)
       VALUES ('system', 'admin.bootstrapped', $1, '', now())`,
      [`user:${username}`],
    );
  }
}

/**
 * Ensure the schema exists before the first query of a process.
 *
 * `query` and `execute` call this themselves, so no caller can forget it.
 *
 * Cached as a promise so concurrent requests during a cold start wait on one
 * migration rather than racing several. In a serverless deployment the
 * migration should really be run once at deploy time (`npm run db:migrate`);
 * this is the safety net that stops a fresh environment 500-ing.
 */
export function ready(): Promise<void> {
  if (!globalForDb.__gamatechMigrated) {
    globalForDb.__gamatechMigrated = migrate().catch((error) => {
      // Let the next request retry rather than caching a failure forever.
      globalForDb.__gamatechMigrated = undefined;
      throw error;
    });
  }
  return globalForDb.__gamatechMigrated;
}

/** Current time as a `Date`, for passing into `timestamptz` columns. */
export function now(): Date {
  return new Date();
}

/** A `Date` `seconds` in the past — for "within the last N seconds" windows. */
export function secondsAgo(seconds: number): Date {
  return new Date(Date.now() - seconds * 1000);
}

/** A `Date` `seconds` in the future. */
export function secondsFromNow(seconds: number): Date {
  return new Date(Date.now() + seconds * 1000);
}

/** Append a row to the audit trail. Never pass raw IPs or secrets as `detail`. */
export async function audit(entry: {
  actor?: string;
  action: string;
  target?: string;
  detail?: string;
  ipHash?: string;
}): Promise<void> {
  try {
    await execute(
      `INSERT INTO audit_log (actor, action, target, detail, ip_hash, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        entry.actor ?? "system",
        entry.action,
        entry.target ?? "",
        (entry.detail ?? "").slice(0, 500),
        entry.ipHash ?? "",
        now(),
      ],
    );
  } catch {
    // Auditing must never break the request it is describing.
  }
}

/** Delete expired sessions and stale throttle rows. Cheap; safe to call often. */
export async function pruneExpired(): Promise<void> {
  try {
    await execute(`DELETE FROM sessions WHERE absolute_expires_at <= $1`, [now()]);
    await execute(`DELETE FROM login_attempts WHERE created_at <= $1`, [
      secondsAgo(60 * 60 * 24 * 7),
    ]);
    await execute(`DELETE FROM rate_events WHERE created_at <= $1`, [
      secondsAgo(60 * 60 * 24),
    ]);
  } catch {
    // Housekeeping is best-effort.
  }
}

/** Convert a `timestamptz` column to an ISO-8601 string for rendering. */
export function iso(value: Date | string | null | undefined): string {
  if (!value) return "";
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

/** Milliseconds since the epoch for a `timestamptz` column. */
export function ms(value: Date | string | null | undefined): number {
  if (!value) return 0;
  return value instanceof Date ? value.getTime() : Date.parse(value);
}
