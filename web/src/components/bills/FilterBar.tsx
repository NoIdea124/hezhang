'use client';

import { Dropdown, type DropdownRef } from 'antd-mobile';
import { useRef } from 'react';
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
  const dropdownRef = useRef<DropdownRef>(null);
  const { categories } = useCategories();

  const currentMonth = getCurrentMonth();
  const months = [];
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
    <Dropdown ref={dropdownRef}>
      <Dropdown.Item key="category" title={category ? `${categories.find(c => c.name === category)?.icon || ''} ${category}` : '分类'}>
        <div style={{ padding: 8 }}>
          {categoryOptions.map((opt) => (
            <div
              key={opt.value}
              onClick={() => { onCategoryChange(opt.value); dropdownRef.current?.close(); }}
              style={{
                padding: '10px 12px',
                borderRadius: 6,
                cursor: 'pointer',
                backgroundColor: category === opt.value ? '#F0F0FF' : 'transparent',
                color: category === opt.value ? 'var(--primary)' : 'var(--text)',
                fontSize: 14,
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      </Dropdown.Item>
      <Dropdown.Item key="month" title={month === currentMonth ? '本月' : month.split('-')[1] + '月'}>
        <div style={{ padding: 8 }}>
          {monthOptions.map((opt) => (
            <div
              key={opt.value}
              onClick={() => { onMonthChange(opt.value); dropdownRef.current?.close(); }}
              style={{
                padding: '10px 12px',
                borderRadius: 6,
                cursor: 'pointer',
                backgroundColor: month === opt.value ? '#F0F0FF' : 'transparent',
                color: month === opt.value ? 'var(--primary)' : 'var(--text)',
                fontSize: 14,
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      </Dropdown.Item>
      <Dropdown.Item key="ownership" title={ownershipOptions.find(o => o.value === ownership)?.label || '归属'}>
        <div style={{ padding: 8 }}>
          {ownershipOptions.map((opt) => (
            <div
              key={opt.value}
              onClick={() => { onOwnershipChange(opt.value); dropdownRef.current?.close(); }}
              style={{
                padding: '10px 12px',
                borderRadius: 6,
                cursor: 'pointer',
                backgroundColor: ownership === opt.value ? '#F0F0FF' : 'transparent',
                color: ownership === opt.value ? 'var(--primary)' : 'var(--text)',
                fontSize: 14,
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      </Dropdown.Item>
    </Dropdown>
  );
}
