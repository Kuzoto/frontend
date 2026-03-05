import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { api, setOnUnauthorized, ApiError, startRefreshTimer, stopRefreshTimer } from './api'

// Silence localStorage reads — no auth tokens in tests
beforeEach(() => {
  vi.stubGlobal('localStorage', {
    getItem: vi.fn().mockReturnValue(null),
    setItem: vi.fn(),
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
  setOnUnauthorized(null)
})

describe('setOnUnauthorized', () => {
  it('calls the handler when server returns 401 and there is no refresh token', async () => {
    const handler = vi.fn()
    setOnUnauthorized(handler)

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response('Unauthorized', { status: 401, statusText: 'Unauthorized' })
    ))

    await expect(api.get('/api/test')).rejects.toBeInstanceOf(ApiError)
    expect(handler).toHaveBeenCalledOnce()
  })

  it('calls the handler when the token refresh also fails', async () => {
    const handler = vi.fn()
    setOnUnauthorized(handler)

    // Seed a fake refresh token so the refresh path is triggered
    vi.stubGlobal('localStorage', {
      getItem: vi.fn().mockReturnValue(
        JSON.stringify({ state: { accessToken: 'old', refreshToken: 'ref' } })
      ),
      setItem: vi.fn(),
    })

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response('Unauthorized', { status: 401, statusText: 'Unauthorized' })
    ))

    await expect(api.get('/api/test')).rejects.toBeInstanceOf(ApiError)
    expect(handler).toHaveBeenCalledOnce()
  })

  it('does not call the handler for non-401 errors', async () => {
    const handler = vi.fn()
    setOnUnauthorized(handler)

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response('Not Found', { status: 404, statusText: 'Not Found' })
    ))

    await expect(api.get('/api/test')).rejects.toBeInstanceOf(ApiError)
    expect(handler).not.toHaveBeenCalled()
  })

  it('does not call the handler when request succeeds', async () => {
    const handler = vi.fn()
    setOnUnauthorized(handler)

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    ))

    await api.get('/api/test')
    expect(handler).not.toHaveBeenCalled()
  })

  it('calls the handler when server returns 403 and there is no refresh token', async () => {
    const handler = vi.fn()
    setOnUnauthorized(handler)

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response('Forbidden', { status: 403, statusText: 'Forbidden' })
    ))

    await expect(api.get('/api/test')).rejects.toBeInstanceOf(ApiError)
    expect(handler).toHaveBeenCalledOnce()
  })

  it('attempts token refresh on 403 when refresh token exists', async () => {
    const handler = vi.fn()
    setOnUnauthorized(handler)

    vi.stubGlobal('localStorage', {
      getItem: vi.fn().mockReturnValue(
        JSON.stringify({ state: { accessToken: 'old', refreshToken: 'ref', expiresAt: 9999999999999 } })
      ),
      setItem: vi.fn(),
    })

    const refreshResponse = {
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
      tokenType: 'Bearer',
      expiresIn: 900,
      expiresAt: Date.now() + 900000,
      name: 'Test',
      email: 'test@test.com',
    }

    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(new Response('Forbidden', { status: 403 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(refreshResponse), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }))
    )

    const result = await api.get('/api/test')
    expect(result).toEqual({ ok: true })
    expect(handler).not.toHaveBeenCalled()
  })
})

describe('refresh timer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    stopRefreshTimer()
    vi.useRealTimers()
  })

  it('startRefreshTimer triggers refresh before expiry', async () => {
    const now = Date.now()
    const expiresAt = now + 900_000 // 15 min from now

    vi.stubGlobal('localStorage', {
      getItem: vi.fn().mockReturnValue(
        JSON.stringify({ state: { accessToken: 'a', refreshToken: 'r', expiresAt } })
      ),
      setItem: vi.fn(),
    })

    const refreshResponse = {
      accessToken: 'new-a',
      refreshToken: 'new-r',
      tokenType: 'Bearer',
      expiresIn: 900,
      expiresAt: now + 1_800_000,
      name: 'Test',
      email: 'test@test.com',
    }

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(JSON.stringify(refreshResponse), { status: 200 })
    ))

    startRefreshTimer(expiresAt)

    // Advance to 1 min before expiry (14 min = 840_000 ms)
    await vi.advanceTimersByTimeAsync(840_000)

    expect(fetch).toHaveBeenCalledOnce()
  })

  it('stopRefreshTimer prevents scheduled refresh', async () => {
    const expiresAt = Date.now() + 900_000

    vi.stubGlobal('fetch', vi.fn())

    startRefreshTimer(expiresAt)
    stopRefreshTimer()

    await vi.advanceTimersByTimeAsync(900_000)
    expect(fetch).not.toHaveBeenCalled()
  })
})
