import "server-only";
import Database from "better-sqlite3";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, isAbsolute, join } from "node:path";
import { env } from "@/lib/env";

/**
 * SQLite access layer.
 *
 * Rules enforced here and relied on by the rest of the app:
 *   - One connection per process, reused across requests (Next.js hot-reload safe).
 *   - WAL journaling so reads never block the lead form writing a new row.
 *   - Foreign keys ON, so cascade deletes actually cascade.
 *   - Every query in this project is a *prepared, parameterised* statement.
 *     No SQL string anywhere is built by concatenating user input, which is
 *     what makes SQL injection structurally impossible rather than merely
 *     unlikely.
 */

type Db = Database.Database;

function resolveDbPath(): string {
  const configured = env.databasePath;
  // Runtime-only path to a data file. The bundler is told not to trace it,
  // otherwise it would try to include the whole project directory in the
  // server output.
  return isAbsolute(configured)
    ? configured
    : join(/* turbopackIgnore: true */ process.cwd(), configured);
}

function openDatabase(): Db {
  const file = resolveDbPath();
  const dir = dirname(file);
  if (!existsSync(dir)) {
    // 0o700: only the service user may read the database directory.
    mkdirSync(dir, { recursive: true, mode: 0o700 });
  }

  const db = new Database(file);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.pragma("busy_timeout = 5000");
  db.pragma("synchronous = NORMAL");
  // Defence in depth: refuse to load SQLite extensions at runtime.
  try {
    db.loadExtension = (() => {
      throw new Error("Loading SQLite extensions is disabled.");
    }) as Db["loadExtension"];
  } catch {
    /* property not configurable on this build — not fatal */
  }
  return db;
}

/**
 * Apply `lib/schema.sql`. Idempotent, so it is safe to run on every boot.
 *
 * The schema lives in a `.sql` file rather than a string literal so the
 * migration script and the application share one definition. `next.config.ts`
 * lists it in `outputFileTracingIncludes` so it is always present in a
 * production deployment.
 */
export function migrate(db: Db = getDb()): void {
  const schemaPath = join(/* turbopackIgnore: true */ process.cwd(), "lib", "schema.sql");
  const sql = readFileSync(schemaPath, "utf8");
  db.exec(sql);
}

// Next.js reloads modules in development; cache the handle on globalThis so we
// do not leak a file handle per edit.
const globalForDb = globalThis as unknown as {
  __gamatechDb?: Db;
  __gamatechMigrated?: boolean;
};

export function getDb(): Db {
  if (!globalForDb.__gamatechDb) {
    globalForDb.__gamatechDb = openDatabase();
  }
  const db = globalForDb.__gamatechDb;
  if (!globalForDb.__gamatechMigrated) {
    globalForDb.__gamatechMigrated = true;
    migrate(db);
  }
  return db;
}

/** ISO-8601 timestamp in UTC, the single time format used across the schema. */
export function nowIso(): string {
  return new Date().toISOString();
}

/** ISO timestamp `seconds` in the past — for "within the last N seconds" windows. */
export function isoSecondsAgo(seconds: number): string {
  return new Date(Date.now() - seconds * 1000).toISOString();
}

/** ISO timestamp `seconds` in the future. */
export function isoSecondsFromNow(seconds: number): string {
  return new Date(Date.now() + seconds * 1000).toISOString();
}

/** Append a row to the audit trail. Never pass raw IPs or secrets as `detail`. */
export function audit(entry: {
  actor?: string;
  action: string;
  target?: string;
  detail?: string;
  ipHash?: string;
}): void {
  try {
    getDb()
      .prepare(
        `INSERT INTO audit_log (actor, action, target, detail, ip_hash, created_at)
         VALUES (@actor, @action, @target, @detail, @ipHash, @createdAt)`,
      )
      .run({
        actor: entry.actor ?? "system",
        action: entry.action,
        target: entry.target ?? "",
        detail: (entry.detail ?? "").slice(0, 500),
        ipHash: entry.ipHash ?? "",
        createdAt: nowIso(),
      });
  } catch {
    // Auditing must never break the request it is describing.
  }
}

/** Delete expired sessions and stale throttle rows. Cheap; safe to call often. */
export function pruneExpired(): void {
  const db = getDb();
  const now = nowIso();
  try {
    db.prepare(`DELETE FROM sessions WHERE absolute_expires_at <= ?`).run(now);
    db.prepare(`DELETE FROM login_attempts WHERE created_at <= ?`).run(
      isoSecondsAgo(60 * 60 * 24 * 7),
    );
    db.prepare(`DELETE FROM rate_events WHERE created_at <= ?`).run(
      isoSecondsAgo(60 * 60 * 24),
    );
  } catch {
    /* housekeeping is best-effort */
  }
}
