import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, AuthState } from '@/types'
import { authApi } from '@/lib/api'

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      login: (user: User, tokens: { accessToken: string; refreshToken: string }) =>
        set({ user, isAuthenticated: true, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken }),
      logout: async () => {
        const { refreshToken } = get()
        if (refreshToken) {
          await authApi.logout(refreshToken).catch(() => {})
        }
        set({ user: null, isAuthenticated: false, accessToken: null, refreshToken: null })
      },
      forceLogout: () =>
        set({ user: null, isAuthenticated: false, accessToken: null, refreshToken: null }),
      setTokens: (tokens: { accessToken: string; refreshToken: string }) =>
        set({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
)
