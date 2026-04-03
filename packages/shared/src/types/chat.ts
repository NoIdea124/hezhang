export type Intent =
  | 'record'
  | 'query_spending'
  | 'query_budget'
  | 'query_expenses'
  | 'modify'
  | 'delete'
  | 'set_budget'
  | 'view_report'
  | 'help';

export interface ChatRequest {
  message: string;
}

export interface ParsedExpense {
  amount: number;
  category: string;
  note: string;
  expense_date: string;
  ownership: 'shared' | 'personal';
}

export interface ChatResponse {
  reply: string;
  intent: Intent;
  expense?: ParsedExpense & { id: string };
  data?: unknown;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  expense?: ParsedExpense & { id: string };
  timestamp: string;
}
