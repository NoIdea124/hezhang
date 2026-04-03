import db from '../db/index.js';
import { getMonthlyTotal, getCategoryTotals, getExpenses } from './expense.service.js';
import { getBudgetByMonth } from './budget.service.js';

interface DailyTotal {
  date: string;
  amount: number;
}

interface UserTotal {
  user_id: string;
  nickname: string;
  amount: number;
  count: number;
}

export interface ReportData {
  month: string;
  totalSpent: number;
  expenseCount: number;
  dailyAvg: number;
  highestDay: { date: string; amount: number } | null;
  categoryTotals: Record<string, number>;
  dailyTotals: DailyTotal[];
  prevMonthDailyTotals: DailyTotal[];
  userTotals: UserTotal[];
  budget: { total: number; spent: number; rate: number } | null;
}

function getDailyTotals(spaceId: string, month: string): DailyTotal[] {
  const rows = db.prepare(`
    SELECT expense_date as date, SUM(amount) as amount
    FROM expenses
    WHERE space_id = ? AND strftime('%Y-%m', expense_date) = ?
    GROUP BY expense_date
    ORDER BY expense_date
  `).all(spaceId, month) as DailyTotal[];
  return rows;
}

function getUserTotals(spaceId: string, month: string): UserTotal[] {
  const rows = db.prepare(`
    SELECT e.user_id, u.nickname, SUM(e.amount) as amount, COUNT(*) as count
    FROM expenses e
    JOIN users u ON e.user_id = u.id
    WHERE e.space_id = ? AND strftime('%Y-%m', e.expense_date) = ?
    GROUP BY e.user_id
  `).all(spaceId, month) as UserTotal[];
  return rows;
}

function getPrevMonth(month: string): string {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function getReportData(spaceId: string, month: string): ReportData {
  const totalSpent = getMonthlyTotal(spaceId, month);
  const categoryTotals = getCategoryTotals(spaceId, month);
  const expenses = getExpenses(spaceId, { month });
  const dailyTotals = getDailyTotals(spaceId, month);
  const userTotals = getUserTotals(spaceId, month);

  const prevMonth = getPrevMonth(month);
  const prevMonthDailyTotals = getDailyTotals(spaceId, prevMonth);

  // Calculate days with spending for daily average
  const [y, m] = month.split('-').map(Number);
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const daysInMonth = month < currentMonth
    ? new Date(y, m, 0).getDate()
    : now.getDate();
  const dailyAvg = daysInMonth > 0 ? Math.round((totalSpent / daysInMonth) * 100) / 100 : 0;

  // Highest day
  let highestDay: { date: string; amount: number } | null = null;
  for (const d of dailyTotals) {
    if (!highestDay || d.amount > highestDay.amount) {
      highestDay = d;
    }
  }

  // Budget info
  const budgetData = getBudgetByMonth(spaceId, month);
  const budget = budgetData ? {
    total: budgetData.total_amount,
    spent: budgetData.total_spent,
    rate: Math.round((budgetData.total_spent / budgetData.total_amount) * 100),
  } : null;

  return {
    month,
    totalSpent,
    expenseCount: expenses.length,
    dailyAvg,
    highestDay,
    categoryTotals,
    dailyTotals,
    prevMonthDailyTotals,
    userTotals,
    budget,
  };
}
