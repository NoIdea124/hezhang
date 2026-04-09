'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/ui/NavBar';
import { showToast } from '@/lib/toast';
import ExpenseForm from '@/components/expense/ExpenseForm';
import type { ExpenseFormData } from '@/components/expense/ExpenseForm';
import { apiFetch } from '@/lib/api';

export default function NewExpensePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: ExpenseFormData) => {
    setLoading(true);
    try {
      await apiFetch('/expenses', {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          special_budget_id: data.special_budget_id || null,
        }),
      });
      showToast({ message: '记录成功！', type: 'success' });
      router.back();
    } catch (e: any) {
      showToast({ message: e.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
      <NavBar title="记一笔" onBack={() => router.back()} />
      <ExpenseForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}
