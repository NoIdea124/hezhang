-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  space_id TEXT NOT NULL REFERENCES spaces(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  amount REAL NOT NULL,
  category TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  expense_date TEXT NOT NULL,
  ownership TEXT NOT NULL DEFAULT 'shared' CHECK(ownership IN ('shared', 'personal')),
  ai_classified INTEGER NOT NULL DEFAULT 0,
  original_input TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_expenses_space_date ON expenses(space_id, expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_space_category ON expenses(space_id, category);
