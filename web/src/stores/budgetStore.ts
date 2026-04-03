import { create } from 'zustand';
import { apiFetch } from '@/lib/api';
import { getCurrentMonth } from '@/lib/format';
import type { BudgetCreate, BudgetWithSpending, BudgetCategory } from '@hezhang/shared';

interface BudgetState {
  budget: BudgetWithSpending | null;
  loading: boolean;
  month: string;
  setMonth: (month: string) => void;
  fetchBudget: (month?: string) => Promise<void>;
  createBudget: (data: BudgetCreate) => Promise<void>;
  updateBudget: (id: string, data: { total_amount?: number; categories?: BudgetCategory[] }) => Promise<void>;
  confirmBudget: (id: string) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
}

export const useBudgetStore = create<BudgetState>()((set, get) => ({
  budget: null,
  loading: false,
  month: getCurrentMonth(),

  setMonth: (month: string) => {
    set({ month });
    get().fetchBudget(month);
  },

  fetchBudget: async (month?: string) => {
    const m = month || get().month;
    set({ loading: true });
    try {
      const res = await apiFetch<{ budget: BudgetWithSpending | null }>(`/budgets?month=${m}`);
      set({ budget: res.budget, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  createBudget: async (data: BudgetCreate) => {
    await apiFetch('/budgets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    await get().fetchBudget();
  },

  updateBudget: async (id: string, data) => {
    await apiFetch(`/budgets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    await get().fetchBudget();
  },

  confirmBudget: async (id: string) => {
    await apiFetch(`/budgets/${id}/confirm`, { method: 'POST' });
    await get().fetchBudget();
  },

  deleteBudget: async (id: string) => {
    await apiFetch(`/budgets/${id}`, { method: 'DELETE' });
    await get().fetchBudget();
  },
}));
