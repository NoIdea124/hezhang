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
      {messages.map((msg) => (
        <div
          key={msg.id}
          style={{
            display: 'flex',
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            marginBottom: 12,
          }}
        >
          <div
            style={{
              maxWidth: '80%',
              padding: '10px 14px',
              borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              backgroundColor: msg.role === 'user' ? 'var(--primary)' : 'var(--card-bg)',
              color: msg.role === 'user' ? '#fff' : 'var(--text)',
              fontSize: 14,
              lineHeight: 1.6,
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              whiteSpace: 'pre-wrap',
            }}
          >
            {msg.content}

            {/* Expense card in AI reply */}
            {msg.role === 'assistant' && msg.expense && (
              <div style={{
                marginTop: 8,
                padding: '8px 10px',
                backgroundColor: 'rgba(79,70,229,0.06)',
                borderRadius: 8,
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
