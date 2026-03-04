import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { registerSW } from 'virtual:pwa-register'
import { queryClient } from '@/lib/queryClient'
import { router } from '@/router'
import { setOnUnauthorized } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import Toaster from '@/components/ui/toaster'
import './index.css'

registerSW({ immediate: true })

setOnUnauthorized(() => {
  useAuthStore.getState().forceLogout()
  router.navigate('/login')
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster />
    </QueryClientProvider>
  </StrictMode>
)
