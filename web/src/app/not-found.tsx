export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      backgroundColor: '#FFF8F6',
    }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
      <h1 style={{
        fontSize: 48,
        margin: 0,
        fontWeight: 700,
        background: 'linear-gradient(135deg, #FF6B6B, #FFAB91)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}>
        404
      </h1>
      <p style={{ fontSize: 16, color: '#8E8E9E', marginTop: 8 }}>页面不存在</p>
      <a href="/" style={{
        marginTop: 20,
        padding: '10px 28px',
        borderRadius: 999,
        background: 'linear-gradient(135deg, #FF6B6B, #FFAB91)',
        color: '#fff',
        textDecoration: 'none',
        fontSize: 14,
        fontWeight: 600,
        boxShadow: '0 4px 14px rgba(255,107,107,0.3)',
      }}>
        返回首页
      </a>
    </div>
  );
}
