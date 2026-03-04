import type { AuthResponse } from '@/types'

const BASE_URL = import.meta.env.VITE_API_URL ?? ''

class ApiError extends Error {
  status: number
  errors: Record<string, string> | null
  constructor(status: number, message: string, errors: Record<string, string> | null = null) {
    super(message)
    this.status = status
    this.errors = errors
    this.name = 'ApiError'
  }
}

function getAuthStore() {
  const raw = localStorage.getItem('auth-storage')
  if (!raw) return null
  try {
    return JSON.parse(raw)?.state ?? null
  } catch {
    return null
  }
}

function setAuthStoreTokens(accessToken: string, refreshToken: string) {
  const raw = localStorage.getItem('auth-storage')
  if (!raw) return
  try {
    const parsed = JSON.parse(raw)
    parsed.state.accessToken = accessToken
    parsed.state.refreshToken = refreshToken
    localStorage.setItem('auth-storage', JSON.stringify(parsed))
  } catch {
    // ignore
  }
}

let refreshPromise: Promise<AuthResponse> | null = null

async function refreshTokens(): Promise<AuthResponse> {
  const store = getAuthStore()
  const refreshToken = store?.refreshToken
  if (!refreshToken) throw new ApiError(401, 'No refresh token')

  const response = await fetch(`${BASE_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })

  if (!response.ok) {
    throw new ApiError(response.status, 'Token refresh failed')
  }

  const data = (await response.json()) as AuthResponse
  setAuthStoreTokens(data.accessToken, data.refreshToken)
  return data
}

async function request<T>(path: string, init?: RequestInit, skipAuth = false): Promise<T> {
  const store = getAuthStore()
  const token = store?.accessToken

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string>),
  }

  if (token && !skipAuth) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers,
  })

  if (response.status === 401 && !skipAuth && store?.refreshToken) {
    try {
      if (!refreshPromise) {
        refreshPromise = refreshTokens()
      }
      const newTokens = await refreshPromise
      refreshPromise = null

      headers['Authorization'] = `Bearer ${newTokens.accessToken}`
      const retry = await fetch(`${BASE_URL}${path}`, { ...init, headers })

      if (!retry.ok) {
        let message = retry.statusText
        let errors: Record<string, string> | null = null
        try {
          const body = await retry.json()
          message = body.message ?? JSON.stringify(body)
          errors = body.errors ?? null
        } catch {
          message = await retry.text().catch(() => retry.statusText)
        }
        throw new ApiError(retry.status, message, errors)
      }

      if (retry.status === 204) return undefined as T
      return retry.json() as Promise<T>
    } catch {
      refreshPromise = null
      throw new ApiError(401, 'Session expired')
    }
  }

  if (!response.ok) {
    let message = response.statusText
    let errors: Record<string, string> | null = null
    try {
      const body = await response.json()
      message = body.message ?? JSON.stringify(body)
      errors = body.errors ?? null
    } catch {
      message = await response.text().catch(() => response.statusText)
    }
    throw new ApiError(response.status, message, errors)
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export { ApiError }

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

export const authApi = {
  signup: async (data: { name: string; email: string; password: string }): Promise<AuthResponse> =>
    request<AuthResponse>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true),

  login: async (data: { email: string; password: string }): Promise<AuthResponse> =>
    request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true),

  logout: async (refreshToken: string): Promise<void> =>
    request<void>('/api/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),

  refresh: async (refreshToken: string): Promise<AuthResponse> =>
    request<AuthResponse>('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }, true),
}
