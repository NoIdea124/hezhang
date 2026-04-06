import db from '../db/index.js';
import { getMonthlyTotal, getCategoryTotals } from './expense.service.js';
import type { Budget, BudgetCategory, BudgetCreate, BudgetWithSpending } from '@hezhang/shared';

function parseBudgetRow(row: any): Budget {
  return {
    ...row,
    categories: JSON.parse(row.categories || '[]'),
    confirmed_by: JSON.parse(row.confirmed_by || '[]'),
  };
}

export function createBudget(spaceId: string, userId: string, data: BudgetCreate): Budget {
  const id = crypto.randomUUID();

  // Check member count — auto-activate for solo space
  const memberCount = (db.prepare(
    'SELECT COUNT(*) as count FROM space_members WHERE space_id = ?'
  ).get(spaceId) as { count: number }).count;

  const confirmedBy = [userId];
  const status = memberCount <= 1 ? 'active' : 'draft';

  db.prepare(`
    INSERT INTO budgets (id, space_id, month, total_amount, categories, status, confirmed_by)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, spaceId, data.month, data.total_amount,
    JSON.stringify(data.categories),
    status,
    JSON.stringify(confirmedBy)
  );

  return getBudgetById(id)!;
}

export function getBudgetById(id: string): Budget | null {
  const row = db.prepare('SELECT * FROM budgets WHERE id = ?').get(id);
  if (!row) return null;
  return parseBudgetRow(row);
}

export function getBudgetByMonth(spaceId: string, month: string): BudgetWithSpending | null {
  const row = db.prepare(
    'SELECT * FROM budgets WHERE space_id = ? AND month = ?'
  ).get(spaceId, month);
  if (!row) return null;

  const budget = parseBudgetRow(row);
  const totalSpent = getMonthlyTotal(spaceId, month);
  const categorySpending = getCategoryTotals(spaceId, month);

  // Calculate remaining days
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  let remainingDays: number;

  if (month < currentMonth) {
    remainingDays = 0;
  } else if (month > currentMonth) {
    const [y, m] = month.split('-').map(Number);
    remainingDays = new Date(y, m, 0).getDate(); // total days in month
  } else {
    const [y, m] = month.split('-').map(Number);
    const lastDay = new Date(y, m, 0).getDate();
    remainingDays = Math.max(lastDay - now.getDate() + 1, 1);
  }

  const remaining = budget.total_amount - totalSpent;
  const dailyAvailable = remainingDays > 0 ? Math.max(remaining / remainingDays, 0) : 0;

  return {
    ...budget,
    total_spent: totalSpent,
    category_spending: categorySpending,
    daily_available: Math.round(dailyAvailable * 100) / 100,
    remaining_days: remainingDays,
  };
}

export function updateBudget(
  id: string,
  spaceId: string,
  data: { total_amount?: number; categories?: BudgetCategory[] },
  userId?: string
): Budget | null {
  const existing = getBudgetById(id);
  if (!existing || existing.space_id !== spaceId) return null;

  const sets: string[] = [];
  const params: any[] = [];

  if (data.total_amount !== undefined) {
    sets.push('total_amount = ?');
    params.push(data.total_amount);
  }
  if (data.categories !== undefined) {
    sets.push('categories = ?');
    params.push(JSON.stringify(data.categories));
  }

  if (sets.length === 0) return existing;

  // Reset confirmation — keep modifier's own confirmation, require partner to re-confirm
  const confirmedBy = userId ? [userId] : [];
  sets.push('confirmed_by = ?');
  params.push(JSON.stringify(confirmedBy));

  // Check if this alone is enough to activate (solo space)
  const memberCount = (db.prepare(
    'SELECT COUNT(*) as count FROM space_members WHERE space_id = ?'
  ).get(spaceId) as { count: number }).count;
  const status = confirmedBy.length >= memberCount ? 'active' : 'pending';
  sets.push('status = ?');
  params.push(status);

  params.push(id);

  db.prepare(`UPDATE budgets SET ${sets.join(', ')} WHERE id = ?`).run(...params);
  return getBudgetById(id);
}

export const confirmBudget = db.transaction((id: string, userId: string): Budget | null => {
  const row = db.prepare('SELECT * FROM budgets WHERE id = ?').get(id);
  if (!row) return null;

  const budget = parseBudgetRow(row);
  const confirmedBy: string[] = budget.confirmed_by;

  if (confirmedBy.includes(userId)) return budget;

  confirmedBy.push(userId);

  const memberCount = (db.prepare(
    'SELECT COUNT(*) as count FROM space_members WHERE space_id = ?'
  ).get(budget.space_id) as { count: number }).count;

  const status = confirmedBy.length >= memberCount ? 'active' : 'pending';

  db.prepare(
    'UPDATE budgets SET confirmed_by = ?, status = ? WHERE id = ?'
  ).run(JSON.stringify(confirmedBy), status, id);

  return getBudgetById(id);
});

export function deleteBudget(id: string, spaceId: string): boolean {
  const result = db.prepare(
    'DELETE FROM budgets WHERE id = ? AND space_id = ?'
  ).run(id, spaceId);
  return result.changes > 0;
}
