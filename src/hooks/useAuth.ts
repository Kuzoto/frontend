import { useAuthStore } from '@/store/authStore'

export function useAuth() {
  const { user, isAuthenticated, login, logout, setTokens } = useAuthStore()
  return { user, isAuthenticated, login, logout, setTokens }
}
