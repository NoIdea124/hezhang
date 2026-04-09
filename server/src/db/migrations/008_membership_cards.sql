CREATE TABLE IF NOT EXISTS membership_cards (
  id TEXT PRIMARY KEY,
  space_id TEXT NOT NULL REFERENCES spaces(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  store_name TEXT NOT NULL,
  balance REAL NOT NULL DEFAULT 0,
  note TEXT NOT NULL DEFAULT '',
  created_at TEXT DEFAULT (datetime('now', '+8 hours')),
  updated_at TEXT DEFAULT (datetime('now', '+8 hours'))
);

CREATE INDEX IF NOT EXISTS idx_membership_cards_space ON membership_cards(space_id);
