'use client';

import React from 'react';
import { IconChevronRight } from './icons';

// ── ListGroup ──

interface ListGroupProps {
  header?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function ListGroup({ header, children, style }: ListGroupProps) {
  return (
    <div style={{ marginBottom: 16, ...style }}>
      {header && (
        <div
          style={{
            padding: '12px 20px 8px',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            letterSpacing: 0.3,
          }}
        >
          {header}
        </div>
      )}
      <div
        style={{
          background: 'var(--card-bg)',
          borderRadius: 'var(--radius-lg)',
          margin: '0 16px',
          boxShadow: 'var(--shadow-sm)',
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ── ListItem ──

interface ListItemProps {
  children: React.ReactNode;
  extra?: React.ReactNode;
  description?: React.ReactNode;
  onClick?: () => void;
  clickable?: boolean;
  arrow?: boolean;
  prefix?: React.ReactNode;
  style?: React.CSSProperties;
}

export function ListItem({
  children,
  extra,
  description,
  onClick,
  clickable,
  arrow,
  prefix,
  style,
}: ListItemProps) {
  const isClickable = clickable ?? !!onClick;
  const showArrow = arrow ?? isClickable;

  return (
    <div
      onClick={onClick}
      className={isClickable ? 'pressable' : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 16px',
        borderBottom: '1px solid var(--border-light)',
        cursor: isClickable ? 'pointer' : 'default',
        ...style,
      }}
    >
      {prefix && <div style={{ flexShrink: 0 }}>{prefix}</div>}

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 'var(--font-size-base)',
            color: 'var(--text)',
            lineHeight: 1.4,
          }}
        >
          {children}
        </div>
        {description && (
          <div
            style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--text-tertiary)',
              marginTop: 2,
              lineHeight: 1.3,
            }}
          >
            {description}
          </div>
        )}
      </div>

      {extra && (
        <div
          style={{
            flexShrink: 0,
            fontSize: 'var(--font-size-sm)',
            color: 'var(--text-secondary)',
          }}
        >
          {extra}
        </div>
      )}

      {showArrow && (
        <IconChevronRight size={16} color="var(--text-tertiary)" style={{ flexShrink: 0 }} />
      )}
    </div>
  );
}
