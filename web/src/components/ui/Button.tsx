'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'danger' | 'text';
  size?: 'sm' | 'md' | 'lg';
  block?: boolean;
  loading?: boolean;
  pill?: boolean;
  icon?: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  block = false,
  loading = false,
  pill = true,
  icon,
  children,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    border: 'none',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    fontWeight: 600,
    borderRadius: pill ? 'var(--radius-pill)' : 'var(--radius-md)',
    transition: 'all var(--duration-fast) var(--ease-spring)',
    WebkitTapHighlightColor: 'transparent',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    opacity: isDisabled ? 0.55 : 1,
    width: block ? '100%' : undefined,
    outline: 'none',
    position: 'relative',
    overflow: 'hidden',
  };

  const sizeMap = {
    sm: { padding: '8px 16px', fontSize: 13, minHeight: 34 },
    md: { padding: '10px 24px', fontSize: 15, minHeight: 42 },
    lg: { padding: '14px 32px', fontSize: 16, minHeight: 50 },
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      background: 'var(--gradient-primary)',
      color: '#fff',
      boxShadow: '0 4px 14px rgba(255, 107, 107, 0.3)',
    },
    outline: {
      background: 'transparent',
      color: 'var(--primary)',
      border: '1.5px solid var(--primary)',
    },
    ghost: {
      background: 'var(--bg-secondary)',
      color: 'var(--text)',
    },
    danger: {
      background: 'var(--danger-bg)',
      color: 'var(--danger)',
      border: '1.5px solid var(--danger)',
    },
    text: {
      background: 'transparent',
      color: 'var(--text-secondary)',
      padding: '4px 8px',
    },
  };

  const sz = sizeMap[size];

  return (
    <button
      {...rest}
      disabled={isDisabled}
      style={{
        ...baseStyle,
        ...variantStyles[variant],
        padding: sz.padding,
        fontSize: sz.fontSize,
        minHeight: sz.minHeight,
        ...style,
      }}
      onPointerDown={(e) => {
        if (!isDisabled) {
          (e.currentTarget as HTMLElement).style.transform = 'scale(0.96)';
        }
        rest.onPointerDown?.(e);
      }}
      onPointerUp={(e) => {
        (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
        rest.onPointerUp?.(e);
      }}
      onPointerLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
        rest.onPointerLeave?.(e);
      }}
    >
      {loading && (
        <span
          style={{
            width: sz.fontSize,
            height: sz.fontSize,
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            flexShrink: 0,
          }}
        />
      )}
      {!loading && icon}
      {children}
    </button>
  );
}
