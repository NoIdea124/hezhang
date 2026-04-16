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
import { useAuthStore } from '@/stores/authStore';
import { getCurrentMonth, formatCurrency } from '@/lib/format';
import type { Expense, Comment } from '@hezhang/shared';

const COMMENT_READ_KEY = 'hezhang_comment_read';

function getCommentReadMap(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(COMMENT_READ_KEY) || '{}');
  } catch {
    return {};
  }
}

function markCommentRead(expenseId: string) {
  const map = getCommentReadMap();
  map[expenseId] = new Date().toISOString();
  localStorage.setItem(COMMENT_READ_KEY, JSON.stringify(map));
}

interface CommentNotification {
  id: string;
  expenseId: string;
  nickname: string;
  content: string;
  expenseLabel: string;
}

export default function BillsPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [month, setMonth] = useState(getCurrentMonth());
  const [ownership, setOwnership] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [commentNotifs, setCommentNotifs] = useState<CommentNotification[]>([]);
  const [commentReadMap, setCommentReadMap] = useState<Record<string, string>>({});

  useEffect(() => {
    setCommentReadMap(getCommentReadMap());
  }, []);

  // Listen for navigation back from expense detail to refresh read state
  useEffect(() => {
    const handleFocus = () => {
      setCommentReadMap(getCommentReadMap());
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

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
      // Show comment notification banner for comments from others
      if (event.type === 'comment:created') {
        const comment = event.data as Comment;
        if (comment.user_id !== user?.id) {
          setCommentNotifs((prev) => [{
            id: comment.id,
            expenseId: comment.expense_id,
            nickname: comment.user_nickname || '伴侣',
            content: comment.content,
            expenseLabel: comment.expense_note || comment.expense_category || '账单',
          }, ...prev]);
          // Also refresh list to update comment counts
          loadExpenses();
          // Auto-dismiss after 8s
          setTimeout(() => {
            setCommentNotifs((prev) => prev.filter((n) => n.id !== comment.id));
          }, 8000);
        }
      }
    };
    window.addEventListener('ws-sync', handler);
    return () => window.removeEventListener('ws-sync', handler);
  }, [loadExpenses, user?.id]);

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

  const dismissNotif = (id: string) => {
    setCommentNotifs((prev) => prev.filter((n) => n.id !== id));
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

      {/* Comment notification banners */}
      {commentNotifs.length > 0 && (
        <div style={{ padding: '0 16px 8px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {commentNotifs.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                dismissNotif(n.id);
                markCommentRead(n.expenseId);
                setCommentReadMap(getCommentReadMap());
                router.push(`/expense/${n.expenseId}`);
              }}
              className="pressable"
              style={{
                background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                animation: 'fadeInDown 300ms var(--ease-spring)',
              }}
            >
              <span style={{ fontSize: 18 }}>💬</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: '#1565C0', fontWeight: 500 }}>
                  {n.nickname} 评论了「{n.expenseLabel}」
                </div>
                <div style={{
                  fontSize: 12,
                  color: '#1976D2',
                  marginTop: 2,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {n.content}
                </div>
              </div>
              <span style={{ fontSize: 12, color: '#1976D2', flexShrink: 0 }}>查看 &gt;</span>
            </div>
          ))}
        </div>
      )}

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
        <ExpenseList
          expenses={expenses}
          onDelete={(id) => setDeleteConfirm(id)}
          commentReadMap={commentReadMap}
        />
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
