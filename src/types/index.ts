export interface User {
  id: string
  name: string
  email: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (user: User) => void
  logout: () => void
}

export type Theme = 'light' | 'dark' | 'system' | 'warm' | 'warm-dark'

export interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
}

export interface Feature {
  id: string
  title: string
  description: string
  icon: string
  href: string
}
