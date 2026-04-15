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

// Thrown internally when token refresh fails.
// isTransient=true  → server/network error, keep user logged in and retry later
// isTransient=false → bad/expired refresh token, must logout
class RefreshFailedError extends Error {
  isTransient: boolean
  constructor(isTransient: boolean) {
    super(isTransient ? 'Server temporarily unavailable' : 'Session expired')
    this.isTransient = isTransient
  }
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
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

function setAuthStoreTokens(accessToken: string, refreshToken: string, expiresAt: number) {
  const raw = localStorage.getItem('auth-storage')
  if (!raw) return
  try {
    const parsed = JSON.parse(raw)
    parsed.state.accessToken = accessToken
    parsed.state.refreshToken = refreshToken
    parsed.state.expiresAt = expiresAt
    localStorage.setItem('auth-storage', JSON.stringify(parsed))
  } catch {
    // ignore
  }
}

let refreshPromise: Promise<AuthResponse> | null = null

let onUnauthorized: (() => void) | null = null
export function setOnUnauthorized(fn: (() => void) | null) {
  onUnauthorized = fn
}

async function refreshTokens(): Promise<AuthResponse> {
  const store = getAuthStore()
  const refreshToken = store?.refreshToken
  if (!refreshToken) throw new RefreshFailedError(false)

  let response: Response
  try {
    response = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
  } catch {
    // Network error — Supabase unreachable, treat as transient
    throw new RefreshFailedError(true)
  }

  if (!response.ok) {
    // 5xx = server/DB overload (transient), 4xx = bad token (genuine auth failure)
    throw new RefreshFailedError(response.status >= 500)
  }

  const data = (await response.json()) as AuthResponse
  setAuthStoreTokens(data.accessToken, data.refreshToken, data.expiresAt)
  startRefreshTimer(data.expiresAt)
  return data
}

// Retry with exponential backoff, capped at 5 minutes, for transient refresh failures
function scheduleRefreshRetry(attempt = 0) {
  const delay = Math.min(30_000 * 2 ** attempt, 300_000) // 30s → 60s → 120s → … → 5min
  refreshTimer = setTimeout(() => {
    refreshTimer = null
    refreshTokens().catch((err: unknown) => {
      if (err instanceof RefreshFailedError && err.isTransient) {
        scheduleRefreshRetry(attempt + 1)
      } else {
        onUnauthorized?.()
      }
    })
  }, delay)
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

  if ((response.status === 401 || response.status === 403) && !skipAuth && store?.refreshToken) {
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
    } catch (err) {
      refreshPromise = null
      // Only log out for genuine auth failures — not transient server/network errors
      const isTransient = err instanceof RefreshFailedError && err.isTransient
      if (!isTransient) {
        onUnauthorized?.()
      }
      throw new ApiError(401, isTransient ? 'Server temporarily unavailable' : 'Session expired')
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
    if ((response.status === 401 || response.status === 403) && !skipAuth) onUnauthorized?.()
    throw new ApiError(response.status, message, errors)
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export { ApiError }

let refreshTimer: ReturnType<typeof setTimeout> | null = null

export function startRefreshTimer(expiresAt: number) {
  stopRefreshTimer()
  const delay = expiresAt - Date.now() - 60_000 // 1 min buffer
  if (delay <= 0) {
    refreshTokens().catch((err: unknown) => {
      if (err instanceof RefreshFailedError && err.isTransient) {
        scheduleRefreshRetry()
      } else {
        onUnauthorized?.()
      }
    })
    return
  }
  refreshTimer = setTimeout(() => {
    refreshTimer = null
    refreshTokens().catch((err: unknown) => {
      if (err instanceof RefreshFailedError && err.isTransient) {
        scheduleRefreshRetry()
      } else {
        onUnauthorized?.()
      }
    })
  }, delay)
}

export function stopRefreshTimer() {
  if (refreshTimer !== null) {
    clearTimeout(refreshTimer)
    refreshTimer = null
  }
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

