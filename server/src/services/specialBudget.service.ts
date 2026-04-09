import db from '../db/index.js';
import type { SpecialBudget, SpecialBudgetCreate, SpecialBudgetUpdate } from '@hezhang/shared';

export function getSpecialBudgets(spaceId: string): SpecialBudget[] {
  const rows = db.prepare(`
    SELECT sb.*,
      COALESCE((SELECT SUM(e.amount) FROM expenses e WHERE e.special_budget_id = sb.id), 0) as total_spent
    FROM special_budgets sb
    WHERE sb.space_id = ?
    ORDER BY sb.created_at DESC
  `).all(spaceId) as SpecialBudget[];
  return rows;
}

export function getSpecialBudgetById(id: string): SpecialBudget | null {
  const row = db.prepare(`
    SELECT sb.*,
      COALESCE((SELECT SUM(e.amount) FROM expenses e WHERE e.special_budget_id = sb.id), 0) as total_spent
    FROM special_budgets sb
    WHERE sb.id = ?
  `).get(id) as SpecialBudget | undefined;
  return row || null;
}

export function createSpecialBudget(spaceId: string, data: SpecialBudgetCreate): SpecialBudget {
  const id = crypto.randomUUID();
  const now = new Date(Date.now() + 8 * 3600_000).toISOString();

  db.prepare(`
    INSERT INTO special_budgets (id, space_id, name, icon, total_amount, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, spaceId, data.name, data.icon || '🎯', data.total_amount, now, now);

  return getSpecialBudgetById(id)!;
}

export function updateSpecialBudget(id: string, data: SpecialBudgetUpdate): SpecialBudget | null {
  const existing = getSpecialBudgetById(id);
  if (!existing) return null;

  const sets: string[] = [];
  const params: any[] = [];

  if (data.name !== undefined) { sets.push('name = ?'); params.push(data.name); }
  if (data.icon !== undefined) { sets.push('icon = ?'); params.push(data.icon); }
  if (data.total_amount !== undefined) { sets.push('total_amount = ?'); params.push(data.total_amount); }

  if (sets.length === 0) return existing;

  sets.push("updated_at = datetime('now', '+8 hours')");
  params.push(id);

  db.prepare(`UPDATE special_budgets SET ${sets.join(', ')} WHERE id = ?`).run(...params);
  return getSpecialBudgetById(id);
}

export function deleteSpecialBudget(id: string): boolean {
  // First unlink any expenses
  db.prepare('UPDATE expenses SET special_budget_id = NULL WHERE special_budget_id = ?').run(id);
  const result = db.prepare('DELETE FROM special_budgets WHERE id = ?').run(id);
  return result.changes > 0;
}
