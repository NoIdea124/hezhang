'use client';

import { useState } from 'react';
import Dropdown from '@/components/ui/Dropdown';
import { useCategories } from '@/hooks/useCategories';
import { getCurrentMonth } from '@/lib/format';

interface Props {
  category: string;
  month: string;
  ownership: string;
  onCategoryChange: (v: string) => void;
  onMonthChange: (v: string) => void;
  onOwnershipChange: (v: string) => void;
}

export default function FilterBar({
  category, month, ownership,
  onCategoryChange, onMonthChange, onOwnershipChange,
}: Props) {
  const { categories } = useCategories();

  const currentMonth = getCurrentMonth();
  const months: string[] = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const m = d.toISOString().slice(0, 7);
    months.push(m);
  }

  const categoryOptions = [
    { label: '全部分类', value: '' },
    ...categories.map((c) => ({ label: `${c.icon} ${c.name}`, value: c.name })),
  ];

  const monthOptions = months.map((m) => {
    const [y, mo] = m.split('-');
    return { label: m === currentMonth ? '本月' : `${parseInt(mo)}月`, value: m };
  });

  const ownershipOptions = [
    { label: '全部', value: '' },
    { label: '共同', value: 'shared' },
    { label: '个人', value: 'personal' },
  ];

  return (
    <div style={{
      display: 'flex',
      gap: 8,
      padding: '8px 16px',
      overflowX: 'auto',
    }}
    className="no-scrollbar"
    >
      <Dropdown options={categoryOptions} value={category} onChange={onCategoryChange} placeholder="分类" />
      <Dropdown options={monthOptions} value={month} onChange={onMonthChange} placeholder="月份" />
      <Dropdown options={ownershipOptions} value={ownership} onChange={onOwnershipChange} placeholder="归属" />
    </div>
  );
}
