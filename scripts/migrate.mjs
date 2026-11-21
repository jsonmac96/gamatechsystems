#!/usr/bin/env node
// @ts-check
/**
 * Apply the database schema.
 *
 *   npm run db:migrate
 *
 * `lib/schema.sql` is written to be idempotent, so running this repeatedly is
 * safe. The application also applies it on first boot; this script exists so a
 * deployment can create the database before serving any traffic.
 */

import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, isAbsolute, join } from "node:path";
import process from "node:process";
import Database from "better-sqlite3";

const projectRoot = process.cwd();
const configured = (process.env.DATABASE_PATH ?? "./data/gamatech.db").trim();
const file = isAbsolute(configured) ? configured : join(projectRoot, configured);

const dir = dirname(file);
if (!existsSync(dir)) {
  mkdirSync(dir, { recursive: true, mode: 0o700 });
  console.log(`Created ${dir}`);
}

const db = new Database(file);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

const schema = readFileSync(join(projectRoot, "lib", "schema.sql"), "utf8");
db.exec(schema);

const tables = /** @type {{name: string}[]} */ (
  db
    .prepare(
      `SELECT name FROM sqlite_master
        WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
        ORDER BY name`,
    )
    .all()
);

console.log(`\n✓ Schema applied to ${file}\n`);
console.log("Tables:");
for (const table of tables) {
  const count = /** @type {{n: number}} */ (
    db.prepare(`SELECT COUNT(*) AS n FROM "${table.name}"`).get()
  ).n;
  console.log(`  · ${table.name.padEnd(16)} ${count} row${count === 1 ? "" : "s"}`);
}

const admins = /** @type {{n: number}} */ (
  db.prepare("SELECT COUNT(*) AS n FROM admin_users").get()
).n;

if (admins === 0) {
  console.log("\nNo admin account exists yet. Create one with:\n\n  npm run admin:create\n");
} else {
  console.log("");
}

db.close();
