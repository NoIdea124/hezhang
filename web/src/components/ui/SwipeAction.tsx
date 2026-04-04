'use client';

import React, { useRef, useState, useCallback } from 'react';

interface SwipeActionItem {
  key: string;
  text: string;
  color?: string;
  onClick: () => void;
}

interface SwipeActionProps {
  rightActions: SwipeActionItem[];
  children: React.ReactNode;
}

export default function SwipeAction({ rightActions, children }: SwipeActionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const offsetRef = useRef(0);
  const [offset, setOffset] = useState(0);
  const [swiping, setSwiping] = useState(false);

  const actionWidth = rightActions.length * 72;

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    offsetRef.current = offset;
    setSwiping(true);
  }, [offset]);

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!swiping) return;
      const dx = e.touches[0].clientX - startXRef.current;
      let next = offsetRef.current + dx;
      // Clamp
      next = Math.max(-actionWidth, Math.min(0, next));
      setOffset(next);
    },
    [swiping, actionWidth]
  );

  const onTouchEnd = useCallback(() => {
    setSwiping(false);
    // Snap open or closed
    if (offset < -actionWidth / 2) {
      setOffset(-actionWidth);
    } else {
      setOffset(0);
    }
  }, [offset, actionWidth]);

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      {/* Action buttons underneath */}
      <div
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'stretch',
        }}
      >
        {rightActions.map((action) => (
          <button
            key={action.key}
            onClick={() => {
              action.onClick();
              setOffset(0);
            }}
            style={{
              width: 72,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              background:
                action.color === 'danger' || action.color === 'red'
                  ? 'var(--danger)'
                  : action.color ?? 'var(--primary)',
            }}
          >
            {action.text}
          </button>
        ))}
      </div>

      {/* Content */}
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          transform: `translateX(${offset}px)`,
          transition: swiping ? 'none' : 'transform var(--duration-normal) var(--ease-spring)',
          background: 'var(--card-bg)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {children}
      </div>
    </div>
  );
}
