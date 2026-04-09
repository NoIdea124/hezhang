'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import NavBar from '@/components/ui/NavBar';
import ExpenseList from '@/components/bills/ExpenseList';
import { showToast } from '@/lib/toast';
import { formatCurrency } from '@/lib/format';
import { apiFetch } from '@/lib/api';
import type { Expense, SpecialBudget } from '@hezhang/shared';

export default function SpecialBudgetDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [budget, setBudget] = useState<SpecialBudget | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [budgetRes, expenseRes] = await Promise.all([
        apiFetch<{ budgets: SpecialBudget[] }>('/special-budgets'),
        apiFetch<{ expenses: Expense[] }>(`/expenses?special_budget_id=${id}`),
      ]);
      const found = budgetRes.budgets.find((b) => b.id === id);
      if (found) setBudget(found);
      setExpenses(expenseRes.expenses);
    } catch (e: any) {
      showToast({ message: e.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleDelete = async (expenseId: string) => {
    try {
      await apiFetch(`/expenses/${expenseId}`, { method: 'DELETE' });
      showToast({ message: '已删除', type: 'success' });
      loadData();
    } catch (e: any) {
      showToast({ message: e.message, type: 'error' });
    }
  };

  const spent = budget?.total_spent || 0;
  const ratio = budget && budget.total_amount > 0 ? spent / budget.total_amount : 0;
  const remaining = budget ? Math.max(budget.total_amount - spent, 0) : 0;

  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh', paddingBottom: 20 }}>
      <NavBar title={budget ? `${budget.icon} ${budget.name}` : '专项预算明细'} onBack={() => router.back()} />

      {loading ? (
        <div style={{ padding: '20px 16px' }}>
          <div className="skeleton" style={{ height: 80, borderRadius: 'var(--radius-lg)', marginBottom: 12 }} />
          <div className="skeleton" style={{ height: 200, borderRadius: 'var(--radius-lg)' }} />
        </div>
      ) : budget && (
        <>
          {/* Budget summary card */}
          <div style={{
            margin: '12px 16px',
            padding: 16,
            borderRadius: 'var(--radius-lg)',
            background: 'var(--card-bg)',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                预算 {formatCurrency(budget.total_amount)}
              </span>
              <span style={{ fontSize: 14, fontWeight: 600, color: ratio > 1 ? 'var(--danger)' : 'var(--success)' }}>
                剩余 {formatCurrency(remaining)}
              </span>
            </div>
            <div style={{ height: 8, borderRadius: 4, backgroundColor: 'var(--border)', overflow: 'hidden', marginBottom: 6 }}>
              <div style={{
                height: '100%',
                width: `${Math.min(ratio * 100, 100)}%`,
                borderRadius: 4,
                background: ratio > 1 ? 'var(--danger)' : ratio > 0.8 ? 'var(--gradient-warm)' : 'var(--gradient-dream)',
                transition: 'width 0.3s ease',
              }} />
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', textAlign: 'center' }}>
              已花 {formatCurrency(spent)} ({Math.round(ratio * 100)}%) · 共 {expenses.length} 笔
            </div>
          </div>

          {/* Expense list */}
          <ExpenseList expenses={expenses} onDelete={handleDelete} />
        </>
      )}
    </div>
  );
}
