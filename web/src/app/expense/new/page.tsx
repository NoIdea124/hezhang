'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { NavBar, Toast } from 'antd-mobile';
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
        body: JSON.stringify(data),
      });
      Toast.show({ content: '记录成功！' });
      router.back();
    } catch (e: any) {
      Toast.show({ content: e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
      <NavBar onBack={() => router.back()}>记一笔</NavBar>
      <ExpenseForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}
