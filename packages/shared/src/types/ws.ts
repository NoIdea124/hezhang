import type { Expense } from './expense';
import type { Budget } from './budget';

export type WsEvent =
  | { type: 'expense:created'; data: Expense }
  | { type: 'expense:updated'; data: Expense }
  | { type: 'expense:deleted'; data: { id: string } }
  | { type: 'budget:updated'; data: Budget }
  | { type: 'budget:confirmed'; data: Budget }
  | { type: 'notification'; data: { message: string } };
