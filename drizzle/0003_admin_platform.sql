ALTER TABLE users ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS suspended BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS admin_audit_log (
  id TEXT PRIMARY KEY,
  actor_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS admin_audit_log_created_idx ON admin_audit_log(created_at);
CREATE INDEX IF NOT EXISTS admin_audit_log_entity_idx ON admin_audit_log(entity_type, entity_id);

CREATE TABLE IF NOT EXISTS skill_catalog (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL DEFAULT 'General',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

INSERT INTO skill_catalog (id, name, category, active, created_at, updated_at)
VALUES
  ('cat-communication', 'Communication', 'Communication', TRUE, NOW()::text, NOW()::text),
  ('cat-leadership', 'Leadership', 'Leadership', TRUE, NOW()::text, NOW()::text),
  ('cat-teamwork', 'Teamwork', 'Collaboration', TRUE, NOW()::text, NOW()::text),
  ('cat-digital', 'Digital literacy', 'Digital', TRUE, NOW()::text, NOW()::text),
  ('cat-problem', 'Problem solving', 'Thinking', TRUE, NOW()::text, NOW()::text)
ON CONFLICT (name) DO NOTHING;
