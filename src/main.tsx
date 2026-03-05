import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { registerSW } from 'virtual:pwa-register'
import { queryClient } from '@/lib/queryClient'
import { router } from '@/router'
import { setOnUnauthorized, startRefreshTimer, stopRefreshTimer } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import Toaster from '@/components/ui/toaster'
import './index.css'

registerSW({ immediate: true })

setOnUnauthorized(() => {
  stopRefreshTimer()
  useAuthStore.getState().forceLogout()
  router.navigate('/login')
})

// Resume refresh timer if user is already authenticated (page reload)
const authState = useAuthStore.getState()
if (authState.isAuthenticated && authState.expiresAt) {
  startRefreshTimer(authState.expiresAt)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster />
    </QueryClientProvider>
  </StrictMode>
)
