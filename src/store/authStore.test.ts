import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from './authStore'

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: { id: '1', name: 'Alice', email: 'alice@example.com' },
      isAuthenticated: true,
      accessToken: 'tok',
      refreshToken: 'ref',
      expiresAt: 9999999999999,
    })
  })

  it('forceLogout clears all auth state without calling logout API', () => {
    useAuthStore.getState().forceLogout()
    const { user, isAuthenticated, accessToken, refreshToken } = useAuthStore.getState()
    expect(user).toBeNull()
    expect(isAuthenticated).toBe(false)
    expect(accessToken).toBeNull()
    expect(refreshToken).toBeNull()
  })

  it('login stores expiresAt', () => {
    const user = { id: '1', name: 'Alice', email: 'alice@example.com' }
    useAuthStore.getState().login(user, { accessToken: 'a', refreshToken: 'r', expiresAt: 9999 })
    expect(useAuthStore.getState().expiresAt).toBe(9999)
  })

  it('forceLogout clears expiresAt', () => {
    useAuthStore.getState().forceLogout()
    expect(useAuthStore.getState().expiresAt).toBeNull()
  })

  it('setTokens updates expiresAt', () => {
    useAuthStore.getState().setTokens({ accessToken: 'new', refreshToken: 'new', expiresAt: 5555 })
    expect(useAuthStore.getState().expiresAt).toBe(5555)
  })
})
