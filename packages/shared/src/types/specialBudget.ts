export interface SpecialBudget {
  id: string;
  space_id: string;
  name: string;
  icon: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
  // computed
  total_spent?: number;
}

export interface SpecialBudgetCreate {
  name: string;
  icon?: string;
  total_amount: number;
}

export interface SpecialBudgetUpdate {
  name?: string;
  icon?: string;
  total_amount?: number;
}
