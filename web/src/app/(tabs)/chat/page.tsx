'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { showToast } from '@/lib/toast';
import { useAuthStore } from '@/stores/authStore';
import { apiFetch } from '@/lib/api';
import { formatCurrency, getCurrentMonth } from '@/lib/format';
import CategoryIcon from '@/components/common/CategoryIcon';
import ChatMessageList from '@/components/chat/ChatMessageList';
import ChatInput from '@/components/chat/ChatInput';
import Popup from '@/components/ui/Popup';
import Button from '@/components/ui/Button';
import type { Expense, ChatMessage, ChatResponse, Reminder } from '@hezhang/shared';

export default function ChatPage() {
  const router = useRouter();
  const space = useAuthStore((s) => s.space);
  const user = useAuthStore((s) => s.user);
  const [todayExpenses, setTodayExpenses] = useState<Expense[]>([]);
  const [monthTotal, setMonthTotal] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showReminderPopup, setShowReminderPopup] = useState(false);
  const [reminderText, setReminderText] = useState('');
  const [reminderSending, setReminderSending] = useState(false);

  useEffect(() => {
    loadTodayData();
    loadReminders();
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const event = (e as CustomEvent).detail;
      if (event.type?.startsWith('expense:')) {
        loadTodayData();
      }
      if (event.type === 'reminder:created') {
        loadReminders();
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

  const loadReminders = async () => {
    try {
      const res = await apiFetch<{ reminders: Reminder[] }>('/reminders');
      setReminders(res.reminders);
    } catch {
      // ignore
    }
  };

  const dismissReminder = async (id: string) => {
    try {
      await apiFetch(`/reminders/${id}/read`, { method: 'PUT' });
      setReminders((prev) => prev.filter((r) => r.id !== id));
    } catch {
      // ignore
    }
  };

  const sendReminder = async () => {
    const trimmed = reminderText.trim();
    if (!trimmed || reminderSending) return;
    setReminderSending(true);
    try {
      await apiFetch('/reminders', {
        method: 'POST',
        body: JSON.stringify({ content: trimmed }),
      });
      setReminderText('');
      setShowReminderPopup(false);
      showToast({ message: '提醒已发送', type: 'success' });
    } catch (e: any) {
      showToast({ message: e.message || '发送失败', type: 'error' });
    } finally {
      setReminderSending(false);
    }
  };

  const handleSend = useCallback(async (message: string) => {
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

      if (['record', 'delete', 'modify'].includes(res.intent)) {
        loadTodayData();
      }
    } catch (e: any) {
      showToast(e.message || '发送失败');
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
      paddingBottom: 110,
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        padding: '56px 16px 12px',
      }}>
        <div style={{
          fontSize: 18,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
        }}>
          <span>🤝</span>
          <span className="gradient-text">{space?.name || '合账'}</span>
        </div>
      </div>

      {/* Reminders Banner */}
      {reminders.length > 0 && (
        <div style={{ padding: '0 16px', marginBottom: 8 }}>
          {reminders.map((r) => (
            <div
              key={r.id}
              style={{
                background: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                marginBottom: 6,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                animation: 'fadeInDown 300ms var(--ease-spring)',
              }}
            >
              <span style={{ fontSize: 20 }}>💌</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, color: '#E65100', fontWeight: 500 }}>
                  {r.from_nickname || '伴侣'} 提醒你
                </div>
                <div style={{ fontSize: 14, color: '#BF360C', marginTop: 2, wordBreak: 'break-word' }}>
                  {r.content}
                </div>
              </div>
              <button
                onClick={() => dismissReminder(r.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 12,
                  color: '#E65100',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-sm)',
                  flexShrink: 0,
                  fontWeight: 500,
                }}
              >
                知道了
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Month Budget Card */}
      <div style={{ padding: '0 16px' }}>
        <div style={{
          background: 'var(--gradient-primary)',
          borderRadius: 'var(--radius-lg)',
          padding: 16,
          color: '#fff',
          marginBottom: 12,
          boxShadow: '0 4px 16px rgba(255,107,107,0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <div style={{ fontSize: 13, opacity: 0.9 }}>
              {getCurrentMonth().replace('-', '年')}月支出
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, marginTop: 4 }}>
              {formatCurrency(monthTotal)}
            </div>
          </div>
          <button
            onClick={() => setShowReminderPopup(true)}
            style={{
              background: 'rgba(255,255,255,0.25)',
              border: 'none',
              borderRadius: 'var(--radius-pill)',
              padding: '8px 14px',
              color: '#fff',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            💌 提醒TA
          </button>
        </div>
      </div>

      {/* Today's Expenses */}
      {todayExpenses.length > 0 && (
        <div style={{ padding: '0 16px', marginBottom: 12 }}>
          <div style={{
            background: 'var(--card-bg)',
            borderRadius: 'var(--radius-lg)',
            padding: 14,
            boxShadow: 'var(--shadow-sm)',
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

      {/* Welcome hint */}
      {messages.length === 0 && (
        <div style={{ padding: '0 16px', marginTop: 8, animation: 'fadeInUp 400ms var(--ease-spring)' }}>
          <div style={{
            background: 'var(--card-bg)',
            borderRadius: 'var(--radius-lg)',
            padding: 16,
            boxShadow: 'var(--shadow-sm)',
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
                  className="pressable"
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

      {/* Reminder Popup */}
      <Popup
        visible={showReminderPopup}
        onClose={() => setShowReminderPopup(false)}
        height="auto"
      >
        <div style={{ padding: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 16px' }}>💌 提醒 TA</h3>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}>
            {/* Quick shortcuts */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['该记账啦', '别忘了买菜', '回家路上注意安全', '想你了'].map((q) => (
                <button
                  key={q}
                  onClick={() => setReminderText(q)}
                  className="pressable"
                  style={{
                    background: reminderText === q ? 'var(--gradient-primary)' : 'var(--bg-secondary)',
                    color: reminderText === q ? '#fff' : 'var(--text-secondary)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-pill)',
                    padding: '6px 14px',
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              padding: '0 14px',
              border: '1.5px solid var(--border-light)',
            }}>
              <input
                placeholder="输入提醒内容..."
                value={reminderText}
                onChange={(e) => setReminderText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') sendReminder(); }}
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontSize: 15,
                  padding: '12px 0',
                  color: 'var(--text)',
                }}
              />
            </div>
            <Button
              block
              size="lg"
              onClick={sendReminder}
              loading={reminderSending}
              disabled={!reminderText.trim()}
            >
              发送提醒
            </Button>
          </div>
        </div>
      </Popup>
    </div>
  );
}
