import db from '../db/index.js';
import type { Expense, ExpenseCreate, ExpenseUpdate, ExpenseFilter } from '@hezhang/shared';

export function createExpense(spaceId: string, userId: string, data: ExpenseCreate): Expense {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const expenseDate = data.expense_date || new Date().toISOString().split('T')[0];

  db.prepare(`
    INSERT INTO expenses (id, space_id, user_id, amount, category, note, expense_date, ownership, ai_classified, original_input, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, spaceId, userId,
    data.amount, data.category, data.note || '',
    expenseDate, data.ownership || 'shared',
    data.ai_classified ? 1 : 0, data.original_input || null,
    now, now
  );

  return getExpenseById(id)!;
}

export function getExpenseById(id: string): Expense | null {
  const row = db.prepare(`
    SELECT e.*, u.nickname as user_nickname
    FROM expenses e
    JOIN users u ON e.user_id = u.id
    WHERE e.id = ?
  `).get(id) as (Expense & { ai_classified: number }) | undefined;

  if (!row) return null;
  return { ...row, ai_classified: !!row.ai_classified };
}

export function getExpenses(spaceId: string, filter: ExpenseFilter): Expense[] {
  let sql = `
    SELECT e.*, u.nickname as user_nickname,
      (SELECT COUNT(*) FROM comments c WHERE c.expense_id = e.id) as comment_count
    FROM expenses e
    JOIN users u ON e.user_id = u.id
    WHERE e.space_id = ?
  `;
  const params: any[] = [spaceId];

  if (filter.month) {
    sql += ` AND strftime('%Y-%m', e.expense_date) = ?`;
    params.push(filter.month);
  }

  if (filter.category) {
    sql += ` AND e.category = ?`;
    params.push(filter.category);
  }

  if (filter.ownership) {
    sql += ` AND e.ownership = ?`;
    params.push(filter.ownership);
  }

  if (filter.user_id) {
    sql += ` AND e.user_id = ?`;
    params.push(filter.user_id);
  }

  sql += ` ORDER BY e.expense_date DESC, e.created_at DESC`;

  const rows = db.prepare(sql).all(...params) as (Expense & { ai_classified: number })[];
  return rows.map((r) => ({ ...r, ai_classified: !!r.ai_classified }));
}

export function updateExpense(id: string, userId: string, data: ExpenseUpdate): Expense | null {
  const existing = getExpenseById(id);
  if (!existing) return null;

  const sets: string[] = [];
  const params: any[] = [];

  if (data.amount !== undefined) { sets.push('amount = ?'); params.push(data.amount); }
  if (data.category !== undefined) { sets.push('category = ?'); params.push(data.category); }
  if (data.note !== undefined) { sets.push('note = ?'); params.push(data.note); }
  if (data.expense_date !== undefined) { sets.push('expense_date = ?'); params.push(data.expense_date); }
  if (data.ownership !== undefined) { sets.push('ownership = ?'); params.push(data.ownership); }

  if (sets.length === 0) return existing;

  sets.push("updated_at = datetime('now')");
  params.push(id);

  db.prepare(`UPDATE expenses SET ${sets.join(', ')} WHERE id = ?`).run(...params);

  return getExpenseById(id);
}

export function deleteExpense(id: string): boolean {
  const result = db.prepare('DELETE FROM expenses WHERE id = ?').run(id);
  return result.changes > 0;
}

export function getMonthlyTotal(spaceId: string, month: string, ownership?: string): number {
  let sql = `SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE space_id = ? AND strftime('%Y-%m', expense_date) = ?`;
  const params: any[] = [spaceId, month];

  if (ownership) {
    sql += ` AND ownership = ?`;
    params.push(ownership);
  }

  const row = db.prepare(sql).get(...params) as { total: number };
  return row.total;
}

export function getCategoryTotals(spaceId: string, month: string): Record<string, number> {
  const rows = db.prepare(`
    SELECT category, SUM(amount) as total
    FROM expenses
    WHERE space_id = ? AND strftime('%Y-%m', expense_date) = ?
    GROUP BY category
  `).all(spaceId, month) as { category: string; total: number }[];

  const result: Record<string, number> = {};
  for (const r of rows) {
    result[r.category] = r.total;
  }
  return result;
}
