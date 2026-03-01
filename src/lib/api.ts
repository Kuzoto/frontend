const BASE_URL = import.meta.env.VITE_API_URL ?? ''

class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
    this.name = 'ApiError'
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include', // send HttpOnly cookies
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
    ...init,
  })

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText)
    throw new ApiError(response.status, message)
  }

  // No content
  if (response.status === 204) return undefined as T

  return response.json() as Promise<T>
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}

// --- Dev stubs (remove when backend is ready) ---
export const authApi = {
  signup: async (data: { name: string; email: string; password: string }) => {
    // Stub: simulate network delay
    await new Promise((r) => setTimeout(r, 500))
    return { id: '1', name: data.name, email: data.email }
  },
  login: async (data: { email: string; password: string }) => {
    await new Promise((r) => setTimeout(r, 500))
    return { id: '1', name: 'Demo User', email: data.email }
  },
  logout: async () => {
    await new Promise((r) => setTimeout(r, 200))
  },
  forgotPassword: async (_email: string) => {
    await new Promise((r) => setTimeout(r, 400))
  },
  resendConfirmation: async (_email: string) => {
    await new Promise((r) => setTimeout(r, 400))
  },
}
