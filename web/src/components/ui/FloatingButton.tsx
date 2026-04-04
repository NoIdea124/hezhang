'use client';

import React from 'react';

interface FloatingButtonProps {
  onClick: () => void;
  icon?: React.ReactNode;
  label?: string;
  style?: React.CSSProperties;
}

export default function FloatingButton({ onClick, icon, label, style }: FloatingButtonProps) {
  return (
    <button
      onClick={onClick}
      className="pressable"
      style={{
        position: 'fixed',
        right: 20,
        bottom: 80,
        width: label ? 'auto' : 56,
        height: 56,
        borderRadius: 'var(--radius-pill)',
        border: 'none',
        background: 'var(--gradient-primary)',
        color: '#fff',
        fontSize: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: label ? '0 20px' : 0,
        cursor: 'pointer',
        boxShadow: '0 6px 20px rgba(255, 107, 107, 0.35)',
        outline: 'none',
        zIndex: 50,
        animation: 'fadeInScale 400ms var(--ease-spring)',
        ...style,
      }}
    >
      {icon}
      {label && <span style={{ fontSize: 15, fontWeight: 600 }}>{label}</span>}
    </button>
  );
}
