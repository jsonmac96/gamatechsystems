-- ---------------------------------------------------------------------------
-- GaMatech Systems — database schema
--
-- Every statement here is idempotent so the file doubles as the migration.
-- All application access goes through parameterised statements (see lib/db.ts);
-- no SQL in this project is ever assembled from user input.
-- ---------------------------------------------------------------------------

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- Admin operators -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_users (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  username        TEXT    NOT NULL UNIQUE,          -- stored lowercase
  display_name    TEXT    NOT NULL DEFAULT '',
  password_hash   TEXT    NOT NULL,                 -- scrypt$N$r$p$salt$hash
  must_change_pw  INTEGER NOT NULL DEFAULT 0,
  is_active       INTEGER NOT NULL DEFAULT 1,
  created_at      TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  password_changed_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  last_login_at   TEXT
);

-- Server-side sessions ------------------------------------------------------
-- The cookie holds a random 32-byte token; only its HMAC lands in the table,
-- so a database leak cannot be replayed as a valid session.
CREATE TABLE IF NOT EXISTS sessions (
  token_hash      TEXT    PRIMARY KEY,
  user_id         INTEGER NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  created_at      TEXT    NOT NULL,
  last_seen_at    TEXT    NOT NULL,
  absolute_expires_at TEXT NOT NULL,
  ip_hash         TEXT    NOT NULL DEFAULT '',
  user_agent_hash TEXT    NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_sessions_user     ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expiry   ON sessions(absolute_expires_at);

-- Login throttling ----------------------------------------------------------
-- One row per attempt. Both the username and the client IP are recorded so a
-- lockout can be evaluated per account and per source address.
CREATE TABLE IF NOT EXISTS login_attempts (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  username        TEXT    NOT NULL DEFAULT '',
  ip_hash         TEXT    NOT NULL DEFAULT '',
  succeeded       INTEGER NOT NULL DEFAULT 0,
  created_at      TEXT    NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_attempts_user_time ON login_attempts(username, created_at);
CREATE INDEX IF NOT EXISTS idx_attempts_ip_time   ON login_attempts(ip_hash, created_at);

-- Generic request throttling (lead form, etc.) ------------------------------
CREATE TABLE IF NOT EXISTS rate_events (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  bucket          TEXT    NOT NULL,   -- e.g. 'lead:<ip_hash>'
  created_at      TEXT    NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_rate_bucket_time ON rate_events(bucket, created_at);

-- Inbound leads -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS leads (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  name            TEXT    NOT NULL,
  email           TEXT    NOT NULL,
  phone           TEXT    NOT NULL DEFAULT '',
  company         TEXT    NOT NULL DEFAULT '',
  service         TEXT    NOT NULL DEFAULT '',
  budget          TEXT    NOT NULL DEFAULT '',
  message         TEXT    NOT NULL,
  source_path     TEXT    NOT NULL DEFAULT '',
  ip_hash         TEXT    NOT NULL DEFAULT '',   -- HMAC, not the raw address
  status          TEXT    NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','qualified','won','lost','spam')),
  notes           TEXT    NOT NULL DEFAULT '',
  created_at      TEXT    NOT NULL,
  updated_at      TEXT    NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_status  ON leads(status);

-- Blog ----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS posts (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  slug             TEXT    NOT NULL UNIQUE,
  title            TEXT    NOT NULL,
  excerpt          TEXT    NOT NULL DEFAULT '',
  body_md          TEXT    NOT NULL DEFAULT '',
  cover_alt        TEXT    NOT NULL DEFAULT '',
  tags             TEXT    NOT NULL DEFAULT '',     -- comma separated
  meta_title       TEXT    NOT NULL DEFAULT '',
  meta_description TEXT    NOT NULL DEFAULT '',
  status           TEXT    NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  author_name      TEXT    NOT NULL DEFAULT 'GaMatech Systems',
  published_at     TEXT,
  created_at       TEXT    NOT NULL,
  updated_at       TEXT    NOT NULL,
  created_by       INTEGER REFERENCES admin_users(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_posts_status_pub ON posts(status, published_at DESC);

-- Audit trail ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_log (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  actor       TEXT NOT NULL DEFAULT 'system',
  action      TEXT NOT NULL,
  target      TEXT NOT NULL DEFAULT '',
  detail      TEXT NOT NULL DEFAULT '',
  ip_hash     TEXT NOT NULL DEFAULT '',
  created_at  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at DESC);
