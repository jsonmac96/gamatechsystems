#!/usr/bin/env node
// @ts-check
/**
 * Create or update a GaMatech Systems admin account.
 *
 *   npm run admin:create
 *
 * The password is read from an interactive prompt with echo switched off, so
 * it never appears in your shell history, in `ps` output, or in a CI log.
 * Passing a password as a command-line argument is deliberately not supported
 * for that reason.
 *
 * For unattended setup, set ADMIN_USERNAME and ADMIN_PASSWORD in the
 * environment instead — the account is then flagged to require a password
 * change at first sign-in. Prefer the prompt when a human is present.
 */

import { createInterface } from "node:readline";
import process from "node:process";
import { applySchema, openPool } from "./db.mjs";
import {
  checkPasswordStrength,
  hashPassword,
  PASSWORD_POLICY,
} from "../lib/password.mjs";

/**
 * Read a line of input, optionally with echo suppressed.
 * @param {string} question
 * @param {{ silent?: boolean }} [options]
 * @returns {Promise<string>}
 */
function prompt(question, { silent = false } = {}) {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });

    if (silent && process.stdin.isTTY) {
      const output = /** @type {any} */ (rl).output;
      /** @type {any} */ (rl)._writeToOutput = function (/** @type {string} */ chunk) {
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

/** @param {unknown} raw */
function normaliseUsername(raw) {
  return String(raw ?? "").trim().toLowerCase().normalize("NFKC").slice(0, 64);
}

/** @param {string} username */
function validUsername(username) {
  return /^[a-z0-9][a-z0-9._-]{2,63}$/.test(username);
}

async function main() {
  console.log("\nGaMatech Systems — create admin account");
  console.log("=======================================\n");

  const pool = openPool();
  try {
    await applySchema(pool);

    // ---- username ------------------------------------------------------
    let username = normaliseUsername(process.env.ADMIN_USERNAME);
    if (!username) username = normaliseUsername(await prompt("Username: "));
    if (!validUsername(username)) {
      console.error(
        "\n✗ Invalid username. Use 3–64 characters: lowercase letters, numbers, dot, underscore or hyphen, starting with a letter or number.\n",
      );
      process.exitCode = 1;
      return;
    }

    const { rows: existingRows } = await pool.query(
      "SELECT id, username FROM admin_users WHERE username = $1",
      [username],
    );
    const existing = existingRows[0];

    const fromEnv = Boolean(process.env.ADMIN_PASSWORD);

    if (existing && !fromEnv) {
      const confirm = (await prompt(`Account "${username}" exists. Reset its password? [y/N] `))
        .trim()
        .toLowerCase();
      if (confirm !== "y" && confirm !== "yes") {
        console.log("\nCancelled. No changes made.\n");
        return;
      }
    }

    // ---- display name --------------------------------------------------
    let displayName = String(process.env.ADMIN_DISPLAY_NAME ?? "").trim().slice(0, 80);
    if (!displayName && !fromEnv) {
      displayName = (await prompt(`Display name [${username}]: `)).trim().slice(0, 80);
    }
    if (!displayName) displayName = username;

    // ---- password ------------------------------------------------------
    let password = process.env.ADMIN_PASSWORD ?? "";
    if (!fromEnv) {
      console.log(
        `\nPassword requirements: at least ${PASSWORD_POLICY.minLength} characters, mixing at least`,
      );
      console.log("three of lowercase, uppercase, numbers and symbols. Input is hidden.\n");

      password = await prompt("Password: ", { silent: true });
      const again = await prompt("Confirm password: ", { silent: true });
      if (password !== again) {
        console.error("\n✗ Passwords did not match. Nothing was changed.\n");
        process.exitCode = 1;
        return;
      }
    }

    const problems = checkPasswordStrength(password, { username });
    if (problems.length > 0) {
      console.error("\n✗ Password rejected:");
      for (const problem of problems) console.error(`  · ${problem}`);
      console.error("");
      process.exitCode = 1;
      return;
    }

    // ---- write ---------------------------------------------------------
    process.stdout.write("Hashing password (this takes a moment by design)… ");
    const hash = await hashPassword(password);
    console.log("done.");

    const now = new Date();

    if (existing) {
      await pool.query(
        `UPDATE admin_users
            SET password_hash = $1, display_name = $2, password_changed_at = $3,
                must_change_pw = $4, is_active = true
          WHERE id = $5`,
        [hash, displayName, now, fromEnv, existing.id],
      );
      // A password reset must invalidate every existing session.
      await pool.query("DELETE FROM sessions WHERE user_id = $1", [existing.id]);
      await pool.query("DELETE FROM login_attempts WHERE username = $1", [username]);
      console.log(`\n✓ Password reset for "${username}". All sessions were signed out.\n`);
    } else {
      await pool.query(
        `INSERT INTO admin_users
           (username, display_name, password_hash, must_change_pw, is_active,
            created_at, password_changed_at)
         VALUES ($1, $2, $3, $4, true, $5, $5)`,
        [username, displayName, hash, fromEnv, now],
      );
      console.log(`\n✓ Admin account "${username}" created.\n`);
    }

    await pool.query(
      `INSERT INTO audit_log (actor, action, target, detail, created_at)
       VALUES ($1, $2, $3, '', $4)`,
      ["cli", existing ? "admin.password_reset" : "admin.created", `user:${username}`, now],
    );

    if (fromEnv) {
      console.log(
        "Note: the password came from ADMIN_PASSWORD, so the account must change it at first",
      );
      console.log("sign-in. Unset that variable now.\n");
    }
    console.log("Sign in at /admin/login\n");
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error("\n✗ Failed:", error instanceof Error ? error.message : error, "\n");
  process.exit(1);
});
