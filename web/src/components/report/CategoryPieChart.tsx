'use client';

import dynamic from 'next/dynamic';
import { getCategoryIcon } from '@hezhang/shared';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316', '#14B8A6', '#6366F1', '#A3A3A3'];

interface Props {
  categoryTotals: Record<string, number>;
}

export default function CategoryPieChart({ categoryTotals }: Props) {
  const entries = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((s, [, v]) => s + v, 0);

  const data = entries.map(([name, value], i) => ({
    name: `${getCategoryIcon(name)} ${name}`,
    value: Math.round(value * 100) / 100,
    itemStyle: { color: COLORS[i % COLORS.length] },
  }));

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: (p: any) => `${p.name}: ¥${p.value} (${p.percent}%)`,
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      textStyle: { fontSize: 12 },
    },
    series: [{
      type: 'pie',
      radius: ['40%', '65%'],
      center: ['35%', '50%'],
      avoidLabelOverlap: true,
      label: { show: false },
      data,
    }],
  };

  if (entries.length === 0) {
    return <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-secondary)', fontSize: 13 }}>暂无数据</div>;
  }

  return <ReactECharts option={option} style={{ height: 220, width: '100%' }} />;
}
