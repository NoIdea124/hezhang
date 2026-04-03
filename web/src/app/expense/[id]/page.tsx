'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { NavBar, Toast, Button, Dialog } from 'antd-mobile';
import ExpenseForm from '@/components/expense/ExpenseForm';
import type { ExpenseFormData } from '@/components/expense/ExpenseForm';
import { apiFetch } from '@/lib/api';
import type { Expense } from '@hezhang/shared';

export default function EditExpensePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadExpense();
  }, [id]);

  const loadExpense = async () => {
    try {
      const res = await apiFetch<{ expenses: Expense[] }>('/expenses');
      const found = res.expenses.find((e) => e.id === id);
      if (found) setExpense(found);
    } catch {
      Toast.show({ content: '加载失败' });
    }
  };

  const handleSubmit = async (data: ExpenseFormData) => {
    setLoading(true);
    try {
      await apiFetch(`/expenses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      Toast.show({ content: '修改成功！' });
      router.back();
    } catch (e: any) {
      Toast.show({ content: e.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = await Dialog.confirm({
      content: '确定要删除这笔记录吗？',
    });
    if (!confirmed) return;

    try {
      await apiFetch(`/expenses/${id}`, { method: 'DELETE' });
      Toast.show({ content: '已删除' });
      router.back();
    } catch (e: any) {
      Toast.show({ content: e.message });
    }
  };

  if (!expense) {
    return (
      <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
        <NavBar onBack={() => router.back()}>编辑</NavBar>
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
          加载中...
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
      <NavBar onBack={() => router.back()}>编辑记录</NavBar>
      <ExpenseForm
        initialData={{
          amount: expense.amount,
          category: expense.category,
          note: expense.note,
          expense_date: expense.expense_date,
          ownership: expense.ownership,
        }}
        onSubmit={handleSubmit}
        submitText="保存修改"
        loading={loading}
      />
      <div style={{ padding: '0 16px' }}>
        <Button
          block
          color="danger"
          fill="outline"
          onClick={handleDelete}
          style={{ borderRadius: 8 }}
        >
          删除记录
        </Button>
      </div>
    </div>
  );
}
