'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FloatingBubble, Toast, Dialog } from 'antd-mobile';
import { AddOutline } from 'antd-mobile-icons';
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
      Toast.show({ content: e.message });
    } finally {
      setLoading(false);
    }
  }, [month, category, ownership]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  // Listen for WebSocket sync events
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

  const handleDelete = async (id: string) => {
    Dialog.confirm({
      content: '确定删除这笔记录？',
      onConfirm: async () => {
        try {
          await apiFetch(`/expenses/${id}`, { method: 'DELETE' });
          setExpenses((prev) => prev.filter((e) => e.id !== id));
          Toast.show({ content: '已删除' });
        } catch (e: any) {
          Toast.show({ content: e.message });
        }
      },
    });
  };

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div style={{ paddingTop: 16 }}>
      <div style={{ padding: '44px 16px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>消费明细</h2>
        <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          合计 {formatCurrency(total)}
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
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
          加载中...
        </div>
      ) : (
        <ExpenseList expenses={expenses} onDelete={handleDelete} />
      )}

      <FloatingBubble
        style={{
          '--initial-position-bottom': '76px',
          '--initial-position-right': '16px',
          '--size': '48px',
          '--background': 'var(--primary)',
          '--edge-distance': '16px',
        } as React.CSSProperties}
        onClick={() => router.push('/expense/new')}
      >
        <AddOutline fontSize={24} color="#fff" />
      </FloatingBubble>
    </div>
  );
}
