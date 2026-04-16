-- Special project budgets (wedding, baby, etc.)
CREATE TABLE IF NOT EXISTS special_budgets (
  id TEXT PRIMARY KEY,
  space_id TEXT NOT NULL REFERENCES spaces(id),
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '🎯',
  total_amount REAL NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_special_budgets_space ON special_budgets(space_id);

-- Add special_budget_id to expenses (nullable — NULL means normal monthly expense)
ALTER TABLE expenses ADD COLUMN special_budget_id TEXT REFERENCES special_budgets(id) DEFAULT NULL;
