// @ts-check
import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";

/**
 * Promise wrapper around `crypto.scrypt`.
 *
 * Written by hand rather than with `util.promisify` so the options argument
 * (which carries the cost parameters) is properly typed.
 *
 * @param {string} password
 * @param {Buffer} salt
 * @param {number} keylen
 * @param {{N: number, r: number, p: number, maxmem: number}} options
 * @returns {Promise<Buffer>}
 */
function scrypt(password, salt, keylen, options) {
  return new Promise((resolve, reject) => {
    scryptCb(password, salt, keylen, options, (error, derivedKey) => {
      if (error) reject(error);
      else resolve(derivedKey);
    });
  });
}

/**
 * Password hashing for GamaTech Systems admin accounts.
 *
 * Uses scrypt from Node's own crypto module — a memory-hard KDF recommended by
 * OWASP — so there is no third-party dependency in the authentication path.
 * Parameters follow the OWASP Password Storage Cheat Sheet minimum for scrypt
 * (N >= 2^17 with r=8, p=1).
 *
 * Stored format (a single self-describing text column, so cost parameters can
 * be raised later without invalidating existing hashes):
 *
 *   scrypt$<N>$<r>$<p>$<salt-base64url>$<hash-base64url>
 *
 * Written in plain JavaScript rather than TypeScript so the application, the
 * migration script and the admin-creation CLI all share one implementation and
 * can never drift out of sync.
 */

/** Cost parameters used for newly created hashes. */
export const SCRYPT_PARAMS = Object.freeze({
  N: 131072, // 2^17 — roughly 128 MB of memory per hash
  r: 8,
  p: 1,
  keylen: 64,
  saltBytes: 16,
});

// scrypt needs about 128 * N * r bytes; give it headroom over Node's 32 MB default.
const MAX_MEM = 256 * 1024 * 1024;

/** @param {Buffer} buf */
const b64 = (buf) => buf.toString("base64url");

/**
 * Hash a plaintext password.
 * @param {string} password
 * @returns {Promise<string>} the encoded hash string to store
 */
export async function hashPassword(password) {
  if (typeof password !== "string" || password.length === 0) {
    throw new TypeError("Password must be a non-empty string.");
  }
  const { N, r, p, keylen, saltBytes } = SCRYPT_PARAMS;
  const salt = randomBytes(saltBytes);
  const derived = await scrypt(normalise(password), salt, keylen, { N, r, p, maxmem: MAX_MEM });
  return ["scrypt", N, r, p, b64(salt), b64(derived)].join("$");
}

/**
 * Verify a plaintext password against a stored hash.
 *
 * Always performs a full key derivation and a constant-time comparison, so the
 * response time does not reveal whether the account existed or whether the
 * stored hash was well-formed.
 *
 * @param {string} password
 * @param {string} stored
 * @returns {Promise<boolean>}
 */
export async function verifyPassword(password, stored) {
  if (typeof password !== "string" || typeof stored !== "string") return false;

  const parsed = parseHash(stored);
  // For an unparseable or missing hash, still burn a comparable amount of work
  // so attackers cannot distinguish "no such user" by timing.
  const work = parsed ?? {
    N: SCRYPT_PARAMS.N,
    r: SCRYPT_PARAMS.r,
    p: SCRYPT_PARAMS.p,
    keylen: SCRYPT_PARAMS.keylen,
    salt: Buffer.alloc(SCRYPT_PARAMS.saltBytes),
    expected: Buffer.alloc(SCRYPT_PARAMS.keylen),
  };

  /** @type {Buffer} */
  let derived;
  try {
    derived = await scrypt(normalise(password), work.salt, work.keylen, {
      N: work.N,
      r: work.r,
      p: work.p,
      maxmem: MAX_MEM,
    });
  } catch {
    return false;
  }

  if (derived.length !== work.expected.length) return false;
  const equal = timingSafeEqual(derived, work.expected);
  return parsed !== null && equal;
}

/**
 * True when a stored hash used weaker parameters than current policy, meaning
 * it should be transparently upgraded on the next successful login.
 * @param {string} stored
 */
export function needsRehash(stored) {
  const parsed = parseHash(stored);
  if (!parsed) return true;
  return (
    parsed.N < SCRYPT_PARAMS.N ||
    parsed.r < SCRYPT_PARAMS.r ||
    parsed.keylen < SCRYPT_PARAMS.keylen
  );
}

/**
 * @param {string} stored
 * @returns {{N:number,r:number,p:number,keylen:number,salt:Buffer,expected:Buffer}|null}
 */
function parseHash(stored) {
  const parts = stored.split("$");
  if (parts.length !== 6) return null;
  if (parts[0] !== "scrypt") return null;

  const N = Number(parts[1]);
  const r = Number(parts[2]);
  const p = Number(parts[3]);
  if (!isPow2(N)) return null;
  if (!Number.isInteger(r) || r < 1 || r > 32) return null;
  if (!Number.isInteger(p) || p < 1 || p > 16) return null;
  // Refuse absurd parameters: a crafted hash must not be able to exhaust memory.
  if (128 * N * r > MAX_MEM) return null;

  let salt;
  let expected;
  try {
    salt = Buffer.from(String(parts[4]), "base64url");
    expected = Buffer.from(String(parts[5]), "base64url");
  } catch {
    return null;
  }
  if (salt.length < 8 || expected.length < 32) return null;

  return { N, r, p, keylen: expected.length, salt, expected };
}

/** @param {number} n */
function isPow2(n) {
  return Number.isInteger(n) && n >= 1024 && (n & (n - 1)) === 0;
}

/**
 * Normalise Unicode so visually identical passwords typed on different
 * keyboards hash the same, and cap the length so a megabyte-long password
 * cannot be used as a CPU denial-of-service vector.
 * @param {string} password
 */
function normalise(password) {
  return password.normalize("NFKC").slice(0, 1024);
}

/** Minimum policy for new or changed admin passwords. */
export const PASSWORD_POLICY = Object.freeze({
  minLength: 14,
  maxLength: 1024,
});

const WEAK_FRAGMENTS = [
  "password", "passw0rd", "qwerty", "123456", "12345678", "letmein",
  "admin", "administrator", "welcome", "iloveyou", "gamatech", "changeme",
  "abc123", "monkey", "dragon", "football", "baseball", "sunshine",
  "philippines", "manila", "default", "secret", "test1234",
];

/**
 * Validate password strength. Returns a list of human-readable problems;
 * an empty array means the password is acceptable.
 * @param {string} password
 * @param {{ username?: string }} [context]
 * @returns {string[]}
 */
export function checkPasswordStrength(password, context = {}) {
  /** @type {string[]} */
  const problems = [];

  if (typeof password !== "string") {
    return ["Password is required."];
  }
  if (password.length < PASSWORD_POLICY.minLength) {
    problems.push("Use at least " + PASSWORD_POLICY.minLength + " characters.");
  }
  if (password.length > PASSWORD_POLICY.maxLength) {
    problems.push("Use at most " + PASSWORD_POLICY.maxLength + " characters.");
  }

  const classes = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((re) => re.test(password));
  if (classes.length < 3) {
    problems.push("Mix at least three of: lowercase, uppercase, numbers, symbols.");
  }

  const firstChar = password.slice(0, 1);
  if (password.length > 1 && password === firstChar.repeat(password.length)) {
    problems.push("Do not use a single repeated character.");
  }

  const lower = password.toLowerCase();
  const username = (context.username ?? "").toLowerCase();
  if (username.length >= 3 && lower.includes(username)) {
    problems.push("Do not include the username in the password.");
  }

  for (const weak of WEAK_FRAGMENTS) {
    if (lower.includes(weak)) {
      problems.push('Avoid the common word "' + weak + '".');
      break;
    }
  }

  return problems;
}
