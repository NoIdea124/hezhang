'use client';

import { useEffect, useRef, useCallback } from 'react';
import type { WsEvent } from '@hezhang/shared';

function getWsUrl(): string {
  const env = process.env.NEXT_PUBLIC_WS_URL;
  // 如果是完整地址（ws:// 或 wss://）直接用
  if (env && (env.startsWith('ws://') || env.startsWith('wss://'))) return env;
  // 运行时根据当前页面地址推导（同 IP，端口 3001）
  if (typeof window === 'undefined') return 'ws://localhost:3001/ws';
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${proto}//${window.location.hostname}:3001/ws`;
}

interface UseWebSocketOptions {
  onMessage: (event: WsEvent) => void;
}

export function useWebSocket({ onMessage }: UseWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const retryCount = useRef(0);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  const connect = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Cleanup existing connection
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    const ws = new WebSocket(`${getWsUrl()}?token=${token}`);

    ws.onopen = () => {
      retryCount.current = 0;
    };

    ws.onmessage = (e) => {
      try {
        const event: WsEvent = JSON.parse(e.data);
        onMessageRef.current(event);
      } catch {
        // ignore malformed messages
      }
    };

    ws.onclose = (e) => {
      wsRef.current = null;
      // Don't reconnect if closed intentionally (4001 = auth error)
      if (e.code === 4001 || e.code === 4002) return;
      scheduleReconnect();
    };

    ws.onerror = () => {
      // onclose will fire after onerror
    };

    wsRef.current = ws;
  }, []);

  const scheduleReconnect = useCallback(() => {
    const delays = [3000, 6000, 12000, 30000];
    const delay = delays[Math.min(retryCount.current, delays.length - 1)];
    retryCount.current++;

    retryTimer.current = setTimeout(() => {
      connect();
    }, delay);
  }, [connect]);

  useEffect(() => {
    connect();

    return () => {
      if (retryTimer.current) clearTimeout(retryTimer.current);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);
}
