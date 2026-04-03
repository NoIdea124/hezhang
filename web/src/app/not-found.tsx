export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <h1 style={{ fontSize: 48, margin: 0, color: '#4F46E5' }}>404</h1>
      <p style={{ fontSize: 16, color: '#6B7280', marginTop: 8 }}>页面不存在</p>
      <a href="/" style={{ marginTop: 16, color: '#4F46E5', textDecoration: 'none' }}>
        返回首页
      </a>
    </div>
  );
}
