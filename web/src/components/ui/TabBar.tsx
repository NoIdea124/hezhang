'use client';

import React from 'react';

export interface TabItem {
  key: string;
  label: string;
  icon: (active: boolean) => React.ReactNode;
}

interface TabBarProps {
  items: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
  style?: React.CSSProperties;
}

export default function TabBar({ items, activeKey, onChange, style }: TabBarProps) {
  return (
    <div
      className="glass"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 'var(--z-sticky)' as any,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        height: 64,
        borderTop: '1px solid var(--border-light)',
        paddingBottom: 'env(safe-area-inset-bottom, 0)',
        ...style,
      }}
    >
      {items.map((item) => {
        const active = activeKey === item.key;
        return (
          <button
            key={item.key}
            onClick={() => onChange(item.key)}
            className="pressable"
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              background: 'none',
              border: 'none',
              padding: '6px 0',
              cursor: 'pointer',
              outline: 'none',
              transition: 'color var(--duration-fast)',
              color: active ? 'var(--primary)' : 'var(--text-tertiary)',
            }}
          >
            <span
              style={{
                transform: active ? 'scale(1.12)' : 'scale(1)',
                transition: 'transform var(--duration-normal) var(--ease-spring)',
                display: 'flex',
              }}
            >
              {item.icon(active)}
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: active ? 600 : 400,
                lineHeight: 1,
              }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
