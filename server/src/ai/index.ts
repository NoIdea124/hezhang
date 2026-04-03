import type { ChatResponse, Intent } from '@hezhang/shared';
import { getCategoryIcon } from '@hezhang/shared';
import { recognizeIntent } from './intent.js';
import { parseExpense } from './parser.js';
import {
  createExpense,
  getExpenses,
  getMonthlyTotal,
  deleteExpense,
  updateExpense,
  getCategoryTotals,
} from '../services/expense.service.js';
import { formatCurrency } from './format-utils.js';
import { getBudgetByMonth } from '../services/budget.service.js';
import { getReportData } from '../services/report.service.js';

export async function processChat(
  message: string,
  userId: string,
  spaceId: string
): Promise<ChatResponse> {
  const intent = recognizeIntent(message);

  switch (intent) {
    case 'record':
      return handleRecord(message, userId, spaceId);
    case 'query_spending':
      return handleQuerySpending(message, spaceId);
    case 'query_expenses':
      return handleQueryExpenses(spaceId);
    case 'query_budget':
      return handleQueryBudget(spaceId);
    case 'delete':
      return handleDelete(spaceId);
    case 'modify':
      return handleModify(message, spaceId);
    case 'view_report':
      return handleViewReport(spaceId);
    case 'set_budget': {
      const currentMonth = new Date().toISOString().slice(0, 7);
      const existing = getBudgetByMonth(spaceId, currentMonth);
      if (existing) {
        return {
          reply: `本月已设置预算 ${formatCurrency(existing.total_amount)}，如需修改请前往「预算」页面操作～`,
          intent,
        };
      }
      return { reply: '请前往「预算」页面设置本月预算～', intent };
    }
    case 'help':
    default:
      return handleHelp();
  }
}

async function handleRecord(
  message: string,
  userId: string,
  spaceId: string
): Promise<ChatResponse> {
  const parsed = await parseExpense(message, spaceId);

  if (!parsed) {
    return {
      reply: '没太看懂这笔消费呢 😅 可以告诉我金额和买了什么吗？\n比如 "午饭 68" 或者 "超市买菜 156"',
      intent: 'help',
    };
  }

  const expense = createExpense(spaceId, userId, {
    ...parsed,
    ai_classified: true,
    original_input: message,
  });

  const icon = getCategoryIcon(parsed.category);
  const dateHint = parsed.expense_date === new Date().toISOString().split('T')[0]
    ? '' : `（${parsed.expense_date}）`;

  return {
    reply: `已记录${dateHint}：${parsed.note} ${formatCurrency(parsed.amount)} → ${parsed.category} ${icon}`,
    intent: 'record',
    expense: { ...parsed, id: expense.id },
  };
}

async function handleQuerySpending(
  message: string,
  spaceId: string
): Promise<ChatResponse> {
  const currentMonth = new Date().toISOString().slice(0, 7);

  // Check if asking about specific category
  const categoryTotals = getCategoryTotals(spaceId, currentMonth);
  const total = getMonthlyTotal(spaceId, currentMonth);

  // Check for specific category query
  const categories = Object.keys(categoryTotals);
  const matchedCategory = categories.find((c) => message.includes(c));

  if (matchedCategory) {
    const catTotal = categoryTotals[matchedCategory] || 0;
    const icon = getCategoryIcon(matchedCategory);
    return {
      reply: `本月${matchedCategory} ${icon} 共支出 ${formatCurrency(catTotal)}`,
      intent: 'query_spending',
      data: { category: matchedCategory, total: catTotal },
    };
  }

  // Overall spending
  let reply = `本月共支出 ${formatCurrency(total)}`;

  if (Object.keys(categoryTotals).length > 0) {
    reply += '\n\n各分类：';
    const sorted = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
    for (const [cat, amt] of sorted) {
      const icon = getCategoryIcon(cat);
      reply += `\n${icon} ${cat} ${formatCurrency(amt)}`;
    }
  }

  return { reply, intent: 'query_spending', data: { total, categoryTotals } };
}

async function handleQueryExpenses(spaceId: string): Promise<ChatResponse> {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const expenses = getExpenses(spaceId, { month: currentMonth });
  const recent = expenses.slice(0, 5);

  if (recent.length === 0) {
    return { reply: '本月还没有消费记录哦～', intent: 'query_expenses' };
  }

  let reply = `最近 ${recent.length} 笔消费：\n`;
  for (const e of recent) {
    const icon = getCategoryIcon(e.category);
    reply += `\n${icon} ${e.note || e.category} ${formatCurrency(e.amount)} (${e.user_nickname})`;
  }

  return { reply, intent: 'query_expenses', data: recent };
}

async function handleQueryBudget(spaceId: string): Promise<ChatResponse> {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const budget = getBudgetByMonth(spaceId, currentMonth);

  if (!budget) {
    const total = getMonthlyTotal(spaceId, currentMonth);
    return {
      reply: `本月已支出 ${formatCurrency(total)}。\n还没有设定预算，前往「预算」页面设定吧～`,
      intent: 'query_budget',
    };
  }

  const remaining = Math.max(budget.total_amount - budget.total_spent, 0);
  const pct = Math.round((budget.total_spent / budget.total_amount) * 100);

  let reply = `本月预算 ${formatCurrency(budget.total_amount)}，已花费 ${formatCurrency(budget.total_spent)}（${pct}%），剩余 ${formatCurrency(remaining)}`;
  reply += `\n每日可花 ${formatCurrency(budget.daily_available)}（还剩 ${budget.remaining_days} 天）`;

  // Warnings for categories exceeding 80%
  const warnings: string[] = [];
  for (const cat of budget.categories) {
    const spent = budget.category_spending[cat.name] || 0;
    if (cat.amount > 0) {
      const ratio = spent / cat.amount;
      if (ratio >= 1) {
        warnings.push(`${getCategoryIcon(cat.name)} ${cat.name}已超预算`);
      } else if (ratio >= 0.8) {
        warnings.push(`${getCategoryIcon(cat.name)} ${cat.name}已用${Math.round(ratio * 100)}%`);
      }
    }
  }
  if (warnings.length > 0) {
    reply += '\n\n⚠️ ' + warnings.join('，');
  }

  return { reply, intent: 'query_budget', data: budget };
}

async function handleDelete(spaceId: string): Promise<ChatResponse> {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const expenses = getExpenses(spaceId, { month: currentMonth });

  if (expenses.length === 0) {
    return { reply: '没有可删除的记录哦～', intent: 'delete' };
  }

  const last = expenses[0];
  deleteExpense(last.id);

  const icon = getCategoryIcon(last.category);
  return {
    reply: `已删除：${last.note || last.category} ${formatCurrency(last.amount)} ${icon}`,
    intent: 'delete',
  };
}

async function handleModify(
  message: string,
  spaceId: string
): Promise<ChatResponse> {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const expenses = getExpenses(spaceId, { month: currentMonth });

  if (expenses.length === 0) {
    return { reply: '没有可修改的记录哦～', intent: 'modify' };
  }

  // Extract new amount
  const amountMatch = message.match(/(\d+(?:\.\d{1,2})?)/);
  if (!amountMatch) {
    return { reply: '请告诉我要改成多少哦～ 比如 "上一笔改成 85"', intent: 'modify' };
  }

  const newAmount = parseFloat(amountMatch[1]);
  const last = expenses[0];
  const updated = updateExpense(last.id, '', { amount: newAmount });

  if (!updated) {
    return { reply: '修改失败了 😅', intent: 'modify' };
  }

  const icon = getCategoryIcon(updated.category);
  return {
    reply: `已修改：${updated.note || updated.category} ${formatCurrency(last.amount)} → ${formatCurrency(newAmount)} ${icon}`,
    intent: 'modify',
  };
}

async function handleViewReport(spaceId: string): Promise<ChatResponse> {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const report = getReportData(spaceId, currentMonth);

  if (report.expenseCount === 0) {
    return { reply: '本月还没有消费记录，快去记一笔吧～', intent: 'view_report' };
  }

  let reply = `📊 ${currentMonth.replace('-', '年')}月消费报告\n\n`;
  reply += `💰 总支出：${formatCurrency(report.totalSpent)}（${report.expenseCount} 笔）\n`;
  reply += `📅 日均：${formatCurrency(report.dailyAvg)}\n`;

  if (report.highestDay) {
    reply += `🔥 最高消费日：${report.highestDay.date.split('-')[2]}日 ${formatCurrency(report.highestDay.amount)}\n`;
  }

  // Per-person breakdown
  if (report.userTotals.length > 0) {
    reply += '\n👫 人均分布：';
    for (const u of report.userTotals) {
      const pct = report.totalSpent > 0 ? Math.round(u.amount / report.totalSpent * 100) : 0;
      reply += `\n   ${u.nickname}：${formatCurrency(u.amount)}（${u.count}笔，${pct}%）`;
    }
  }

  // Top categories
  if (Object.keys(report.categoryTotals).length > 0) {
    reply += '\n\n📂 分类 Top 5：';
    const sorted = Object.entries(report.categoryTotals).sort((a, b) => b[1] - a[1]).slice(0, 5);
    for (const [cat, amt] of sorted) {
      const icon = getCategoryIcon(cat);
      const pct = report.totalSpent > 0 ? ((amt / report.totalSpent) * 100).toFixed(1) : '0';
      reply += `\n${icon} ${cat} ${formatCurrency(amt)} (${pct}%)`;
    }
  }

  // Budget comparison
  if (report.budget) {
    reply += `\n\n💳 预算使用：${report.budget.rate}%（${formatCurrency(report.budget.spent)} / ${formatCurrency(report.budget.total)}）`;
  }

  reply += '\n\n详细图表请前往「预算」→「查看报告」';

  return { reply, intent: 'view_report', data: report };
}

function handleHelp(): ChatResponse {
  return {
    reply: '我是你们的记账助手 😊 你可以：\n\n' +
      '📝 记账：直接说 "午饭 68"\n' +
      '🔍 查询："这个月花了多少"\n' +
      '📋 明细："最近三笔消费"\n' +
      '✏️ 修改："上一笔改成 85"\n' +
      '🗑️ 删除："删掉上一笔"\n' +
      '📊 报告："看看这个月报告"',
    intent: 'help',
  };
}
