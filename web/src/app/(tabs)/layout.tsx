'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Toast } from 'antd-mobile';
import AppTabBar from '@/components/common/TabBar';
import OfflineBanner from '@/components/common/OfflineBanner';
import { useAuthStore } from '@/stores/authStore';
import { useWebSocket } from '@/hooks/useWebSocket';
import type { WsEvent } from '@hezhang/shared';

export default function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const token = useAuthStore((s) => s.token);
  const space = useAuthStore((s) => s.space);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    if (!token) {
      router.replace('/login');
    } else if (!space) {
      router.replace('/onboarding');
    }
  }, [hydrated, token, space, router, pathname]);

  const handleWsMessage = useCallback((event: WsEvent) => {
    switch (event.type) {
      case 'notification':
        Toast.show({ content: event.data.message });
        break;
      case 'expense:created':
      case 'expense:updated':
      case 'expense:deleted':
      case 'budget:updated':
      case 'budget:confirmed':
        // Dispatch a custom event so individual pages can listen and refresh
        window.dispatchEvent(new CustomEvent('ws-sync', { detail: event }));
        break;
    }
  }, []);

  // Only connect WebSocket when authenticated
  const shouldConnect = hydrated && !!token && !!space;

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 50, backgroundColor: 'var(--bg)' }}>
      <OfflineBanner />
      {shouldConnect && <WsConnector onMessage={handleWsMessage} />}
      {(!hydrated || !token || !space) ? (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg)',
        }}>
          <div style={{ fontSize: 40 }}>🤝</div>
        </div>
      ) : (
        <>
          {children}
          <AppTabBar />
        </>
      )}
    </div>
  );
}

// Separate component to conditionally use the hook
function WsConnector({ onMessage }: { onMessage: (event: WsEvent) => void }) {
  useWebSocket({ onMessage });
  return null;
}
