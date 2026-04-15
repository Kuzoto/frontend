import { QueryClient } from '@tanstack/react-query'
import { ApiError } from '@/lib/api'

function isTransientError(err: unknown): boolean {
  if (err instanceof ApiError) return err.status >= 500
  // Network error (fetch threw — Supabase unreachable)
  return err instanceof TypeError
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: (failureCount, err) => failureCount < 3 && isTransientError(err),
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30_000), // 1s, 2s, 4s
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
})
