import type { Expense } from './expense';
import type { Budget } from './budget';
import type { Comment } from './comment';
import type { Reminder } from './reminder';

export type WsEvent =
  | { type: 'expense:created'; data: Expense }
  | { type: 'expense:updated'; data: Expense }
  | { type: 'expense:deleted'; data: { id: string } }
  | { type: 'budget:updated'; data: Budget }
  | { type: 'budget:confirmed'; data: Budget }
  | { type: 'comment:created'; data: Comment }
  | { type: 'reminder:created'; data: Reminder }
  | { type: 'notification'; data: { message: string } };
