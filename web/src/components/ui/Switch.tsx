'use client';

import React from 'react';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  style?: React.CSSProperties;
}

export default function Switch({ checked, onChange, disabled = false, style }: SwitchProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      style={{
        position: 'relative',
        width: 50,
        height: 30,
        borderRadius: 15,
        border: 'none',
        padding: 0,
        cursor: disabled ? 'not-allowed' : 'pointer',
        background: checked ? 'var(--gradient-primary)' : 'var(--border)',
        transition: 'background var(--duration-normal) var(--ease-smooth)',
        outline: 'none',
        flexShrink: 0,
        opacity: disabled ? 0.5 : 1,
        WebkitTapHighlightColor: 'transparent',
        ...style,
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 3,
          left: checked ? 23 : 3,
          width: 24,
          height: 24,
          borderRadius: 12,
          background: '#fff',
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
          transition: 'left var(--duration-normal) var(--ease-spring)',
        }}
      />
    </button>
  );
}
