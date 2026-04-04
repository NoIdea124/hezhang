'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

interface DialogAction {
  text: string;
  onClick: () => void | Promise<void>;
  bold?: boolean;
  danger?: boolean;
}

interface DialogProps {
  visible: boolean;
  title?: string;
  content?: React.ReactNode;
  actions?: DialogAction[];
  onClose?: () => void;
}

export default function Dialog({ visible, title, content, actions, onClose }: DialogProps) {
  const [show, setShow] = useState(false);
  const [animating, setAnimating] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visible) {
      setShow(true);
      setAnimating(true);
      requestAnimationFrame(() => setAnimating(false));
    } else if (show) {
      setAnimating(true);
      const t = setTimeout(() => {
        setShow(false);
        setAnimating(false);
      }, 250);
      return () => clearTimeout(t);
    }
  }, [visible]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === overlayRef.current) onClose?.();
    },
    [onClose]
  );

  if (!show) return null;

  const isClosing = !visible && animating;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 'var(--z-modal)' as any,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        backgroundColor: isClosing ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,0.4)',
        backdropFilter: isClosing ? 'blur(0)' : 'blur(8px)',
        WebkitBackdropFilter: isClosing ? 'blur(0)' : 'blur(8px)',
        transition: 'background-color 250ms, backdrop-filter 250ms, -webkit-backdrop-filter 250ms',
      }}
    >
      <div
        style={{
          background: 'var(--card-bg)',
          borderRadius: 'var(--radius-lg)',
          width: '100%',
          maxWidth: 320,
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
          animation: isClosing
            ? 'fadeInScale 250ms reverse forwards'
            : 'fadeInScale 300ms var(--ease-spring)',
        }}
      >
        {/* Body */}
        <div style={{ padding: '28px 24px 20px', textAlign: 'center' }}>
          {title && (
            <h3
              style={{
                fontSize: 'var(--font-size-lg)',
                fontWeight: 600,
                color: 'var(--text)',
                marginBottom: content ? 12 : 0,
              }}
            >
              {title}
            </h3>
          )}
          {content && (
            <div style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {content}
            </div>
          )}
        </div>

        {/* Actions */}
        {actions && actions.length > 0 && (
          <div
            style={{
              borderTop: '1px solid var(--border-light)',
              display: 'flex',
            }}
          >
            {actions.map((a, i) => (
              <button
                key={i}
                onClick={a.onClick}
                className="pressable"
                style={{
                  flex: 1,
                  padding: '14px 8px',
                  border: 'none',
                  borderLeft: i > 0 ? '1px solid var(--border-light)' : 'none',
                  background: 'transparent',
                  fontSize: 'var(--font-size-md)',
                  fontWeight: a.bold ? 600 : 400,
                  color: a.danger ? 'var(--danger)' : 'var(--primary)',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                {a.text}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Event-based Imperative API ──
// Uses DOM custom events to avoid module-level variable issues with Next.js bundling

const DIALOG_EVENT = '__dialog_show__';
const DIALOG_CLOSE_EVENT = '__dialog_close__';

interface DialogState {
  title?: string;
  content?: React.ReactNode;
  actions: DialogAction[];
  inputId?: string;
}

export function DialogContainer() {
  const [state, setState] = useState<DialogState | null>(null);

  useEffect(() => {
    const handleShow = (e: Event) => {
      const detail = (e as CustomEvent<DialogState>).detail;
      setState(detail);
    };
    const handleClose = () => {
      setState(null);
    };
    window.addEventListener(DIALOG_EVENT, handleShow);
    window.addEventListener(DIALOG_CLOSE_EVENT, handleClose);
    return () => {
      window.removeEventListener(DIALOG_EVENT, handleShow);
      window.removeEventListener(DIALOG_CLOSE_EVENT, handleClose);
    };
  }, []);

  return (
    <Dialog
      visible={!!state}
      title={state?.title}
      content={state?.content}
      actions={state?.actions ?? []}
      onClose={() => setState(null)}
    />
  );
}

function showDialog(state: DialogState) {
  window.dispatchEvent(new CustomEvent(DIALOG_EVENT, { detail: state }));
}

function closeDialog() {
  window.dispatchEvent(new CustomEvent(DIALOG_CLOSE_EVENT));
}

Dialog.confirm = (options: {
  title?: string;
  content?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}) =>
  new Promise<boolean>((resolve) => {
    showDialog({
      title: options.title,
      content: options.content,
      actions: [
        {
          text: options.cancelText ?? '取消',
          onClick: () => {
            closeDialog();
            resolve(false);
          },
        },
        {
          text: options.confirmText ?? '确定',
          bold: true,
          danger: options.danger,
          onClick: () => {
            closeDialog();
            resolve(true);
          },
        },
      ],
    });
  });

Dialog.alert = (options: { title?: string; content?: React.ReactNode; confirmText?: string }) =>
  new Promise<void>((resolve) => {
    showDialog({
      title: options.title,
      content: options.content,
      actions: [
        {
          text: options.confirmText ?? '我知道了',
          bold: true,
          onClick: () => {
            closeDialog();
            resolve();
          },
        },
      ],
    });
  });

Dialog.prompt = (options: {
  title?: string;
  placeholder?: string;
  defaultValue?: string;
  confirmText?: string;
  cancelText?: string;
}) =>
  new Promise<string | null>((resolve) => {
    const inputId = '__dialog_prompt_' + Date.now();
    showDialog({
      title: options.title,
      inputId,
      content: (
        <input
          id={inputId}
          defaultValue={options.defaultValue ?? ''}
          placeholder={options.placeholder ?? ''}
          autoFocus
          style={{
            width: '100%',
            fontSize: 16,
            padding: '12px 14px',
            border: '1.5px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--card-bg)',
            outline: 'none',
            color: 'var(--text)',
            marginTop: 4,
            boxSizing: 'border-box',
            transition: 'border-color var(--duration-fast)',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--primary)';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,107,107,0.12)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
      ),
      actions: [
        {
          text: options.cancelText ?? '取消',
          onClick: () => {
            closeDialog();
            resolve(null);
          },
        },
        {
          text: options.confirmText ?? '确定',
          bold: true,
          onClick: () => {
            const el = document.getElementById(inputId) as HTMLInputElement | null;
            const val = el?.value ?? '';
            closeDialog();
            resolve(val);
          },
        },
      ],
    });
  });
