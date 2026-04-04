'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Dialog from '@/components/ui/Dialog';
import FloatingButton from '@/components/ui/FloatingButton';
import { showToast } from '@/lib/toast';
import { IconPlus } from '@/components/ui/icons';
import FilterBar from '@/components/bills/FilterBar';
import ExpenseList from '@/components/bills/ExpenseList';
import { apiFetch } from '@/lib/api';
import { getCurrentMonth, formatCurrency } from '@/lib/format';
import type { Expense } from '@hezhang/shared';

export default function BillsPage() {
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [month, setMonth] = useState(getCurrentMonth());
  const [ownership, setOwnership] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const loadExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (month) params.set('month', month);
      if (category) params.set('category', category);
      if (ownership) params.set('ownership', ownership);

      const res = await apiFetch<{ expenses: Expense[] }>(`/expenses?${params}`);
      setExpenses(res.expenses);
    } catch (e: any) {
      showToast(e.message);
    } finally {
      setLoading(false);
    }
  }, [month, category, ownership]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  useEffect(() => {
    const handler = (e: Event) => {
      const event = (e as CustomEvent).detail;
      if (event.type?.startsWith('expense:')) {
        loadExpenses();
      }
    };
    window.addEventListener('ws-sync', handler);
    return () => window.removeEventListener('ws-sync', handler);
  }, [loadExpenses]);

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    try {
      await apiFetch(`/expenses/${deleteConfirm}`, { method: 'DELETE' });
      setExpenses((prev) => prev.filter((e) => e.id !== deleteConfirm));
      showToast({ message: '已删除', type: 'success' });
    } catch (e: any) {
      showToast({ message: e.message, type: 'error' });
    }
    setDeleteConfirm(null);
  };

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div style={{ paddingTop: 16 }}>
      <div style={{ padding: '44px 16px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>消费明细</h2>
        <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          合计 <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{formatCurrency(total)}</span>
        </span>
      </div>

      <FilterBar
        category={category}
        month={month}
        ownership={ownership}
        onCategoryChange={setCategory}
        onMonthChange={setMonth}
        onOwnershipChange={setOwnership}
      />

      {loading ? (
        <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: 60, borderRadius: 'var(--radius-sm)' }} />
          ))}
        </div>
      ) : (
        <ExpenseList expenses={expenses} onDelete={(id) => setDeleteConfirm(id)} />
      )}

      <FloatingButton
        onClick={() => router.push('/expense/new')}
        icon={<IconPlus size={24} color="#fff" />}
      />

      <Dialog
        visible={!!deleteConfirm}
        title="删除记录"
        content="确定删除这笔记录？"
        actions={[
          { text: '取消', onClick: () => setDeleteConfirm(null) },
          { text: '删除', danger: true, bold: true, onClick: handleDeleteConfirm },
        ]}
        onClose={() => setDeleteConfirm(null)}
      />
    </div>
  );
}
