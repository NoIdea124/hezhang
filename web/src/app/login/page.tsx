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
    padding: '14px',
    border: '1.5px solid #F0E8E5',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    outline: 'none',
    boxSizing: 'border-box',
    WebkitAppearance: 'none',
    color: '#2D2D3A',
    transition: 'border-color 150ms, box-shadow 150ms',
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      backgroundColor: '#FFF8F6',
    }}>
      {/* Decorative gradient blob */}
      <div style={{
        position: 'fixed',
        top: -100,
        right: -100,
        width: 300,
        height: 300,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,107,107,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'fixed',
        bottom: -80,
        left: -80,
        width: 250,
        height: 250,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(179,157,219,0.1) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ fontSize: 56, marginBottom: 8, animation: 'float 3s ease-in-out infinite' }}>🤝</div>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>
        <span className="gradient-text">合账</span>
      </h1>
      <p style={{ color: '#8E8E9E', marginBottom: 40, fontSize: 14 }}>
        AI 帮你们一起管钱
      </p>

      <div style={{ width: '100%', maxWidth: 360, position: 'relative', zIndex: 1 }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, color: '#8E8E9E', marginBottom: 6, display: 'block', fontWeight: 500 }}>
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
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#FF6B6B';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,107,107,0.12)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#F0E8E5';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>

        {error && (
          <div style={{
            color: '#EF5350',
            fontSize: 13,
            marginBottom: 12,
            textAlign: 'center',
            padding: '8px 12px',
            background: '#FFEBEE',
            borderRadius: 8,
            animation: 'fadeInUp 200ms var(--ease-spring)',
          }}>
            {error}
          </div>
        )}

        {!codeSent ? (
          <button
            type="button"
            onClick={handleSendCode}
            className="pressable"
            style={{
              width: '100%',
              height: 50,
              fontSize: 16,
              fontWeight: 600,
              color: '#fff',
              background: 'linear-gradient(135deg, #FF6B6B, #FFAB91)',
              border: 'none',
              borderRadius: 999,
              cursor: 'pointer',
              WebkitAppearance: 'none',
              touchAction: 'manipulation',
              boxShadow: '0 4px 14px rgba(255,107,107,0.3)',
            }}
          >
            发送验证码
          </button>
        ) : (
          <>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, color: '#8E8E9E', marginBottom: 6, display: 'block', fontWeight: 500 }}>
                验证码
              </label>
              <input
                placeholder="请输入验证码"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                style={{ ...inputStyle, textAlign: 'center', letterSpacing: 8, fontSize: 20, fontWeight: 600 }}
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
            <button
              type="button"
              onClick={handleLogin}
              disabled={loading}
              className="pressable"
              style={{
                width: '100%',
                height: 50,
                fontSize: 16,
                fontWeight: 600,
                color: '#fff',
                background: 'var(--gradient-primary)',
                border: 'none',
                borderRadius: 'var(--radius-pill)',
                cursor: loading ? 'not-allowed' : 'pointer',
                WebkitAppearance: 'none',
                touchAction: 'manipulation',
                opacity: loading ? 0.6 : 1,
                boxShadow: '0 4px 14px rgba(255,107,107,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              {loading && (
                <span style={{
                  width: 16,
                  height: 16,
                  border: '2px solid #fff',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                  display: 'inline-block',
                }} />
              )}
              {loading ? '登录中...' : '登录'}
            </button>
            <p style={{
              textAlign: 'center',
              marginTop: 12,
              fontSize: 13,
              color: '#B5B5C3',
            }}>
              MVP 模式验证码: 123456
            </p>
          </>
        )}
      </div>
    </div>
  );
}
