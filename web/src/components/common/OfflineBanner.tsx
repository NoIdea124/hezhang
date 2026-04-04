'use client';

import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { IconWifiOff } from '@/components/ui/icons';

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
      background: 'var(--gradient-warm)',
      color: '#fff',
      textAlign: 'center',
      padding: '6px 16px',
      fontSize: 13,
      fontWeight: 500,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    }}>
      <IconWifiOff size={14} />
      当前无网络连接
    </div>
  );
}
