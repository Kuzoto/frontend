import { useEffect } from 'react'
import { useThemeStore } from '@/store/themeStore'
import type { Theme } from '@/types'

function applyTheme(theme: Theme) {
  const root = document.documentElement
  root.classList.remove('dark', 'warm', 'warm-dark')
  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (prefersDark) root.classList.add('dark')
  } else if (theme !== 'light') {
    root.classList.add(theme)
  }
}

export function useTheme() {
  const { theme, setTheme } = useThemeStore()

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  useEffect(() => {
    if (theme !== 'system') return
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyTheme('system')
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [theme])

  return { theme, setTheme }
}
