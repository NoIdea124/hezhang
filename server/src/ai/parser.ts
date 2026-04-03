import { extractAmount, removeAmount } from '../utils/amount.js';
import { parseChineseDate } from '../utils/date.js';
import { classify } from './classifier.js';
import type { ParsedExpense } from '@hezhang/shared';

/**
 * Parse natural language input into structured expense data
 */
export async function parseExpense(text: string, spaceId?: string): Promise<ParsedExpense | null> {
  const amount = extractAmount(text);
  if (!amount) return null;

  const description = removeAmount(text);
  const date = parseChineseDate(text);
  const category = await classify(description || text, spaceId);

  // Detect ownership
  const isPersonal = /(?:个人的?|算我个人|我自己的)/.test(text);

  return {
    amount,
    category,
    note: description || category,
    expense_date: date,
    ownership: isPersonal ? 'personal' : 'shared',
  };
}
