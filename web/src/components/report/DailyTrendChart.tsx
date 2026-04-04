'use client';

import dynamic from 'next/dynamic';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

interface DailyTotal {
  date: string;
  amount: number;
}

interface Props {
  dailyTotals: DailyTotal[];
  prevMonthDailyTotals: DailyTotal[];
  month: string;
}

export default function DailyTrendChart({ dailyTotals, prevMonthDailyTotals, month }: Props) {
  const thisMonth: Record<number, number> = {};
  const prevMonth: Record<number, number> = {};

  for (const d of dailyTotals) {
    const day = parseInt(d.date.split('-')[2]);
    thisMonth[day] = d.amount;
  }
  for (const d of prevMonthDailyTotals) {
    const day = parseInt(d.date.split('-')[2]);
    prevMonth[day] = d.amount;
  }

  const [y, m] = month.split('-').map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any[]) => {
        let tip = `${params[0].axisValue}日`;
        for (const p of params) {
          tip += `<br/>${p.marker}${p.seriesName}: ¥${p.value || 0}`;
        }
        return tip;
      },
    },
    legend: {
      data: ['本月', '上月'],
      top: 0,
      textStyle: { fontSize: 12 },
    },
    grid: { left: 45, right: 15, top: 35, bottom: 25 },
    xAxis: {
      type: 'category',
      data: days.map(String),
      axisLabel: { fontSize: 10, interval: 4 },
      boundaryGap: false,
    },
    yAxis: {
      type: 'value',
      axisLabel: { fontSize: 10, formatter: (v: number) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v },
    },
    series: [
      {
        name: '本月',
        type: 'line',
        smooth: true,
        data: days.map((d) => thisMonth[d] || 0),
        lineStyle: { color: '#FF6B6B', width: 2 },
        itemStyle: { color: '#FF6B6B' },
        areaStyle: { color: 'rgba(255,107,107,0.08)' },
        showSymbol: false,
      },
      {
        name: '上月',
        type: 'line',
        smooth: true,
        data: days.map((d) => prevMonth[d] || 0),
        lineStyle: { color: '#F0E8E5', width: 1.5, type: 'dashed' },
        itemStyle: { color: '#F0E8E5' },
        showSymbol: false,
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: 220, width: '100%' }} />;
}
