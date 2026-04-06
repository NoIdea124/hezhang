'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/ui/NavBar';
import { showToast } from '@/lib/toast';
import { apiFetch } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import type { Feedback } from '@hezhang/shared';

export default function FeedbackPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const loadFeedback = useCallback(async () => {
    try {
      const res = await apiFetch<{ feedback: Feedback[] }>('/feedback');
      setFeedbackList(res.feedback);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeedback();
  }, [loadFeedback]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    try {
      await apiFetch('/feedback', {
        method: 'POST',
        body: JSON.stringify({ content: trimmed }),
      });
      setText('');
      showToast({ message: '反馈已提交', type: 'success' });
      await loadFeedback();
    } catch (e: any) {
      showToast({ message: e.message || '提交失败', type: 'error' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <NavBar title="产品反馈" onBack={() => router.back()} />

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton" style={{ height: 60, borderRadius: 'var(--radius-sm)' }} />
            ))}
          </div>
        ) : feedbackList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>💡</div>
            <p style={{ fontSize: 14 }}>还没有反馈，来提第一个建议吧</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {feedbackList.map((fb) => {
              const isMe = fb.user_id === user?.id;
              return (
                <div key={fb.id} style={{
                  background: 'var(--card-bg)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 14px',
                  boxShadow: 'var(--shadow-sm)',
                  borderLeft: isMe ? '3px solid var(--primary)' : '3px solid var(--border)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: isMe ? 'var(--primary)' : 'var(--text)' }}>
                      {fb.user_nickname || '匿名用户'}
                      {isMe && ' (我)'}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                      {new Date(fb.created_at).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--text)', margin: 0, lineHeight: 1.5, wordBreak: 'break-word' }}>
                    {fb.content}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{
        padding: '10px 16px',
        paddingBottom: 'calc(10px + env(safe-area-inset-bottom, 0px))',
        borderTop: '1px solid var(--border-light)',
        background: 'var(--card-bg)',
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
            placeholder="写下你的建议或反馈..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
            maxLength={500}
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
          onClick={handleSend}
          disabled={!text.trim() || sending}
          className="pressable"
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: text.trim() ? 'var(--gradient-primary)' : 'var(--border)',
            color: '#fff',
            border: 'none',
            cursor: text.trim() ? 'pointer' : 'default',
            flexShrink: 0,
            fontSize: 16,
          }}
        >
          {sending ? '...' : '↑'}
        </button>
      </div>
    </div>
  );
}
