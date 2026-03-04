import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from './authStore'

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: { id: '1', name: 'Alice', email: 'alice@example.com' },
      isAuthenticated: true,
      accessToken: 'tok',
      refreshToken: 'ref',
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
})
