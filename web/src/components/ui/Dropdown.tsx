'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { IconChevronDown } from './icons';

interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
}

export default function Dropdown({ options, value, onChange, placeholder, style }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  const selected = options.find((o) => o.value === value);

  // Calculate panel position from trigger button rect
  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 6, left: rect.left });
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(() => {
      const handler = (e: Event) => {
        const target = e.target as Node;
        if (triggerRef.current?.contains(target)) return;
        if (panelRef.current?.contains(target)) return;
        setOpen(false);
      };
      document.addEventListener('touchend', handler, { passive: true });
      document.addEventListener('mousedown', handler);
      cleanupRef.current = () => {
        document.removeEventListener('touchend', handler);
        document.removeEventListener('mousedown', handler);
      };
    }, 10);

    const cleanupRef = { current: () => {} };

    return () => {
      clearTimeout(timer);
      cleanupRef.current();
    };
  }, [open]);

  const handleToggle = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  const handleSelect = useCallback((val: string) => {
    onChange(val);
    setOpen(false);
  }, [onChange]);

  const panel = open && pos && createPortal(
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        top: pos.top,
        left: pos.left,
        minWidth: triggerRef.current?.offsetWidth || 80,
        background: 'var(--card-bg)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border-light)',
        zIndex: 9999,
        overflow: 'hidden',
        animation: 'fadeInDown 200ms var(--ease-spring)',
      }}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => handleSelect(opt.value)}
          style={{
            display: 'block',
            width: '100%',
            padding: '10px 16px',
            border: 'none',
            background: opt.value === value ? 'var(--bg-secondary)' : 'transparent',
            color: opt.value === value ? 'var(--primary)' : 'var(--text)',
            fontSize: 'var(--font-size-sm)',
            textAlign: 'left',
            cursor: 'pointer',
            fontWeight: opt.value === value ? 600 : 400,
            whiteSpace: 'nowrap',
            outline: 'none',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>,
    document.body,
  );

  return (
    <div style={{ position: 'relative', display: 'inline-block', ...style }}>
      <button
        ref={triggerRef}
        onClick={handleToggle}
        className="pressable"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          background: open ? 'var(--bg-secondary)' : 'var(--card-bg)',
          border: '1.5px solid var(--border)',
          borderRadius: 'var(--radius-pill)',
          padding: '6px 14px',
          fontSize: 'var(--font-size-sm)',
          color: selected ? 'var(--text)' : 'var(--text-secondary)',
          cursor: 'pointer',
          outline: 'none',
          fontWeight: 500,
          whiteSpace: 'nowrap',
          transition: 'background var(--duration-fast)',
        }}
      >
        {selected?.label ?? placeholder ?? '选择'}
        <IconChevronDown
          size={14}
          style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform var(--duration-fast)',
          }}
        />
      </button>

      {panel}
    </div>
  );
}
