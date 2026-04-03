'use client';

import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export default function OfflineBanner() {
  const online = useOnlineStatus();

  if (online) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 9999,
      backgroundColor: '#F59E0B',
      color: '#fff',
      textAlign: 'center',
      padding: '6px 16px',
      fontSize: 13,
      fontWeight: 500,
    }}>
      当前无网络连接
    </div>
  );
}
