'use client';

import React, { forwardRef, useId, useRef, useEffect } from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  autoHeight?: boolean;
  block?: boolean;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, autoHeight = false, block = true, style, ...rest }, ref) => {
    const id = useId();
    const innerRef = useRef<HTMLTextAreaElement | null>(null);

    const setRef = (el: HTMLTextAreaElement | null) => {
      innerRef.current = el;
      if (typeof ref === 'function') ref(el);
      else if (ref) (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = el;
    };

    useEffect(() => {
      if (autoHeight && innerRef.current) {
        const el = innerRef.current;
        el.style.height = 'auto';
        el.style.height = el.scrollHeight + 'px';
      }
    }, [rest.value, autoHeight]);

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
        <textarea
          ref={setRef}
          id={id}
          {...rest}
          style={{
            width: '100%',
            background: 'var(--card-bg)',
            border: error ? '1.5px solid var(--danger)' : '1.5px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            fontSize: 'var(--font-size-md)',
            color: 'var(--text)',
            outline: 'none',
            resize: autoHeight ? 'none' : 'vertical',
            minHeight: 80,
            lineHeight: 'var(--line-height)',
            transition: 'border-color var(--duration-fast), box-shadow var(--duration-fast)',
            WebkitAppearance: 'none',
            ...style,
          }}
          onFocus={(e) => {
            if (!error) {
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255, 107, 107, 0.12)';
            }
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error ? 'var(--danger)' : 'var(--border)';
            e.currentTarget.style.boxShadow = 'none';
            rest.onBlur?.(e);
          }}
          onInput={(e) => {
            if (autoHeight) {
              const el = e.currentTarget;
              el.style.height = 'auto';
              el.style.height = el.scrollHeight + 'px';
            }
            rest.onInput?.(e);
          }}
        />
        {error && (
          <p style={{ color: 'var(--danger)', fontSize: 'var(--font-size-xs)', marginTop: 4 }}>
            {error}
          </p>
        )}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';
export default TextArea;
