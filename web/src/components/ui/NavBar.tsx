'use client';

import React from 'react';
import { IconBack } from './icons';

interface NavBarProps {
  title?: string;
  onBack?: () => void;
  right?: React.ReactNode;
  style?: React.CSSProperties;
}

export default function NavBar({ title, onBack, right, style }: NavBarProps) {
  return (
    <div
      className="glass safe-top"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 'var(--z-sticky)' as any,
        display: 'flex',
        alignItems: 'center',
        height: 44,
        padding: '0 4px',
        borderBottom: '1px solid var(--border-light)',
        ...style,
      }}
    >
      {/* Left */}
      <div style={{ width: 60, display: 'flex', alignItems: 'center' }}>
        {onBack && (
          <button
            onClick={onBack}
            className="pressable"
            style={{
              background: 'none',
              border: 'none',
              padding: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text)',
              cursor: 'pointer',
            }}
          >
            <IconBack size={22} />
          </button>
        )}
      </div>

      {/* Title */}
      <div
        style={{
          flex: 1,
          textAlign: 'center',
          fontSize: 'var(--font-size-md)',
          fontWeight: 600,
          color: 'var(--text)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {title}
      </div>

      {/* Right */}
      <div style={{ width: 60, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
        {right}
      </div>
    </div>
  );
}
