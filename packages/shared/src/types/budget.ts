export type BudgetStatus = 'draft' | 'pending' | 'active';

export interface BudgetCategory {
  name: string;
  amount: number;
  percentage: number;
}

export interface Budget {
  id: string;
  space_id: string;
  month: string;
  total_amount: number;
  categories: BudgetCategory[];
  status: BudgetStatus;
  confirmed_by: string[];
  created_at: string;
}

export interface BudgetCreate {
  month: string;
  total_amount: number;
  categories: BudgetCategory[];
}

export interface BudgetWithSpending extends Budget {
  total_spent: number;
  category_spending: Record<string, number>;
  daily_available: number;
  remaining_days: number;
}
