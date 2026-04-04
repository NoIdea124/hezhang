'use client';

import React, { forwardRef, useId } from 'react';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix' | 'size'> {
  label?: string;
  error?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  block?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, prefix, suffix, block = true, style, className, ...rest }, ref) => {
    const id = useId();

    return (
      <div style={{ width: block ? '100%' : undefined }}>
        {label && (
          <label
            htmlFor={id}
            style={{
              display: 'block',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--text-secondary)',
              marginBottom: 6,
              fontWeight: 500,
            }}
          >
            {label}
          </label>
        )}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'var(--card-bg)',
            border: error ? '1.5px solid var(--danger)' : '1.5px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '0 14px',
            transition: 'border-color var(--duration-fast), box-shadow var(--duration-fast)',
            minHeight: 48,
            ...style,
          }}
          onFocusCapture={(e) => {
            if (!error) {
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255, 107, 107, 0.12)';
            }
          }}
          onBlurCapture={(e) => {
            e.currentTarget.style.borderColor = error ? 'var(--danger)' : 'var(--border)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {prefix && (
            <span style={{ color: 'var(--text-secondary)', flexShrink: 0 }}>{prefix}</span>
          )}
          <input
            ref={ref}
            id={id}
            {...rest}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: 'var(--font-size-md)',
              color: 'var(--text)',
              padding: '12px 0',
              width: '100%',
              WebkitAppearance: 'none',
              MozAppearance: 'textfield',
            }}
          />
          {suffix && (
            <span style={{ color: 'var(--text-secondary)', flexShrink: 0 }}>{suffix}</span>
          )}
        </div>
        {error && (
          <p style={{ color: 'var(--danger)', fontSize: 'var(--font-size-xs)', marginTop: 4 }}>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
