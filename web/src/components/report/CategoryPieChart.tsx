'use client';

import dynamic from 'next/dynamic';
import { getCategoryIcon } from '@hezhang/shared';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

const COLORS = ['#FF6B6B', '#80CBC4', '#FFD180', '#B39DDB', '#81D4FA', '#F48FB1', '#FFAB91', '#A5D6A7', '#CE93D8', '#90CAF9', '#BCAAA4'];

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
