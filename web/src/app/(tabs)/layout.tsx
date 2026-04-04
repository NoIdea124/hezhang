'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AppTabBar from '@/components/common/TabBar';
import OfflineBanner from '@/components/common/OfflineBanner';
import { DialogContainer } from '@/components/ui/Dialog';
import { showToast } from '@/lib/toast';
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
        showToast(event.data.message);
        break;
      case 'expense:created':
      case 'expense:updated':
      case 'expense:deleted':
      case 'budget:updated':
      case 'budget:confirmed':
        window.dispatchEvent(new CustomEvent('ws-sync', { detail: event }));
        break;
    }
  }, []);

  const shouldConnect = hydrated && !!token && !!space;

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 'calc(64px + env(safe-area-inset-bottom, 0px))', backgroundColor: 'var(--bg)' }}>
      <OfflineBanner />
      <DialogContainer />
      {shouldConnect && <WsConnector onMessage={handleWsMessage} />}
      {(!hydrated || !token || !space) ? (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg)',
        }}>
          <div style={{ fontSize: 40, animation: 'float 2s ease-in-out infinite' }}>🤝</div>
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

function WsConnector({ onMessage }: { onMessage: (event: WsEvent) => void }) {
  useWebSocket({ onMessage });
  return null;
}
