'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Toast } from 'antd-mobile';
import { useAuthStore } from '@/stores/authStore';
import { apiFetch } from '@/lib/api';
import type { Space, SpaceMember } from '@hezhang/shared';

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
      Toast.show({ content: e.message });
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!inviteCode) {
      Toast.show({ content: '请输入邀请码' });
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch<{ space: Space }>('/spaces/join', {
        method: 'POST',
        body: JSON.stringify({ invite_code: inviteCode }),
      });
      setSpace(res.space);
      Toast.show({ content: '加入成功！' });
      router.replace('/chat');
    } catch (e: any) {
      Toast.show({ content: e.message });
    } finally {
      setLoading(false);
    }
  };

  const copyInviteCode = () => {
    if (createdSpace) {
      navigator.clipboard.writeText(createdSpace.invite_code);
      Toast.show({ content: '邀请码已复制' });
    }
  };

  // Created space - show invite code
  if (createdSpace) {
    return (
      <div style={containerStyle}>
        <div style={{ fontSize: 56, marginBottom: 8 }}>🎉</div>
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
            color: 'var(--primary)',
            marginBottom: 16,
          }}>
            {createdSpace.invite_code}
          </p>
          <Button size="small" onClick={copyInviteCode}>
            复制邀请码
          </Button>
        </div>

        <Button
          block
          color="primary"
          size="large"
          onClick={() => router.replace('/chat')}
          style={{ borderRadius: 8, height: 48, marginTop: 24, maxWidth: 360 }}
        >
          进入合账
        </Button>

        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 12 }}>
          伴侣可以稍后加入，不影响你先使用
        </p>
      </div>
    );
  }

  // Choose mode
  if (mode === 'choose') {
    return (
      <div style={containerStyle}>
        <div style={{ fontSize: 56, marginBottom: 8 }}>🤝</div>
        <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>
          你好，{user?.nickname}
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 14 }}>
          创建一个共同空间，或加入伴侣的空间
        </p>

        <div style={{ width: '100%', maxWidth: 360 }}>
          <div
            onClick={() => setMode('create')}
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
            <label style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>
              空间名称 (可选)
            </label>
            <Input
              placeholder="我们的小家"
              value={spaceName}
              onChange={setSpaceName}
              style={{
                '--font-size': '16px',
                padding: '12px',
                border: '1px solid var(--border)',
                borderRadius: 8,
                backgroundColor: 'var(--card-bg)',
              } as React.CSSProperties}
            />
          </div>

          <Button
            block
            color="primary"
            size="large"
            loading={loading}
            onClick={handleCreate}
            style={{ borderRadius: 8, height: 48 }}
          >
            创建
          </Button>
          <Button
            block
            fill="none"
            onClick={() => setMode('choose')}
            style={{ marginTop: 8 }}
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
          <label style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>
            邀请码
          </label>
          <Input
            placeholder="输入 6 位邀请码"
            maxLength={6}
            value={inviteCode}
            onChange={(v) => setInviteCode(v.toUpperCase())}
            style={{
              '--font-size': '20px',
              padding: '12px',
              border: '1px solid var(--border)',
              borderRadius: 8,
              backgroundColor: 'var(--card-bg)',
              textAlign: 'center',
              letterSpacing: 4,
            } as React.CSSProperties}
          />
        </div>

        <Button
          block
          color="primary"
          size="large"
          loading={loading}
          onClick={handleJoin}
          style={{ borderRadius: 8, height: 48 }}
        >
          加入
        </Button>
        <Button
          block
          fill="none"
          onClick={() => setMode('choose')}
          style={{ marginTop: 8 }}
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
  borderRadius: 12,
  padding: 20,
  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  textAlign: 'center',
};
