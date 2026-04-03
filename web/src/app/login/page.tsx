'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Toast } from 'antd-mobile';
import { useAuthStore } from '@/stores/authStore';
import { apiFetch } from '@/lib/api';
import type { User, Space } from '@hezhang/shared';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const setSpace = useAuthStore((s) => s.setSpace);
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    if (phone.length < 11) {
      Toast.show({ content: '请输入正确的手机号' });
      return;
    }
    try {
      await apiFetch('/auth/send-code', {
        method: 'POST',
        body: JSON.stringify({ phone }),
      });
      setCodeSent(true);
      Toast.show({ content: '验证码已发送 (MVP: 123456)' });
    } catch (e: any) {
      Toast.show({ content: e.message });
    }
  };

  const handleLogin = async () => {
    if (!code) {
      Toast.show({ content: '请输入验证码' });
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch<{ token: string; user: User; space: Space | null }>(
        '/auth/login',
        {
          method: 'POST',
          body: JSON.stringify({ phone, code }),
        }
      );
      setAuth(res.token, res.user);
      if (res.space) {
        setSpace(res.space);
        router.replace('/chat');
      } else {
        router.replace('/onboarding');
      }
    } catch (e: any) {
      Toast.show({ content: e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      backgroundColor: 'var(--bg)',
    }}>
      <div style={{ fontSize: 56, marginBottom: 8 }}>🤝</div>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>合账</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 40, fontSize: 14 }}>
        AI 帮你们一起管钱
      </p>

      <div style={{ width: '100%', maxWidth: 360 }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>
            手机号
          </label>
          <Input
            placeholder="请输入手机号"
            type="tel"
            maxLength={11}
            value={phone}
            onChange={setPhone}
            style={{
              '--font-size': '16px',
              padding: '12px',
              border: '1px solid var(--border)',
              borderRadius: 8,
              backgroundColor: 'var(--card-bg)',
            } as React.CSSProperties}
          />
        </div>

        {!codeSent ? (
          <Button
            block
            color="primary"
            size="large"
            onClick={handleSendCode}
            style={{ borderRadius: 8, height: 48 }}
          >
            发送验证码
          </Button>
        ) : (
          <>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>
                验证码
              </label>
              <Input
                placeholder="请输入验证码"
                type="number"
                maxLength={6}
                value={code}
                onChange={setCode}
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
              onClick={handleLogin}
              style={{ borderRadius: 8, height: 48 }}
            >
              登录
            </Button>
            <p
              style={{
                textAlign: 'center',
                marginTop: 12,
                fontSize: 13,
                color: 'var(--text-secondary)',
              }}
            >
              MVP 模式验证码: 123456
            </p>
          </>
        )}
      </div>
    </div>
  );
}
