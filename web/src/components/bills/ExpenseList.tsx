'use client';

import { useRouter } from 'next/navigation';
import SwipeAction from '@/components/ui/SwipeAction';
import CategoryIcon from '@/components/common/CategoryIcon';
import { formatCurrency, formatDate } from '@/lib/format';
import type { Expense } from '@hezhang/shared';

interface Props {
  expenses: Expense[];
  onDelete: (id: string) => void;
  /** Map of expenseId → last viewed timestamp (ISO). If absent, never viewed. */
  commentReadMap?: Record<string, string>;
}

export default function ExpenseList({ expenses, onDelete, commentReadMap }: Props) {
  const router = useRouter();

  if (expenses.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '60px 0',
        color: 'var(--text-secondary)',
        animation: 'fadeInUp 300ms var(--ease-spring)',
      }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>📭</div>
        <p>暂无消费记录</p>
      </div>
    );
  }

  const groups: { date: string; items: Expense[]; total: number }[] = [];
  let currentDate = '';

  for (const exp of expenses) {
    if (exp.expense_date !== currentDate) {
      currentDate = exp.expense_date;
      groups.push({ date: currentDate, items: [], total: 0 });
    }
    const group = groups[groups.length - 1];
    group.items.push(exp);
    group.total += exp.amount;
  }

  return (
    <div>
      {groups.map((group) => (
        <div key={group.date} style={{ marginBottom: 4 }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '12px 16px 6px',
            fontSize: 13,
            color: 'var(--text-secondary)',
          }}>
            <span>{formatDate(group.date)}</span>
            <span>合计 {formatCurrency(group.total)}</span>
          </div>

          {group.items.map((exp) => {
            // Determine if there's an unread comment from others
            const hasUnread = commentReadMap
              && exp.latest_other_comment_at
              && (!commentReadMap[exp.id] || commentReadMap[exp.id] < exp.latest_other_comment_at);

            return (
              <SwipeAction
                key={exp.id}
                rightActions={[{
                  key: 'delete',
                  text: '删除',
                  color: 'danger',
                  onClick: () => onDelete(exp.id),
                }]}
              >
                <div
                  onClick={() => router.push(`/expense/${exp.id}`)}
                  className="pressable"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px 16px',
                    backgroundColor: 'var(--card-bg)',
                    cursor: 'pointer',
                    borderBottom: '1px solid var(--border-light)',
                    position: 'relative',
                  }}
                >
                  <CategoryIcon name={exp.category} size={28} />
                  <div style={{ flex: 1, marginLeft: 12 }}>
                    <div style={{ fontSize: 15, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                      {exp.note || exp.category}
                      {hasUnread && (
                        <span style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: 'var(--danger)',
                          display: 'inline-block',
                          flexShrink: 0,
                        }} />
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                      {exp.user_nickname}
                      {exp.ownership === 'personal' && (
                        <span style={{ marginLeft: 6, color: 'var(--warning)', fontSize: 11 }}>
                          个人
                        </span>
                      )}
                      {exp.special_budget_name && (
                        <span style={{ marginLeft: 6, color: 'var(--accent-lavender)', fontSize: 11 }}>
                          🎯{exp.special_budget_name}
                        </span>
                      )}
                      {(exp.comment_count ?? 0) > 0 && (
                        <span style={{ marginLeft: 6, fontSize: 11, color: 'var(--primary)' }}>
                          💬{exp.comment_count}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>
                    {formatCurrency(exp.amount)}
                  </div>
                </div>
              </SwipeAction>
            );
          })}
        </div>
      ))}
    </div>
  );
}
