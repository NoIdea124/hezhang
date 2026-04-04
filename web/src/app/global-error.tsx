'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <html lang="zh-CN">
      <body style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
        margin: 0,
        backgroundColor: '#FFF8F6',
      }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>😵</div>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#EF5350', margin: 0 }}>出错了</h1>
        <p style={{ fontSize: 14, color: '#8E8E9E', marginTop: 8 }}>
          应用发生了意外错误
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
      </body>
    </html>
  );
}
