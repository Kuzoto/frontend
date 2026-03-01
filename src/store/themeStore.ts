import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Theme, ThemeState } from '@/types'

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'system' as Theme,
      setTheme: (theme: Theme) => set({ theme }),
    }),
    {
      name: 'theme-storage',
    }
  )
)
