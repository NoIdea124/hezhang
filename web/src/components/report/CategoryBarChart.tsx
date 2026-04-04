'use client';

import dynamic from 'next/dynamic';
import { getCategoryIcon } from '@hezhang/shared';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

interface Props {
  categoryTotals: Record<string, number>;
}

export default function CategoryBarChart({ categoryTotals }: Props) {
  const entries = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

  if (entries.length === 0) {
    return <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-secondary)', fontSize: 13 }}>暂无数据</div>;
  }

  const categories = entries.map(([name]) => `${getCategoryIcon(name)} ${name}`);
  const values = entries.map(([, v]) => Math.round(v * 100) / 100);

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any[]) => `${params[0].name}: ¥${params[0].value}`,
    },
    grid: { left: 80, right: 20, top: 10, bottom: 25 },
    xAxis: {
      type: 'value',
      axisLabel: { fontSize: 10, formatter: (v: number) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v },
    },
    yAxis: {
      type: 'category',
      data: categories.reverse(),
      axisLabel: { fontSize: 11 },
    },
    series: [{
      type: 'bar',
      data: values.reverse(),
      barWidth: 16,
      itemStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 1, y2: 0,
          colorStops: [
            { offset: 0, color: '#FF6B6B' },
            { offset: 1, color: '#FFAB91' },
          ],
        },
        borderRadius: [0, 4, 4, 0],
      },
    }],
  };

  return <ReactECharts option={option} style={{ height: Math.max(entries.length * 40 + 40, 160), width: '100%' }} />;
}
