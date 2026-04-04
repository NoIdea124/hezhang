'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { showToast } from '@/lib/toast';
import { useAuthStore } from '@/stores/authStore';
import { apiFetch } from '@/lib/api';
import type { Space } from '@hezhang/shared';

type Mode = 'choose' | 'create' | 'join';

export default function OnboardingPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setSpace = useAuthStore((s) => s.setSpace);
  const [mode, setMode] = useState<Mode>('choose');
  const [spaceName, setSpaceName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [createdSpace, setCreatedSpace] = useState<Space | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    try {
      const res = await apiFetch<{ space: Space }>('/spaces', {
        method: 'POST',
        body: JSON.stringify({ name: spaceName || undefined }),
      });
      setSpace(res.space);
      setCreatedSpace(res.space);
    } catch (e: any) {
      showToast({ message: e.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!inviteCode) {
      showToast('请输入邀请码');
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch<{ space: Space }>('/spaces/join', {
        method: 'POST',
        body: JSON.stringify({ invite_code: inviteCode }),
      });
      setSpace(res.space);
      showToast({ message: '加入成功！', type: 'success' });
      router.replace('/chat');
    } catch (e: any) {
      showToast({ message: e.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const copyInviteCode = () => {
    if (createdSpace) {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(createdSpace.invite_code);
      }
      showToast({ message: '邀请码已复制', type: 'success' });
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    fontSize: 16,
    padding: '14px',
    border: '1.5px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--card-bg)',
    outline: 'none',
    color: 'var(--text)',
    WebkitAppearance: 'none',
    transition: 'border-color var(--duration-fast), box-shadow var(--duration-fast)',
  };

  // Created space - show invite code
  if (createdSpace) {
    return (
      <div style={containerStyle}>
        <div style={{ fontSize: 56, marginBottom: 8, animation: 'fadeInScale 500ms var(--ease-spring)' }}>🎉</div>
        <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>空间已创建！</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 14 }}>
          把邀请码发给你的伴侣，一起管账吧
        </p>

        <div style={cardStyle}>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>邀请码</p>
          <p style={{
            fontSize: 32,
            fontWeight: 700,
            letterSpacing: 6,
            marginBottom: 16,
          }}>
            <span className="gradient-text">{createdSpace.invite_code}</span>
          </p>
          <Button size="sm" variant="outline" onClick={copyInviteCode}>
            复制邀请码
          </Button>
        </div>

        <Button
          block
          size="lg"
          onClick={() => router.replace('/chat')}
          style={{ marginTop: 24, maxWidth: 360 }}
        >
          进入合账
        </Button>

        <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 12 }}>
          伴侣可以稍后加入，不影响你先使用
        </p>
      </div>
    );
  }

  // Choose mode
  if (mode === 'choose') {
    return (
      <div style={containerStyle}>
        <div style={{ fontSize: 56, marginBottom: 8, animation: 'float 3s ease-in-out infinite' }}>🤝</div>
        <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>
          你好，<span className="gradient-text">{user?.nickname}</span>
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 14 }}>
          创建一个共同空间，或加入伴侣的空间
        </p>

        <div style={{ width: '100%', maxWidth: 360 }}>
          <div
            onClick={() => setMode('create')}
            className="pressable"
            style={{
              ...cardStyle,
              cursor: 'pointer',
              marginBottom: 12,
              textAlign: 'left',
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 8 }}>🏠</div>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>创建空间</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              创建后把邀请码发给伴侣
            </p>
          </div>

          <div
            onClick={() => setMode('join')}
            className="pressable"
            style={{
              ...cardStyle,
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 8 }}>🔗</div>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>加入空间</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              输入伴侣发来的邀请码
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Create mode
  if (mode === 'create') {
    return (
      <div style={containerStyle}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🏠</div>
        <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 24 }}>创建共同空间</h2>

        <div style={{ width: '100%', maxWidth: 360 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 6, display: 'block', fontWeight: 500 }}>
              空间名称 (可选)
            </label>
            <input
              placeholder="我们的小家"
              value={spaceName}
              onChange={(e) => setSpaceName(e.target.value)}
              style={inputStyle}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,107,107,0.12)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          <Button block size="lg" loading={loading} onClick={handleCreate}>
            创建
          </Button>
          <Button
            block
            variant="text"
            onClick={() => setMode('choose')}
            style={{ marginTop: 8, color: 'var(--text-secondary)' }}
          >
            返回
          </Button>
        </div>
      </div>
    );
  }

  // Join mode
  return (
    <div style={containerStyle}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>🔗</div>
      <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 24 }}>加入伴侣的空间</h2>

      <div style={{ width: '100%', maxWidth: 360 }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 6, display: 'block', fontWeight: 500 }}>
            邀请码
          </label>
          <input
            placeholder="输入 6 位邀请码"
            maxLength={6}
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            style={{
              ...inputStyle,
              fontSize: 20,
              textAlign: 'center',
              letterSpacing: 8,
              fontWeight: 600,
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,107,107,0.12)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>

        <Button block size="lg" loading={loading} onClick={handleJoin}>
          加入
        </Button>
        <Button
          block
          variant="text"
          onClick={() => setMode('choose')}
          style={{ marginTop: 8, color: 'var(--text-secondary)' }}
        >
          返回
        </Button>
      </div>
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 24,
  backgroundColor: 'var(--bg)',
};

const cardStyle: React.CSSProperties = {
  background: 'var(--card-bg)',
  borderRadius: 'var(--radius-lg)',
  padding: 20,
  boxShadow: 'var(--shadow-md)',
  textAlign: 'center',
};
