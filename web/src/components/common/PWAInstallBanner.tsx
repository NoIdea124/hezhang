'use client';

import Button from '@/components/ui/Button';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { IconDownload } from '@/components/ui/icons';

export default function PWAInstallBanner() {
  const { canInstall, isInstalled, isIOS, dismissed, promptInstall, dismiss } = usePWAInstall();

  if (isInstalled || dismissed) return null;

  // Android / Chrome — can trigger install prompt
  if (canInstall) {
    return (
      <div style={{
        margin: '0 16px 12px',
        padding: 16,
        borderRadius: 'var(--radius-lg)',
        background: 'var(--gradient-primary)',
        color: '#fff',
      }}>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>
          添加到主屏幕
        </div>
        <div style={{ fontSize: 13, opacity: 0.9, marginBottom: 12 }}>
          安装应用获得更流畅的体验，像原生 App 一样使用
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={promptInstall}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: '#fff',
              color: 'var(--primary)',
              border: 'none',
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <IconDownload size={14} color="var(--primary)" />
            立即安装
          </button>
          <button
            onClick={dismiss}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: '#fff',
              border: 'none',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            稍后再说
          </button>
        </div>
      </div>
    );
  }

  // iOS — show manual instructions
  if (isIOS) {
    return (
      <div style={{
        margin: '0 16px 12px',
        padding: 16,
        borderRadius: 'var(--radius-lg)',
        background: 'var(--card-bg)',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>添加到主屏幕</div>
          <span
            onClick={dismiss}
            style={{ fontSize: 12, color: 'var(--text-secondary)', cursor: 'pointer' }}
          >
            关闭
          </span>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.6 }}>
          1. 点击 Safari 底部的 <strong>分享</strong> 按钮 (方框+箭头)<br />
          2. 滚动找到 <strong>"添加到主屏幕"</strong><br />
          3. 点击 <strong>"添加"</strong> 即可
        </div>
      </div>
    );
  }

  return null;
}
