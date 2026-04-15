// Tests that the app stays logged in when the database is overloaded (5xx responses)
// and only logs the user out for genuine auth failures (4xx).

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { api, setOnUnauthorized, ApiError, startRefreshTimer, stopRefreshTimer } from './api'

const FAKE_AUTH_STORAGE = JSON.stringify({
  state: { accessToken: 'access-token', refreshToken: 'refresh-token', expiresAt: 9999999999999 },
})

beforeEach(() => {
  vi.stubGlobal('localStorage', {
    getItem: vi.fn().mockReturnValue(FAKE_AUTH_STORAGE),
    setItem: vi.fn(),
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
  stopRefreshTimer()
  setOnUnauthorized(null)
})

describe('database overload — user stays logged in', () => {
  it('does not call onUnauthorized when refresh endpoint returns 503', async () => {
    const handler = vi.fn()
    setOnUnauthorized(handler)

    vi.stubGlobal('fetch', vi.fn()
      // Initial request → 401
      .mockResolvedValueOnce(new Response('Unauthorized', { status: 401 }))
      // Refresh endpoint → 503 (DB overloaded)
      .mockResolvedValueOnce(new Response('Service Unavailable', { status: 503 })),
    )

    await expect(api.get('/api/notes')).rejects.toBeInstanceOf(ApiError)
    expect(handler).not.toHaveBeenCalled()
  })

  it('does not call onUnauthorized when refresh endpoint returns 500', async () => {
    const handler = vi.fn()
    setOnUnauthorized(handler)

    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(new Response('Unauthorized', { status: 401 }))
      .mockResolvedValueOnce(new Response('Internal Server Error', { status: 500 })),
    )

    await expect(api.get('/api/notes')).rejects.toBeInstanceOf(ApiError)
    expect(handler).not.toHaveBeenCalled()
  })

  it('does not call onUnauthorized when refresh fails with a network error', async () => {
    const handler = vi.fn()
    setOnUnauthorized(handler)

    vi.stubGlobal('fetch', vi.fn()
      // Initial request → 401
      .mockResolvedValueOnce(new Response('Unauthorized', { status: 401 }))
      // Refresh → network failure (TypeError = fetch threw)
      .mockRejectedValueOnce(new TypeError('Failed to fetch')),
    )

    await expect(api.get('/api/notes')).rejects.toBeInstanceOf(ApiError)
    expect(handler).not.toHaveBeenCalled()
  })

  it('throws ApiError with 401 status but keeps the session when refresh is transient', async () => {
    setOnUnauthorized(vi.fn())

    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(new Response('Unauthorized', { status: 401 }))
      .mockResolvedValueOnce(new Response('Service Unavailable', { status: 503 })),
    )

    const err = await api.get('/api/notes').catch((e: unknown) => e)
    expect(err).toBeInstanceOf(ApiError)
    expect((err as ApiError).status).toBe(401)
    expect((err as ApiError).message).toMatch(/temporarily unavailable/i)
  })
})

describe('database overload — user IS logged out on genuine auth failure', () => {
  it('calls onUnauthorized when refresh endpoint returns 401 (expired token)', async () => {
    const handler = vi.fn()
    setOnUnauthorized(handler)

    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(new Response('Unauthorized', { status: 401 }))
      // Refresh also returns 401 → genuine expiry
      .mockResolvedValueOnce(new Response('Unauthorized', { status: 401 })),
    )

    await expect(api.get('/api/notes')).rejects.toBeInstanceOf(ApiError)
    expect(handler).toHaveBeenCalledOnce()
  })

  it('calls onUnauthorized when refresh endpoint returns 403 (revoked token)', async () => {
    const handler = vi.fn()
    setOnUnauthorized(handler)

    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(new Response('Unauthorized', { status: 401 }))
      .mockResolvedValueOnce(new Response('Forbidden', { status: 403 })),
    )

    await expect(api.get('/api/notes')).rejects.toBeInstanceOf(ApiError)
    expect(handler).toHaveBeenCalledOnce()
  })
})

describe('refresh timer — overload resilience', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('does not call onUnauthorized when background refresh returns 503, and retries later', async () => {
    const handler = vi.fn()
    setOnUnauthorized(handler)

    const expiresAt = Date.now() + 900_000 // 15 min from now

    vi.stubGlobal('localStorage', {
      getItem: vi.fn().mockReturnValue(
        JSON.stringify({ state: { accessToken: 'a', refreshToken: 'r', expiresAt } }),
      ),
      setItem: vi.fn(),
    })

    // First refresh attempt → 503 (overloaded)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response('Service Unavailable', { status: 503 }),
    ))

    startRefreshTimer(expiresAt)

    // Advance to just after the scheduled refresh (14 min in)
    await vi.advanceTimersByTimeAsync(840_000)

    // Overloaded response → should NOT have called logout handler
    expect(handler).not.toHaveBeenCalled()

    // A retry should be scheduled — advance through the backoff (30s)
    await vi.advanceTimersByTimeAsync(30_000)

    // Still no logout — just retrying
    expect(handler).not.toHaveBeenCalled()
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('calls onUnauthorized when background refresh returns 401 (token genuinely expired)', async () => {
    const handler = vi.fn()
    setOnUnauthorized(handler)

    const expiresAt = Date.now() + 900_000

    vi.stubGlobal('localStorage', {
      getItem: vi.fn().mockReturnValue(
        JSON.stringify({ state: { accessToken: 'a', refreshToken: 'r', expiresAt } }),
      ),
      setItem: vi.fn(),
    })

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response('Unauthorized', { status: 401 }),
    ))

    startRefreshTimer(expiresAt)
    await vi.advanceTimersByTimeAsync(840_000)

    expect(handler).toHaveBeenCalledOnce()
  })
})
