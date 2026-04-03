'use client';

import { useEffect, useRef, useState } from 'react';

interface PWAInstallResult {
  canInstall: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  dismissed: boolean;
  promptInstall: () => Promise<void>;
  dismiss: () => void;
}

export function usePWAInstall(): PWAInstallResult {
  const deferredPrompt = useRef<any>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const isInstalled = typeof window !== 'undefined' &&
    (window.matchMedia('(display-mode: standalone)').matches ||
     (window.navigator as any).standalone === true);

  const isIOS = typeof window !== 'undefined' &&
    /iPad|iPhone|iPod/.test(navigator.userAgent);

  useEffect(() => {
    const saved = sessionStorage.getItem('pwa-install-dismissed');
    if (saved) setDismissed(true);

    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e;
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const promptInstall = async () => {
    if (!deferredPrompt.current) return;
    deferredPrompt.current.prompt();
    const result = await deferredPrompt.current.userChoice;
    if (result.outcome === 'accepted') {
      setCanInstall(false);
    }
    deferredPrompt.current = null;
  };

  const dismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('pwa-install-dismissed', '1');
  };

  return { canInstall, isInstalled, isIOS, dismissed, promptInstall, dismiss };
}
