const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

async function baseFetcher<T = unknown>(url: string, options?: RequestInit): Promise<T> {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;
  
  const res = await fetch(fullUrl, {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    const error: any = new Error(errorBody?.message ?? `Request failed with status ${res.status}`);
    error.status = res.status;
    error.response = { data: errorBody, status: res.status };
    throw error;
  }

  if (res.status === 204) return {} as T;
  return res.json();
}

/**
 * fetcher utility.
 * Callable directly for SWR, or use fetcher.get/post for imperative calls.
 */
export const fetcher = Object.assign(
  <T = unknown>(url: string, options?: RequestInit) => baseFetcher<T>(url, options),
  {
    get: <T = unknown>(url: string, options?: RequestInit) => 
      baseFetcher<T>(url, { ...options, method: 'GET' }),
    post: <T = unknown>(url: string, data?: any, options?: RequestInit) => 
      baseFetcher<T>(url, { 
        ...options, 
        method: 'POST', 
        body: JSON.stringify(data) 
      }),
  }
);
