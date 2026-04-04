function getApiUrl(): string {
  const env = process.env.NEXT_PUBLIC_API_URL;
  if (env) return env;
  if (typeof window === 'undefined') return 'http://localhost:3001/api';
  // 运行时根据当前页面地址推导后端地址（同 IP，端口 3001）
  return `${window.location.protocol}//${window.location.hostname}:3001/api`;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  // Only set Content-Type for requests with a body to avoid
  // Fastify rejecting empty-body requests with JSON content type
  if (options.body) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${getApiUrl()}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    if (res.status === 401) {
      // Token invalid/expired — clear auth and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('hezhang-auth');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new Error('登录已过期，请重新登录');
    }
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }

  return res.json();
}
