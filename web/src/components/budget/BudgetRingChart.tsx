'use client';

import dynamic from 'next/dynamic';
import { formatCurrency } from '@/lib/format';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

interface Props {
  totalBudget: number;
  totalSpent: number;
}

export default function BudgetRingChart({ totalBudget, totalSpent }: Props) {
  const remaining = Math.max(totalBudget - totalSpent, 0);
  const percentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
  const overBudget = percentage > 100;

  const option = {
    series: [
      {
        type: 'pie',
        radius: ['60%', '80%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        label: { show: false },
        emphasis: { disabled: true },
        data: [
          {
            value: totalSpent,
            name: '已花费',
            itemStyle: { color: overBudget ? 'var(--danger)' : '#FF6B6B' },
          },
          {
            value: remaining,
            name: '剩余',
            itemStyle: { color: '#F0E8E5' },
          },
        ],
      },
    ],
    tooltip: { show: false },
    animation: true,
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: 200 }}>
      <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
      }}>
        <div style={{
          fontSize: 28,
          fontWeight: 700,
          color: overBudget ? 'var(--danger)' : 'var(--text)',
        }}>
          {percentage}%
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          {formatCurrency(totalSpent)}
        </div>
      </div>
    </div>
  );
}
