#!/usr/bin/env node
// @ts-check
/**
 * Apply the database schema.
 *
 *   npm run db:migrate
 *
 * `lib/schema.sql` is idempotent, so running this repeatedly is safe. The app
 * also applies it on its first query, but running it once at deploy time means
 * no visitor ever pays for that on a cold start.
 */

import process from "node:process";
import { applySchema, openPool } from "./db.mjs";

const pool = openPool();

try {
  await applySchema(pool);

  const { rows: tables } = await pool.query(
    `SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name`,
  );

  console.log("\n✓ Schema applied\n");
  console.log("Tables:");
  for (const { table_name: name } of tables) {
    // The name comes from the catalogue, never from user input; quote it anyway.
    const { rows } = await pool.query(`SELECT COUNT(*)::int AS n FROM "${String(name).replace(/"/g, '""')}"`);
    const n = rows[0]?.n ?? 0;
    console.log(`  · ${String(name).padEnd(16)} ${n} row${n === 1 ? "" : "s"}`);
  }

  const { rows: admins } = await pool.query(`SELECT COUNT(*)::int AS n FROM admin_users`);
  if ((admins[0]?.n ?? 0) === 0) {
    console.log("\nNo admin account exists yet. Create one with:\n\n  npm run admin:create\n");
  } else {
    console.log("");
  }
} catch (error) {
  console.error("\n✗ Migration failed:", error instanceof Error ? error.message : error, "\n");
  process.exitCode = 1;
} finally {
  await pool.end();
}
