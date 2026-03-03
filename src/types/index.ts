export interface User {
  id: string
  name: string
  email: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  name: string
  email: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  accessToken: string | null
  refreshToken: string | null
  login: (user: User, tokens: { accessToken: string; refreshToken: string }) => void
  logout: () => void
  setTokens: (tokens: { accessToken: string; refreshToken: string }) => void
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
