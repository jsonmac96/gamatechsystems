// @ts-check
/**
 * Shared database helper for the CLI scripts.
 *
 * Mirrors the connection rules in lib/db.ts and lib/env.ts — same
 * DATABASE_URL, same TLS decision — so a script can never end up talking to a
 * different database, or with weaker transport security, than the app does.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";
import pg from "pg";

const { Pool } = pg;

/** Load .env.local / .env so the scripts see the same settings as `next dev`. */
export function loadEnvFiles() {
  for (const name of [".env.local", ".env"]) {
    try {
      const text = readFileSync(join(process.cwd(), name), "utf8");
      for (const line of text.split(/\r?\n/)) {
        const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
        if (!match) continue;
        const [, key, rawValue] = match;
        if (!key || process.env[key] !== undefined) continue;
        // Strip one layer of matching quotes.
        const value = (rawValue ?? "").replace(/^(['"])(.*)\1$/, "$2");
        process.env[key] = value;
      }
    } catch {
      /* file not present — fine */
    }
  }
}

/** @param {string} url */
function requiresSsl(url) {
  const mode = /[?&]sslmode=([a-z-]+)/i.exec(url)?.[1]?.toLowerCase();
  if (mode === "disable" || mode === "no-verify") return false;
  try {
    const host = new URL(url).hostname.toLowerCase();
    if (host === "localhost" || host === "127.0.0.1" || host === "" || host === "::1") {
      return mode === "require" || mode === "verify-full";
    }
  } catch {
    /* fall through */
  }
  return true;
}

export function openPool() {
  loadEnvFiles();
  const url = (process.env.DATABASE_URL ?? "").trim();
  if (!url) {
    console.error(
      "\n✗ DATABASE_URL is not set.\n\n" +
        "  Put it in .env.local, or prefix the command, e.g.\n" +
        "    DATABASE_URL='postgres://…' npm run db:migrate\n",
    );
    process.exit(1);
  }
  if (!/^postgres(ql)?:\/\//.test(url)) {
    console.error("\n✗ DATABASE_URL must start with postgres:// or postgresql://\n");
    process.exit(1);
  }
  return new Pool({
    connectionString: url,
    max: 2,
    ssl: requiresSsl(url) ? { rejectUnauthorized: true } : undefined,
  });
}

/** @param {import("pg").Pool} pool */
export async function applySchema(pool) {
  const sql = readFileSync(join(process.cwd(), "lib", "schema.sql"), "utf8");
  await pool.query(sql);
}
