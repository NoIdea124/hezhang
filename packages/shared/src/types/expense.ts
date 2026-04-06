export type Ownership = 'shared' | 'personal';

export interface Expense {
  id: string;
  space_id: string;
  user_id: string;
  amount: number;
  category: string;
  note: string;
  expense_date: string;
  ownership: Ownership;
  ai_classified: boolean;
  original_input: string | null;
  created_at: string;
  updated_at: string;
  // joined fields
  user_nickname?: string;
  comment_count?: number;
}

export interface ExpenseCreate {
  amount: number;
  category: string;
  note?: string;
  expense_date?: string;
  ownership?: Ownership;
  ai_classified?: boolean;
  original_input?: string;
}

export interface ExpenseUpdate {
  amount?: number;
  category?: string;
  note?: string;
  expense_date?: string;
  ownership?: Ownership;
}

export interface ExpenseFilter {
  month?: string;
  category?: string;
  ownership?: Ownership;
  user_id?: string;
}
