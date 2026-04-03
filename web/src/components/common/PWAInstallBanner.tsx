'use client';

import { Button } from 'antd-mobile';
import { usePWAInstall } from '@/hooks/usePWAInstall';

export default function PWAInstallBanner() {
  const { canInstall, isInstalled, isIOS, dismissed, promptInstall, dismiss } = usePWAInstall();

  if (isInstalled || dismissed) return null;

  // Android / Chrome — can trigger install prompt
  if (canInstall) {
    return (
      <div style={{
        margin: '0 16px 12px',
        padding: 16,
        borderRadius: 12,
        background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
        color: '#fff',
      }}>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>
          添加到主屏幕
        </div>
        <div style={{ fontSize: 13, opacity: 0.9, marginBottom: 12 }}>
          安装应用获得更流畅的体验，像原生 App 一样使用
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            size="small"
            onClick={promptInstall}
            style={{
              borderRadius: 6,
              backgroundColor: '#fff',
              color: '#4F46E5',
              border: 'none',
              fontWeight: 600,
            }}
          >
            立即安装
          </Button>
          <Button
            size="small"
            onClick={dismiss}
            style={{
              borderRadius: 6,
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: '#fff',
              border: 'none',
            }}
          >
            稍后再说
          </Button>
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
        borderRadius: 12,
        background: 'var(--card-bg)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
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
