import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { api, setOnUnauthorized, ApiError } from './api'

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
})
