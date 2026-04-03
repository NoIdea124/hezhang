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
      fontFamily: 'system-ui, sans-serif',
    }}>
      <h1 style={{ fontSize: 48, margin: 0, color: '#EF4444' }}>出错了</h1>
      <p style={{ fontSize: 16, color: '#6B7280', marginTop: 8 }}>
        {error.message || '页面加载失败'}
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
    </div>
  );
}
