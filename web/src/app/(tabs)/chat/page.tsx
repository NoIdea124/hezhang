'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Toast } from 'antd-mobile';
import { useAuthStore } from '@/stores/authStore';
import { apiFetch } from '@/lib/api';
import { formatCurrency, getCurrentMonth } from '@/lib/format';
import CategoryIcon from '@/components/common/CategoryIcon';
import ChatMessageList from '@/components/chat/ChatMessageList';
import ChatInput from '@/components/chat/ChatInput';
import type { Expense, ChatMessage, ChatResponse } from '@hezhang/shared';

export default function ChatPage() {
  const router = useRouter();
  const space = useAuthStore((s) => s.space);
  const [todayExpenses, setTodayExpenses] = useState<Expense[]>([]);
  const [monthTotal, setMonthTotal] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadTodayData();
  }, []);

  // Listen for WebSocket sync events
  useEffect(() => {
    const handler = (e: Event) => {
      const event = (e as CustomEvent).detail;
      if (event.type?.startsWith('expense:')) {
        loadTodayData();
      }
    };
    window.addEventListener('ws-sync', handler);
    return () => window.removeEventListener('ws-sync', handler);
  }, []);

  const loadTodayData = async () => {
    try {
      const month = getCurrentMonth();
      const res = await apiFetch<{ expenses: Expense[] }>(`/expenses?month=${month}`);
      const today = new Date().toISOString().split('T')[0];
      setTodayExpenses(res.expenses.filter((e) => e.expense_date === today));
      setMonthTotal(res.expenses.reduce((sum, e) => sum + e.amount, 0));
    } catch {
      // ignore
    }
  };

  const handleSend = useCallback(async (message: string) => {
    // Add user message
    const userMsg: ChatMessage = {
      id: crypto.randomUUID?.() ?? Math.random().toString(36).slice(2),
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setSending(true);

    try {
      const res = await apiFetch<ChatResponse>('/chat', {
        method: 'POST',
        body: JSON.stringify({ message }),
      });

      const aiMsg: ChatMessage = {
        id: crypto.randomUUID?.() ?? Math.random().toString(36).slice(2),
        role: 'assistant',
        content: res.reply,
        expense: res.expense,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);

      // Refresh data if expense was recorded/modified/deleted
      if (['record', 'delete', 'modify'].includes(res.intent)) {
        loadTodayData();
      }
    } catch (e: any) {
      Toast.show({ content: e.message || '发送失败' });
    } finally {
      setSending(false);
    }
  }, []);

  const todayTotal = todayExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      paddingBottom: 100,
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', padding: '56px 16px 12px' }}>
        <div style={{ fontSize: 18, fontWeight: 600 }}>
          🤝 {space?.name || '合账'}
        </div>
      </div>

      {/* Month Budget Card */}
      <div style={{ padding: '0 16px' }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)',
          borderRadius: 12,
          padding: 16,
          color: '#fff',
          marginBottom: 12,
        }}>
          <div style={{ fontSize: 13, opacity: 0.9 }}>
            {getCurrentMonth().replace('-', '年')}月支出
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, marginTop: 4 }}>
            {formatCurrency(monthTotal)}
          </div>
        </div>
      </div>

      {/* Today's Expenses */}
      {todayExpenses.length > 0 && (
        <div style={{ padding: '0 16px', marginBottom: 12 }}>
          <div style={{
            background: 'var(--card-bg)',
            borderRadius: 12,
            padding: 14,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>今日消费</span>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                {formatCurrency(todayTotal)}
              </span>
            </div>
            {todayExpenses.map((exp) => (
              <div key={exp.id} style={{
                display: 'flex',
                alignItems: 'center',
                padding: '6px 0',
              }}>
                <CategoryIcon name={exp.category} size={20} />
                <span style={{ flex: 1, marginLeft: 8, fontSize: 13 }}>
                  {exp.user_nickname}: {exp.note || exp.category}
                </span>
                <span style={{ fontWeight: 500, fontSize: 13 }}>
                  {formatCurrency(exp.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <ChatMessageList messages={messages} />

      {/* Welcome hint when no messages */}
      {messages.length === 0 && (
        <div style={{ padding: '0 16px', marginTop: 8 }}>
          <div style={{
            background: 'var(--card-bg)',
            borderRadius: 12,
            padding: 16,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>
              在下方输入框输入消费，AI 自动记账：
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                '"午饭 68"',
                '"打车去公司 23.5"',
                '"昨天超市买菜 156"',
                '"这个月花了多少"',
              ].map((hint) => (
                <span
                  key={hint}
                  onClick={() => handleSend(hint.replace(/"/g, ''))}
                  style={{
                    fontSize: 14,
                    color: 'var(--primary)',
                    cursor: 'pointer',
                    padding: '4px 0',
                  }}
                >
                  {hint}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Chat Input */}
      <ChatInput onSend={handleSend} loading={sending} />
    </div>
  );
}
