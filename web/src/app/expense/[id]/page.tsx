'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import NavBar from '@/components/ui/NavBar';
import Button from '@/components/ui/Button';
import Dialog from '@/components/ui/Dialog';
import { showToast } from '@/lib/toast';
import ExpenseForm from '@/components/expense/ExpenseForm';
import type { ExpenseFormData } from '@/components/expense/ExpenseForm';
import { apiFetch } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import type { Expense, Comment } from '@hezhang/shared';

export default function EditExpensePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const user = useAuthStore((s) => s.user);
  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [commentSending, setCommentSending] = useState(false);

  useEffect(() => {
    loadExpense();
    loadComments();
  }, [id]);

  // Listen for WS comment events
  useEffect(() => {
    const handler = (e: Event) => {
      const event = (e as CustomEvent).detail;
      if (event.type === 'comment:created' && event.data?.expense_id === id) {
        loadComments();
      }
    };
    window.addEventListener('ws-sync', handler);
    return () => window.removeEventListener('ws-sync', handler);
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

  const loadComments = useCallback(async () => {
    try {
      const res = await apiFetch<{ comments: Comment[] }>(`/expenses/${id}/comments`);
      setComments(res.comments);
    } catch {
      // ignore
    }
  }, [id]);

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

  const handleCommentSend = async () => {
    const trimmed = commentText.trim();
    if (!trimmed || commentSending) return;
    setCommentSending(true);
    try {
      await apiFetch(`/expenses/${id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content: trimmed }),
      });
      setCommentText('');
      await loadComments();
    } catch (e: any) {
      showToast({ message: e.message || '发送失败', type: 'error' });
    } finally {
      setCommentSending(false);
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
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh', paddingBottom: 80 }}>
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

      {/* Comments Section */}
      <div style={{ padding: '20px 16px 0' }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
          评论 {comments.length > 0 && `(${comments.length})`}
        </div>

        {comments.length === 0 && (
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
            还没有评论，说点什么吧
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
          {comments.map((c) => {
            const isMe = c.user_id === user?.id;
            return (
              <div key={c.id} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isMe ? 'flex-end' : 'flex-start',
              }}>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 2 }}>
                  {c.user_nickname || '匿名'}
                </span>
                <div style={{
                  background: isMe ? 'var(--gradient-primary)' : 'var(--card-bg)',
                  color: isMe ? '#fff' : 'var(--text)',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 14,
                  maxWidth: '80%',
                  boxShadow: 'var(--shadow-sm)',
                  wordBreak: 'break-word',
                }}>
                  {c.content}
                </div>
                <span style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 2 }}>
                  {new Date(c.created_at).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })}
        </div>

        {/* Comment Input */}
        <div style={{
          display: 'flex',
          gap: 8,
          alignItems: 'center',
        }}>
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-pill)',
            padding: '0 14px',
            border: '1.5px solid var(--border-light)',
          }}>
            <input
              placeholder="写评论..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCommentSend(); }}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: 14,
                padding: '10px 0',
                color: 'var(--text)',
              }}
            />
          </div>
          <button
            onClick={handleCommentSend}
            disabled={!commentText.trim() || commentSending}
            className="pressable"
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: commentText.trim() ? 'var(--gradient-primary)' : 'var(--border)',
              color: '#fff',
              border: 'none',
              cursor: commentText.trim() ? 'pointer' : 'default',
              flexShrink: 0,
              fontSize: 16,
            }}
          >
            {commentSending ? '...' : '↑'}
          </button>
        </div>
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
