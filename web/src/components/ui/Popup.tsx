'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';

interface PopupProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  height?: string | number;
}

export default function Popup({ visible, onClose, title, children, height }: PopupProps) {
  const [show, setShow] = useState(false);
  const [closing, setClosing] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visible) {
      setShow(true);
      setClosing(false);
      document.body.style.overflow = 'hidden';
    } else if (show) {
      setClosing(true);
      const t = setTimeout(() => {
        setShow(false);
        setClosing(false);
        document.body.style.overflow = '';
      }, 300);
      return () => clearTimeout(t);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [visible]);

  const handleOverlay = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === overlayRef.current) onClose();
    },
    [onClose]
  );

  if (!show) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlay}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 'var(--z-modal)' as any,
        backgroundColor: closing ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,0.4)',
        transition: 'background-color 300ms',
      }}
    >
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          maxHeight: '80vh',
          height: height,
          background: 'var(--card-bg)',
          borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
          animation: closing ? 'slideDown 300ms forwards' : 'slideUp 300ms var(--ease-spring)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Handle bar */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
          <div
            style={{
              width: 36,
              height: 4,
              borderRadius: 2,
              background: 'var(--border)',
            }}
          />
        </div>

        {title && (
          <div
            style={{
              padding: '8px 20px 12px',
              fontSize: 'var(--font-size-lg)',
              fontWeight: 600,
              textAlign: 'center',
            }}
          >
            {title}
          </div>
        )}

        <div style={{ flex: 1, overflow: 'auto', padding: '0 20px 20px' }}>{children}</div>
      </div>
    </div>
  );
}
