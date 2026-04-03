'use client';

import { getCategoryIcon } from '@hezhang/shared';
import { formatCurrency } from '@/lib/format';
import type { BudgetCategory } from '@hezhang/shared';

interface Props {
  categories: BudgetCategory[];
  spending: Record<string, number>;
}

export default function CategoryProgress({ categories, spending }: Props) {
  const sorted = [...categories].sort((a, b) => {
    const ratioA = a.amount > 0 ? (spending[a.name] || 0) / a.amount : 0;
    const ratioB = b.amount > 0 ? (spending[b.name] || 0) / b.amount : 0;
    return ratioB - ratioA;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {sorted.map((cat) => {
        const spent = spending[cat.name] || 0;
        const ratio = cat.amount > 0 ? spent / cat.amount : 0;
        const percent = Math.round(ratio * 100);
        const barColor = ratio >= 1 ? '#EF4444' : ratio >= 0.8 ? '#F59E0B' : '#10B981';

        return (
          <div key={cat.name}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 13 }}>
                {getCategoryIcon(cat.name)} {cat.name}
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                {formatCurrency(spent)} / {formatCurrency(cat.amount)}
              </span>
            </div>
            <div style={{
              height: 8,
              borderRadius: 4,
              backgroundColor: '#E5E7EB',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${Math.min(percent, 100)}%`,
                borderRadius: 4,
                backgroundColor: barColor,
                transition: 'width 0.3s ease',
              }} />
            </div>
            {percent >= 80 && (
              <div style={{
                fontSize: 11,
                color: barColor,
                marginTop: 2,
              }}>
                {percent >= 100 ? '已超预算' : `已用 ${percent}%`}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
