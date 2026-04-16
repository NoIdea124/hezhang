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
  special_budget_id: string | null;
  // joined fields
  user_nickname?: string;
  comment_count?: number;
  special_budget_name?: string;
  latest_other_comment_at?: string | null;
}

export interface ExpenseCreate {
  amount: number;
  category: string;
  note?: string;
  expense_date?: string;
  ownership?: Ownership;
  ai_classified?: boolean;
  original_input?: string;
  special_budget_id?: string | null;
}

export interface ExpenseUpdate {
  amount?: number;
  category?: string;
  note?: string;
  expense_date?: string;
  ownership?: Ownership;
  special_budget_id?: string | null;
}

export interface ExpenseFilter {
  month?: string;
  category?: string;
  ownership?: Ownership;
  user_id?: string;
  special_budget_id?: string;
}
