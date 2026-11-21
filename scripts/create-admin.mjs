#!/usr/bin/env node
// @ts-check
/**
 * Create or update a GamaTech Systems admin account.
 *
 *   npm run admin:create
 *
 * The password is read from an interactive prompt with echo switched off, so
 * it never appears in your shell history, in `ps` output, or in a CI log.
 * Passing a password as a command-line argument is deliberately not supported
 * for that reason.
 *
 * For unattended setup, set ADMIN_USERNAME and ADMIN_PASSWORD in the
 * environment instead — but prefer the prompt when a human is present.
 */

import { createInterface } from "node:readline";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, isAbsolute, join } from "node:path";
import process from "node:process";
import Database from "better-sqlite3";
import {
  checkPasswordStrength,
  hashPassword,
  PASSWORD_POLICY,
} from "../lib/password.mjs";

const projectRoot = process.cwd();

function resolveDbPath() {
  const configured = (process.env.DATABASE_PATH ?? "./data/gamatech.db").trim();
  return isAbsolute(configured) ? configured : join(projectRoot, configured);
}

function openDb() {
  const file = resolveDbPath();
  const dir = dirname(file);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true, mode: 0o700 });

  const db = new Database(file);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  // Apply the schema; it is idempotent.
  db.exec(readFileSync(join(projectRoot, "lib", "schema.sql"), "utf8"));
  return db;
}

/** Read a line of input, optionally with echo suppressed. */
function prompt(question, { silent = false } = {}) {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });

    if (silent && process.stdin.isTTY) {
      // Suppress echo by intercepting the output stream's writes.
      const output = /** @type {any} */ (rl).output;
      /** @type {any} */ (rl)._writeToOutput = function (chunk) {
        if (chunk.includes(question)) output.write(question);
      };
    }

    rl.question(question, (answer) => {
      if (silent) process.stdout.write("\n");
      rl.close();
      resolve(answer);
    });
  });
}

function normaliseUsername(raw) {
  return String(raw ?? "").trim().toLowerCase().normalize("NFKC").slice(0, 64);
}

function validUsername(username) {
  return /^[a-z0-9][a-z0-9._-]{2,63}$/.test(username);
}

async function main() {
  console.log("\nGamaTech Systems — create admin account");
  console.log("=======================================\n");

  const db = openDb();

  // ---- username ----------------------------------------------------------
  let username = normaliseUsername(process.env.ADMIN_USERNAME);
  if (!username) {
    username = normaliseUsername(await prompt("Username: "));
  }
  if (!validUsername(username)) {
    console.error(
      "\n✗ Invalid username. Use 3–64 characters: lowercase letters, numbers, dot, underscore or hyphen, starting with a letter or number.\n",
    );
    process.exit(1);
  }

  const existing = db
    .prepare("SELECT id, username FROM admin_users WHERE username = ?")
    .get(username);

  if (existing) {
    const confirm = (await prompt(`Account "${username}" exists. Reset its password? [y/N] `))
      .trim()
      .toLowerCase();
    if (confirm !== "y" && confirm !== "yes") {
      console.log("\nCancelled. No changes made.\n");
      process.exit(0);
    }
  }

  // ---- display name ------------------------------------------------------
  let displayName = String(process.env.ADMIN_DISPLAY_NAME ?? "").trim().slice(0, 80);
  if (!displayName && !process.env.ADMIN_PASSWORD) {
    displayName = (await prompt(`Display name [${username}]: `)).trim().slice(0, 80);
  }
  if (!displayName) displayName = username;

  // ---- password ----------------------------------------------------------
  let password = process.env.ADMIN_PASSWORD ?? "";
  let fromEnv = password.length > 0;

  if (!fromEnv) {
    console.log(
      `\nPassword requirements: at least ${PASSWORD_POLICY.minLength} characters, mixing at least`,
    );
    console.log("three of lowercase, uppercase, numbers and symbols. Input is hidden.\n");

    password = await prompt("Password: ", { silent: true });
    const again = await prompt("Confirm password: ", { silent: true });

    if (password !== again) {
      console.error("\n✗ Passwords did not match. Nothing was changed.\n");
      process.exit(1);
    }
  }

  const problems = checkPasswordStrength(password, { username });
  if (problems.length > 0) {
    console.error("\n✗ Password rejected:");
    for (const problem of problems) console.error(`  · ${problem}`);
    console.error("");
    process.exit(1);
  }

  // ---- write -------------------------------------------------------------
  process.stdout.write("Hashing password (this takes a moment by design)… ");
  const hash = await hashPassword(password);
  console.log("done.");

  const now = new Date().toISOString();

  if (existing) {
    db.prepare(
      `UPDATE admin_users
          SET password_hash = ?, display_name = ?, password_changed_at = ?,
              must_change_pw = ?, is_active = 1
        WHERE id = ?`,
    ).run(hash, displayName, now, fromEnv ? 1 : 0, existing.id);

    // A password reset must invalidate every existing session.
    db.prepare("DELETE FROM sessions WHERE user_id = ?").run(existing.id);
    db.prepare("DELETE FROM login_attempts WHERE username = ?").run(username);

    console.log(`\n✓ Password reset for "${username}". All sessions were signed out.\n`);
  } else {
    db.prepare(
      `INSERT INTO admin_users
         (username, display_name, password_hash, must_change_pw, is_active,
          created_at, password_changed_at)
       VALUES (?, ?, ?, ?, 1, ?, ?)`,
    ).run(username, displayName, hash, fromEnv ? 1 : 0, now, now);

    console.log(`\n✓ Admin account "${username}" created.\n`);
  }

  db.prepare(
    `INSERT INTO audit_log (actor, action, target, detail, created_at)
     VALUES (?, ?, ?, ?, ?)`,
  ).run("cli", existing ? "admin.password_reset" : "admin.created", `user:${username}`, "", now);

  if (fromEnv) {
    console.log(
      "Note: the password came from ADMIN_PASSWORD, so the account is flagged to require a",
    );
    console.log("password change at first sign-in. Unset that variable now.\n");
  }

  console.log("Sign in at /admin/login\n");
  db.close();
}

main().catch((error) => {
  console.error("\n✗ Failed:", error instanceof Error ? error.message : error, "\n");
  process.exit(1);
});
