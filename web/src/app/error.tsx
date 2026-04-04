'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-family)',
      backgroundColor: 'var(--bg)',
    }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>😵</div>
      <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--danger)', margin: 0 }}>出错了</h1>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 8 }}>
        {error.message || '页面加载失败'}
      </p>
      <button
        onClick={reset}
        style={{
          marginTop: 20,
          padding: '10px 28px',
          borderRadius: 999,
          border: 'none',
          background: 'linear-gradient(135deg, #FF6B6B, #FFAB91)',
          color: '#fff',
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(255,107,107,0.3)',
        }}
      >
        重试
      </button>
    </div>
  );
}
