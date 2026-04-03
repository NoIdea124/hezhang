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
        fontFamily: 'system-ui, sans-serif',
        margin: 0,
      }}>
        <h1 style={{ fontSize: 48, margin: 0, color: '#EF4444' }}>出错了</h1>
        <p style={{ fontSize: 16, color: '#6B7280', marginTop: 8 }}>
          应用发生了意外错误
        </p>
        <button
          onClick={reset}
          style={{
            marginTop: 16,
            padding: '8px 24px',
            borderRadius: 8,
            border: 'none',
            backgroundColor: '#4F46E5',
            color: '#fff',
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          重试
        </button>
      </body>
    </html>
  );
}
