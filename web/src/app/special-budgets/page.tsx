'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/ui/NavBar';
import Button from '@/components/ui/Button';
import Dialog, { DialogContainer } from '@/components/ui/Dialog';
import { showToast } from '@/lib/toast';
import { formatCurrency } from '@/lib/format';
import { apiFetch } from '@/lib/api';
import { IconPlus } from '@/components/ui/icons';
import type { SpecialBudget } from '@hezhang/shared';


export default function SpecialBudgetsPage() {
  const router = useRouter();
  const [budgets, setBudgets] = useState<SpecialBudget[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBudgets = useCallback(async () => {
    try {
      const res = await apiFetch<{ budgets: SpecialBudget[] }>('/special-budgets');
      setBudgets(res.budgets);
    } catch (e: any) {
      showToast({ message: e.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadBudgets(); }, [loadBudgets]);

  const handleAdd = async () => {
    const name = await Dialog.prompt({
      title: '新增专项预算',
      placeholder: '项目名称（如：结婚、装修）',
    });
    if (name === null) return;
    const trimmed = name.trim();
    if (!trimmed) { showToast('请输入项目名称'); return; }

    const icon = await Dialog.prompt({
      title: '选择图标',
      placeholder: '输入一个 emoji',
      defaultValue: '🎯',
    });

    const amountStr = await Dialog.prompt({
      title: '预算金额',
      placeholder: '输入总预算金额',
    });
    if (amountStr === null) return;
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) { showToast('请输入正确的金额'); return; }

    try {
      await apiFetch('/special-budgets', {
        method: 'POST',
        body: JSON.stringify({ name: trimmed, icon: icon?.trim() || '🎯', total_amount: amount }),
      });
      showToast({ message: '已创建', type: 'success' });
      loadBudgets();
    } catch (e: any) {
      showToast({ message: e.message, type: 'error' });
    }
  };

  const handleEdit = async (budget: SpecialBudget) => {
    const amountStr = await Dialog.prompt({
      title: `${budget.icon} ${budget.name} — 修改预算`,
      placeholder: '输入新的预算金额',
      defaultValue: String(budget.total_amount),
    });
    if (amountStr === null) return;
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) { showToast('请输入正确的金额'); return; }

    try {
      await apiFetch(`/special-budgets/${budget.id}`, {
        method: 'PUT',
        body: JSON.stringify({ total_amount: amount }),
      });
      showToast({ message: '已更新', type: 'success' });
      loadBudgets();
    } catch (e: any) {
      showToast({ message: e.message, type: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await Dialog.confirm({
      title: '删除专项预算',
      content: '删除后，相关账单将不再归属该专项预算，但账单本身不会被删除。',
      confirmText: '删除',
      danger: true,
    });
    if (!confirmed) return;
    try {
      await apiFetch(`/special-budgets/${id}`, { method: 'DELETE' });
      showToast({ message: '已删除', type: 'success' });
      loadBudgets();
    } catch (e: any) {
      showToast({ message: e.message, type: 'error' });
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
      <DialogContainer />
      <NavBar title="专项预算" onBack={() => router.back()} />

      {loading ? (
        <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1, 2].map((i) => (
            <div key={i} className="skeleton" style={{ height: 100, borderRadius: 'var(--radius-lg)' }} />
          ))}
        </div>
      ) : budgets.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🎯</div>
          <p>还没有专项预算</p>
          <p style={{ fontSize: 12, marginTop: 4 }}>结婚、生娃等大项目可以单独跟踪</p>
        </div>
      ) : (
        <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {budgets.map((b) => {
            const spent = b.total_spent || 0;
            const ratio = b.total_amount > 0 ? spent / b.total_amount : 0;
            const remaining = Math.max(b.total_amount - spent, 0);

            return (
              <div
                key={b.id}
                onClick={() => router.push(`/special-budgets/${b.id}`)}
                className="pressable"
                style={{
                  background: 'var(--card-bg)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 16,
                  boxShadow: 'var(--shadow-sm)',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Edit & Delete buttons */}
                <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 6 }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleEdit(b); }}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: 13,
                      color: 'var(--primary)',
                      cursor: 'pointer',
                      padding: 4,
                    }}
                  >
                    编辑
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(b.id); }}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: 13,
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      padding: 4,
                    }}
                  >
                    ×
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 28 }}>{b.icon}</span>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 600 }}>{b.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      预算 {formatCurrency(b.total_amount)}
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <div style={{ height: 8, borderRadius: 4, backgroundColor: 'var(--border)', overflow: 'hidden', marginBottom: 8 }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min(ratio * 100, 100)}%`,
                    borderRadius: 4,
                    background: ratio > 1 ? 'var(--danger)' : ratio > 0.8 ? 'var(--gradient-warm)' : 'var(--gradient-dream)',
                    transition: 'width 0.3s ease',
                  }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    已花 {formatCurrency(spent)} ({Math.round(ratio * 100)}%)
                  </span>
                  <span style={{ color: remaining > 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 500 }}>
                    剩余 {formatCurrency(remaining)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add button */}
      <div style={{ padding: '16px' }}>
        <Button
          block
          onClick={handleAdd}
          icon={<IconPlus size={16} color="#fff" />}
        >
          新增专项预算
        </Button>
      </div>
    </div>
  );
}
