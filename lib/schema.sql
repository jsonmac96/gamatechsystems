-- ---------------------------------------------------------------------------
-- GaMatech Systems — database schema (PostgreSQL)
--
-- Every statement here is idempotent so the file doubles as the migration.
-- All application access goes through parameterised statements (see lib/db.ts);
-- no SQL in this project is ever assembled from user input.
--
-- Timestamps are `timestamptz`, stored in UTC. The driver is configured in
-- lib/db.ts to hand them back as JavaScript Date objects.
-- ---------------------------------------------------------------------------

-- Admin operators -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_users (
  id                  integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  username            text        NOT NULL UNIQUE,          -- stored lowercase
  display_name        text        NOT NULL DEFAULT '',
  password_hash       text        NOT NULL,                 -- scrypt$N$r$p$salt$hash
  must_change_pw      boolean     NOT NULL DEFAULT false,
  is_active           boolean     NOT NULL DEFAULT true,
  created_at          timestamptz NOT NULL DEFAULT now(),
  password_changed_at timestamptz NOT NULL DEFAULT now(),
  last_login_at       timestamptz
);

-- Server-side sessions ------------------------------------------------------
-- The cookie holds a random 32-byte token; only its HMAC lands in the table,
-- so a database leak cannot be replayed as a valid session.
CREATE TABLE IF NOT EXISTS sessions (
  token_hash          text        PRIMARY KEY,
  user_id             integer     NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  created_at          timestamptz NOT NULL,
  last_seen_at        timestamptz NOT NULL,
  absolute_expires_at timestamptz NOT NULL,
  ip_hash             text        NOT NULL DEFAULT '',
  user_agent_hash     text        NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_sessions_user   ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expiry ON sessions(absolute_expires_at);

-- Login throttling ----------------------------------------------------------
-- One row per attempt. Both the username and the client IP are recorded so a
-- lockout can be evaluated per account and per source address.
CREATE TABLE IF NOT EXISTS login_attempts (
  id          integer     GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  username    text        NOT NULL DEFAULT '',
  ip_hash     text        NOT NULL DEFAULT '',
  succeeded   boolean     NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_attempts_user_time ON login_attempts(username, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_attempts_ip_time   ON login_attempts(ip_hash, created_at DESC);

-- Generic request throttling (lead form, etc.) ------------------------------
CREATE TABLE IF NOT EXISTS rate_events (
  id          integer     GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  bucket      text        NOT NULL,   -- e.g. 'lead:<ip_hash>'
  created_at  timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_rate_bucket_time ON rate_events(bucket, created_at DESC);

-- Inbound leads -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS leads (
  id          integer     GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name        text        NOT NULL,
  email       text        NOT NULL,
  phone       text        NOT NULL DEFAULT '',
  company     text        NOT NULL DEFAULT '',
  service     text        NOT NULL DEFAULT '',
  budget      text        NOT NULL DEFAULT '',
  message     text        NOT NULL,
  source_path text        NOT NULL DEFAULT '',
  ip_hash     text        NOT NULL DEFAULT '',   -- HMAC, not the raw address
  status      text        NOT NULL DEFAULT 'new'
                          CHECK (status IN ('new','contacted','qualified','won','lost','spam')),
  notes       text        NOT NULL DEFAULT '',
  created_at  timestamptz NOT NULL,
  updated_at  timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_status  ON leads(status);

-- Blog ----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS posts (
  id               integer     GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug             text        NOT NULL UNIQUE,
  title            text        NOT NULL,
  excerpt          text        NOT NULL DEFAULT '',
  body_md          text        NOT NULL DEFAULT '',
  cover_alt        text        NOT NULL DEFAULT '',
  tags             text        NOT NULL DEFAULT '',     -- comma separated
  meta_title       text        NOT NULL DEFAULT '',
  meta_description text        NOT NULL DEFAULT '',
  status           text        NOT NULL DEFAULT 'draft'
                               CHECK (status IN ('draft','published')),
  author_name      text        NOT NULL DEFAULT 'GaMatech Systems',
  published_at     timestamptz,
  created_at       timestamptz NOT NULL,
  updated_at       timestamptz NOT NULL,
  created_by       integer     REFERENCES admin_users(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_posts_status_pub ON posts(status, published_at DESC);

-- Audit trail ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_log (
  id         integer     GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor      text        NOT NULL DEFAULT 'system',
  action     text        NOT NULL,
  target     text        NOT NULL DEFAULT '',
  detail     text        NOT NULL DEFAULT '',
  ip_hash    text        NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at DESC);
