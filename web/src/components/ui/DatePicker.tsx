'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

interface DatePickerProps {
  visible: boolean;
  onClose: () => void;
  value?: Date;
  onChange: (date: Date) => void;
  min?: Date;
  max?: Date;
}

const ITEM_HEIGHT = 40;
const VISIBLE_ITEMS = 5;

export default function DatePicker({ visible, onClose, value, onChange, min, max }: DatePickerProps) {
  const now = value ?? new Date();
  const minDate = min ?? new Date(2020, 0, 1);
  const maxDate = max ?? new Date(2030, 11, 31);

  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [day, setDay] = useState(now.getDate());

  useEffect(() => {
    if (visible && value) {
      setYear(value.getFullYear());
      setMonth(value.getMonth() + 1);
      setDay(value.getDate());
    }
  }, [visible, value]);

  const years = Array.from(
    { length: maxDate.getFullYear() - minDate.getFullYear() + 1 },
    (_, i) => minDate.getFullYear() + i
  );
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handleConfirm = () => {
    const d = Math.min(day, daysInMonth);
    onChange(new Date(year, month - 1, d));
    onClose();
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 'var(--z-modal)' as any,
        backgroundColor: 'rgba(0,0,0,0.4)',
        animation: 'fadeIn 200ms',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'var(--card-bg)',
          borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
          animation: 'slideUp 300ms var(--ease-spring)',
          paddingBottom: 'env(safe-area-inset-bottom, 16px)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '14px 20px',
            borderBottom: '1px solid var(--border-light)',
          }}
        >
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              fontSize: 'var(--font-size-base)',
              cursor: 'pointer',
            }}
          >
            取消
          </button>
          <span style={{ fontWeight: 600, fontSize: 'var(--font-size-md)' }}>选择日期</span>
          <button
            onClick={handleConfirm}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              fontSize: 'var(--font-size-base)',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            确定
          </button>
        </div>

        {/* Wheels */}
        <div style={{ display: 'flex', height: ITEM_HEIGHT * VISIBLE_ITEMS, padding: '0 16px' }}>
          <ScrollWheel
            items={years.map((y) => ({ value: y, label: `${y}年` }))}
            value={year}
            onChange={setYear}
          />
          <ScrollWheel
            items={months.map((m) => ({ value: m, label: `${m}月` }))}
            value={month}
            onChange={setMonth}
          />
          <ScrollWheel
            items={days.map((d) => ({ value: d, label: `${d}日` }))}
            value={day}
            onChange={(v) => setDay(v)}
          />
        </div>
      </div>
    </div>
  );
}

// ── ScrollWheel ──

interface WheelItem {
  value: number;
  label: string;
}

function ScrollWheel({
  items,
  value,
  onChange,
}: {
  items: WheelItem[];
  value: number;
  onChange: (v: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);

  const scrollToValue = useCallback(
    (v: number, smooth = true) => {
      const idx = items.findIndex((i) => i.value === v);
      if (idx >= 0 && ref.current) {
        ref.current.scrollTo({
          top: idx * ITEM_HEIGHT,
          behavior: smooth ? 'smooth' : 'instant',
        });
      }
    },
    [items]
  );

  useEffect(() => {
    scrollToValue(value, false);
  }, [items.length]);

  const handleScroll = useCallback(() => {
    if (isScrolling.current) return;
    isScrolling.current = true;
    requestAnimationFrame(() => {
      if (ref.current) {
        const idx = Math.round(ref.current.scrollTop / ITEM_HEIGHT);
        const clamped = Math.max(0, Math.min(items.length - 1, idx));
        if (items[clamped]?.value !== value) {
          onChange(items[clamped].value);
        }
      }
      isScrolling.current = false;
    });
  }, [items, value, onChange]);

  const offset = Math.floor(VISIBLE_ITEMS / 2);

  return (
    <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
      {/* Highlight bar */}
      <div
        style={{
          position: 'absolute',
          top: offset * ITEM_HEIGHT,
          left: 4,
          right: 4,
          height: ITEM_HEIGHT,
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-sm)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div
        ref={ref}
        onScroll={handleScroll}
        className="no-scrollbar"
        style={{
          height: ITEM_HEIGHT * VISIBLE_ITEMS,
          overflowY: 'auto',
          scrollSnapType: 'y mandatory',
          WebkitOverflowScrolling: 'touch',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Padding */}
        <div style={{ height: offset * ITEM_HEIGHT }} />
        {items.map((item) => (
          <div
            key={item.value}
            style={{
              height: ITEM_HEIGHT,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'var(--font-size-md)',
              fontWeight: item.value === value ? 600 : 400,
              color: item.value === value ? 'var(--text)' : 'var(--text-tertiary)',
              scrollSnapAlign: 'start',
              transition: 'color 100ms, font-weight 100ms',
            }}
          >
            {item.label}
          </div>
        ))}
        <div style={{ height: offset * ITEM_HEIGHT }} />
      </div>
    </div>
  );
}
