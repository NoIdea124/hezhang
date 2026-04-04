'use client';

import { useRef, useEffect } from 'react';
import type { ChatMessage } from '@hezhang/shared';
import CategoryIcon from '@/components/common/CategoryIcon';
import { formatCurrency } from '@/lib/format';

interface Props {
  messages: ChatMessage[];
}

export default function ChatMessageList({ messages }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  if (messages.length === 0) {
    return null;
  }

  return (
    <div style={{ padding: '0 16px' }}>
      {messages.map((msg, i) => (
        <div
          key={msg.id}
          style={{
            display: 'flex',
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            marginBottom: 12,
            animation: 'fadeInUp 300ms var(--ease-spring)',
            animationDelay: `${Math.min(i * 50, 200)}ms`,
            animationFillMode: 'both',
          }}
        >
          <div
            style={{
              maxWidth: '80%',
              padding: '10px 14px',
              borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              background: msg.role === 'user' ? 'var(--gradient-primary)' : 'var(--card-bg)',
              color: msg.role === 'user' ? '#fff' : 'var(--text)',
              fontSize: 14,
              lineHeight: 1.6,
              boxShadow: msg.role === 'user'
                ? '0 2px 8px rgba(255,107,107,0.2)'
                : 'var(--shadow-sm)',
              whiteSpace: 'pre-wrap',
            }}
          >
            {msg.content}

            {msg.role === 'assistant' && msg.expense && (
              <div style={{
                marginTop: 8,
                padding: '8px 10px',
                backgroundColor: 'rgba(255,107,107,0.06)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                <CategoryIcon name={msg.expense.category} size={24} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>
                    {formatCurrency(msg.expense.amount)}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    {msg.expense.note} · {msg.expense.category}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
