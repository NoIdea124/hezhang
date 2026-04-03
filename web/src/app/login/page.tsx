'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  const [error, setError] = useState('');

  const cleanPhone = phone.replace(/\D/g, '');

  const handleSendCode = async () => {
    setError('');
    if (cleanPhone.length !== 11) {
      setError('请输入11位手机号');
      return;
    }
    try {
      await apiFetch('/auth/send-code', {
        method: 'POST',
        body: JSON.stringify({ phone: cleanPhone }),
      });
      setCodeSent(true);
    } catch (e: any) {
      setError(e.message || '发送失败');
    }
  };

  const handleLogin = async () => {
    setError('');
    if (!code) {
      setError('请输入验证码');
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch<{ token: string; user: User; space: Space | null }>(
        '/auth/login',
        {
          method: 'POST',
          body: JSON.stringify({ phone: cleanPhone, code }),
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
      setError(e.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    fontSize: 16,
    padding: '12px',
    border: '1px solid var(--border)',
    borderRadius: 8,
    backgroundColor: 'var(--card-bg)',
    outline: 'none',
    boxSizing: 'border-box',
    WebkitAppearance: 'none',
  };

  const buttonStyle: React.CSSProperties = {
    width: '100%',
    height: 48,
    fontSize: 16,
    fontWeight: 600,
    color: '#fff',
    backgroundColor: '#4F46E5',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    WebkitAppearance: 'none',
    touchAction: 'manipulation',
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
          <input
            placeholder="请输入手机号"
            type="tel"
            inputMode="numeric"
            maxLength={11}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={inputStyle}
          />
        </div>

        {error && (
          <div style={{ color: '#EF4444', fontSize: 13, marginBottom: 12, textAlign: 'center' }}>
            {error}
          </div>
        )}

        {!codeSent ? (
          <button
            type="button"
            onClick={handleSendCode}
            style={buttonStyle}
          >
            发送验证码
          </button>
        ) : (
          <>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>
                验证码
              </label>
              <input
                placeholder="请输入验证码"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                style={inputStyle}
              />
            </div>
            <button
              type="button"
              onClick={handleLogin}
              disabled={loading}
              style={{
                ...buttonStyle,
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? '登录中...' : '登录'}
            </button>
            <p style={{
              textAlign: 'center',
              marginTop: 12,
              fontSize: 13,
              color: 'var(--text-secondary)',
            }}>
              MVP 模式验证码: 123456
            </p>
          </>
        )}
      </div>
    </div>
  );
}
