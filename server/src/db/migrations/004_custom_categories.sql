CREATE TABLE IF NOT EXISTS custom_categories (
  id TEXT PRIMARY KEY,
  space_id TEXT NOT NULL REFERENCES spaces(id),
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '📦',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(space_id, name)
);
