'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import NavBar from '@/components/ui/NavBar';
import Button from '@/components/ui/Button';
import Dialog from '@/components/ui/Dialog';
import { showToast } from '@/lib/toast';
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    loadExpense();
  }, [id]);

  const loadExpense = async () => {
    try {
      const res = await apiFetch<{ expenses: Expense[] }>('/expenses');
      const found = res.expenses.find((e) => e.id === id);
      if (found) setExpense(found);
    } catch {
      showToast({ message: '加载失败', type: 'error' });
    }
  };

  const handleSubmit = async (data: ExpenseFormData) => {
    setLoading(true);
    try {
      await apiFetch(`/expenses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      showToast({ message: '修改成功！', type: 'success' });
      router.back();
    } catch (e: any) {
      showToast({ message: e.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setShowDeleteConfirm(false);
    try {
      await apiFetch(`/expenses/${id}`, { method: 'DELETE' });
      showToast({ message: '已删除', type: 'success' });
      router.back();
    } catch (e: any) {
      showToast({ message: e.message, type: 'error' });
    }
  };

  if (!expense) {
    return (
      <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
        <NavBar title="编辑" onBack={() => router.back()} />
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
          <div className="skeleton" style={{ width: 120, height: 20, margin: '0 auto 8px' }} />
          <div className="skeleton" style={{ width: 200, height: 40, margin: '0 auto' }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
      <NavBar title="编辑记录" onBack={() => router.back()} />
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
          variant="danger"
          onClick={() => setShowDeleteConfirm(true)}
        >
          删除记录
        </Button>
      </div>

      <Dialog
        visible={showDeleteConfirm}
        title="删除记录"
        content="确定要删除这笔记录吗？"
        actions={[
          { text: '取消', onClick: () => setShowDeleteConfirm(false) },
          { text: '删除', danger: true, bold: true, onClick: handleDelete },
        ]}
        onClose={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
