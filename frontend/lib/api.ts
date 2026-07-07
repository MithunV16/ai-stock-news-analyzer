const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export function getApiUrl(path: string): string {
  const base = API_URL.replace(/\/$/, '');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}

export async function apiFetch<T>(path: string): Promise<T> {
  const response = await fetch(getApiUrl(path), {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message =
      typeof body?.error?.message === 'string'
        ? body.error.message
        : `Request failed: ${response.status}`;
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}
