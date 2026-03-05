import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, AuthState } from '@/types'
import { authApi, stopRefreshTimer } from '@/lib/api'

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      login: (user: User, tokens: { accessToken: string; refreshToken: string; expiresAt: number }) =>
        set({ user, isAuthenticated: true, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, expiresAt: tokens.expiresAt }),
      logout: async () => {
        stopRefreshTimer()
        const { refreshToken } = get()
        if (refreshToken) {
          await authApi.logout(refreshToken).catch(() => {})
        }
        set({ user: null, isAuthenticated: false, accessToken: null, refreshToken: null, expiresAt: null })
      },
      forceLogout: () =>
        set({ user: null, isAuthenticated: false, accessToken: null, refreshToken: null, expiresAt: null }),
      setTokens: (tokens: { accessToken: string; refreshToken: string; expiresAt: number }) =>
        set({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, expiresAt: tokens.expiresAt }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        expiresAt: state.expiresAt,
      }),
    }
  )
)
