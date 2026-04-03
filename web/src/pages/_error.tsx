import type { NextPageContext } from 'next';

function CustomError({ statusCode }: { statusCode?: number }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <h1 style={{ fontSize: 48, margin: 0, color: '#EF4444' }}>
        {statusCode || '错误'}
      </h1>
      <p style={{ fontSize: 16, color: '#6B7280', marginTop: 8 }}>
        页面加载失败
      </p>
      <a href="/" style={{ marginTop: 16, color: '#4F46E5', textDecoration: 'none' }}>
        返回首页
      </a>
    </div>
  );
}

CustomError.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default CustomError;
