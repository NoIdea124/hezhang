'use client';

import { useEffect, useState } from 'react';
import { Button, Dialog, Popup, Toast } from 'antd-mobile';
import { LeftOutline, RightOutline } from 'antd-mobile-icons';
import { useRouter } from 'next/navigation';
import { useBudgetStore } from '@/stores/budgetStore';
import { useAuthStore } from '@/stores/authStore';
import { formatCurrency } from '@/lib/format';
import BudgetRingChart from '@/components/budget/BudgetRingChart';
import CategoryProgress from '@/components/budget/CategoryProgress';
import BudgetSetup from '@/components/budget/BudgetSetup';
import type { BudgetCreate } from '@hezhang/shared';

function getAdjacentMonth(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function formatMonth(month: string): string {
  return month.replace('-', '年') + '月';
}

export default function BudgetPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { budget, loading, month, setMonth, fetchBudget, createBudget, updateBudget, confirmBudget, deleteBudget } = useBudgetStore();
  const [showSetup, setShowSetup] = useState(false);
  const [setupLoading, setSetupLoading] = useState(false);

  useEffect(() => {
    fetchBudget();
  }, []);

  // Listen for WebSocket sync events
  useEffect(() => {
    const handler = (e: Event) => {
      const event = (e as CustomEvent).detail;
      if (event.type?.startsWith('budget:') || event.type?.startsWith('expense:')) {
        fetchBudget();
      }
    };
    window.addEventListener('ws-sync', handler);
    return () => window.removeEventListener('ws-sync', handler);
  }, [fetchBudget]);

  const handleCreate = async (data: BudgetCreate) => {
    setSetupLoading(true);
    try {
      await createBudget(data);
      setShowSetup(false);
      Toast.show({ content: '预算设置成功' });
    } catch (e: any) {
      Toast.show({ content: e.message || '设置失败' });
    } finally {
      setSetupLoading(false);
    }
  };

  const handleUpdate = async (data: BudgetCreate) => {
    if (!budget) return;
    setSetupLoading(true);
    try {
      await updateBudget(budget.id, { total_amount: data.total_amount, categories: data.categories });
      setShowSetup(false);
      Toast.show({ content: '预算已更新' });
    } catch (e: any) {
      Toast.show({ content: e.message || '更新失败' });
    } finally {
      setSetupLoading(false);
    }
  };

  const handleDelete = () => {
    if (!budget) return;
    Dialog.confirm({
      content: '确定删除本月预算吗？',
      onConfirm: async () => {
        try {
          await deleteBudget(budget.id);
          Toast.show({ content: '已删除' });
        } catch (e: any) {
          Toast.show({ content: e.message || '删除失败' });
        }
      },
    });
  };

  const handleConfirm = async () => {
    if (!budget) return;
    try {
      await confirmBudget(budget.id);
      Toast.show({ content: '已确认' });
    } catch (e: any) {
      Toast.show({ content: e.message || '确认失败' });
    }
  };

  const remaining = budget ? Math.max(budget.total_amount - budget.total_spent, 0) : 0;
  const myConfirmed = budget && user ? budget.confirmed_by.includes(user.id) : false;

  return (
    <div style={{ paddingTop: 16, paddingBottom: 80 }}>
      {/* Header with month navigation */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        padding: '44px 16px 16px',
      }}>
        <LeftOutline
          fontSize={18}
          onClick={() => setMonth(getAdjacentMonth(month, -1))}
          style={{ cursor: 'pointer', color: 'var(--text-secondary)' }}
        />
        <span style={{ fontSize: 18, fontWeight: 600 }}>
          {formatMonth(month)} 预算
        </span>
        <RightOutline
          fontSize={18}
          onClick={() => setMonth(getAdjacentMonth(month, 1))}
          style={{ cursor: 'pointer', color: 'var(--text-secondary)' }}
        />
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
          加载中...
        </div>
      )}

      {/* No budget state */}
      {!loading && !budget && (
        <div style={{ textAlign: 'center', padding: '60px 16px' }}>
          <div style={{ fontSize: 48 }}>📊</div>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', margin: '12px 0 24px' }}>
            本月还没有设置预算
          </p>
          <Button
            color="primary"
            size="large"
            onClick={() => setShowSetup(true)}
            style={{ borderRadius: 8, width: 200 }}
          >
            设置预算
          </Button>
          <Button
            fill="outline"
            size="large"
            onClick={() => router.push(`/report?month=${month}`)}
            style={{ borderRadius: 8, width: 200, marginTop: 12 }}
          >
            📊 查看消费报告
          </Button>
        </div>
      )}

      {/* Budget dashboard */}
      {!loading && budget && (
        <div style={{ padding: '0 16px' }}>
          {/* Confirmation banner */}
          {budget.status !== 'active' && (
            <div style={{
              padding: '10px 14px',
              borderRadius: 8,
              backgroundColor: '#FEF3C7',
              marginBottom: 12,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span style={{ fontSize: 13, color: '#92400E' }}>
                {!myConfirmed ? '预算待确认' : '等待伴侣确认'}
              </span>
              {!myConfirmed && (
                <Button
                  size="mini"
                  color="warning"
                  onClick={handleConfirm}
                  style={{ borderRadius: 6 }}
                >
                  确认
                </Button>
              )}
            </div>
          )}

          {/* Ring chart card */}
          <div style={{
            background: 'var(--card-bg)',
            borderRadius: 12,
            padding: 16,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            marginBottom: 12,
          }}>
            <BudgetRingChart totalBudget={budget.total_amount} totalSpent={budget.total_spent} />
            <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 8 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>已花费</div>
                <div style={{ fontSize: 16, fontWeight: 600, marginTop: 2 }}>
                  {formatCurrency(budget.total_spent)}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>剩余</div>
                <div style={{ fontSize: 16, fontWeight: 600, marginTop: 2, color: remaining > 0 ? '#10B981' : '#EF4444' }}>
                  {formatCurrency(remaining)}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>总预算</div>
                <div style={{ fontSize: 16, fontWeight: 600, marginTop: 2 }}>
                  {formatCurrency(budget.total_amount)}
                </div>
              </div>
            </div>
          </div>

          {/* Daily available card */}
          <div style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)',
            borderRadius: 12,
            padding: 16,
            color: '#fff',
            marginBottom: 12,
          }}>
            {budget.remaining_days > 0 ? (
              <>
                <div style={{ fontSize: 13, opacity: 0.9 }}>今日可花</div>
                <div style={{ fontSize: 28, fontWeight: 700, marginTop: 4 }}>
                  {formatCurrency(budget.daily_available)}
                </div>
                <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>
                  本月还剩 {budget.remaining_days} 天
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 13, opacity: 0.9 }}>本月已结束</div>
                <div style={{ fontSize: 20, fontWeight: 600, marginTop: 4 }}>
                  共支出 {formatCurrency(budget.total_spent)}
                </div>
              </>
            )}
          </div>

          {/* Overall progress bar */}
          <div style={{
            background: 'var(--card-bg)',
            borderRadius: 12,
            padding: 14,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            marginBottom: 12,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>总体进度</span>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                {Math.round((budget.total_spent / budget.total_amount) * 100)}%
              </span>
            </div>
            <div style={{ height: 10, borderRadius: 5, backgroundColor: '#E5E7EB', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${Math.min((budget.total_spent / budget.total_amount) * 100, 100)}%`,
                borderRadius: 5,
                backgroundColor: budget.total_spent >= budget.total_amount ? '#EF4444'
                  : budget.total_spent >= budget.total_amount * 0.8 ? '#F59E0B' : '#10B981',
                transition: 'width 0.3s ease',
              }} />
            </div>
          </div>

          {/* Category breakdown */}
          {budget.categories.length > 0 && (
            <div style={{
              background: 'var(--card-bg)',
              borderRadius: 12,
              padding: 14,
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              marginBottom: 12,
            }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>分类预算</div>
              <CategoryProgress
                categories={budget.categories}
                spending={budget.category_spending}
              />
            </div>
          )}

          {/* View report button */}
          <Button
            block
            color="primary"
            onClick={() => router.push(`/report?month=${month}`)}
            style={{ borderRadius: 8, marginTop: 16 }}
          >
            📊 查看消费报告
          </Button>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
            <Button
              block
              fill="outline"
              onClick={() => setShowSetup(true)}
              style={{ borderRadius: 8, flex: 1 }}
            >
              编辑预算
            </Button>
            <Button
              block
              color="danger"
              fill="outline"
              onClick={handleDelete}
              style={{ borderRadius: 8, flex: 1 }}
            >
              删除预算
            </Button>
          </div>
        </div>
      )}

      {/* Budget Setup Popup */}
      <Popup
        visible={showSetup}
        onMaskClick={() => setShowSetup(false)}
        position="bottom"
        bodyStyle={{
          height: '85vh',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
        }}
      >
        <BudgetSetup
          initialData={budget || undefined}
          onSubmit={budget ? handleUpdate : handleCreate}
          loading={setupLoading}
          onClose={() => setShowSetup(false)}
        />
      </Popup>
    </div>
  );
}
