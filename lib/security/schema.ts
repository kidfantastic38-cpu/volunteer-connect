import type { DatabaseSync } from "node:sqlite"

function hasColumn(database: DatabaseSync, table: string, column: string): boolean {
  const cols = database.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[]
  return cols.some((col) => col.name === column)
}

export function ensureSecuritySchema(database: DatabaseSync) {
  if (!hasColumn(database, "users", "session_version")) {
    database.exec("ALTER TABLE users ADD COLUMN session_version INTEGER NOT NULL DEFAULT 1")
  }
  if (!hasColumn(database, "profiles", "public_slug")) {
    database.exec("ALTER TABLE profiles ADD COLUMN public_slug TEXT")
  }

  database.exec(`
    CREATE TABLE IF NOT EXISTS email_codes (
      user_id TEXT PRIMARY KEY,
      code_hash TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS skill_verifications (
      user_id TEXT NOT NULL,
      skill_key TEXT NOT NULL,
      skill_name TEXT NOT NULL,
      verified INTEGER NOT NULL DEFAULT 1,
      verified_by TEXT,
      verified_at TEXT NOT NULL,
      source TEXT NOT NULL DEFAULT 'admin',
      PRIMARY KEY (user_id, skill_key),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS rate_limits (
      key TEXT PRIMARY KEY,
      window_start INTEGER NOT NULL,
      count INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS uploads (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      stored_name TEXT NOT NULL,
      original_name TEXT NOT NULL,
      mime TEXT NOT NULL,
      size INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS uploads_owner_idx ON uploads(owner_id);
    CREATE UNIQUE INDEX IF NOT EXISTS profiles_public_slug_idx
      ON profiles(public_slug) WHERE public_slug IS NOT NULL AND public_slug != '';
  `)
}
