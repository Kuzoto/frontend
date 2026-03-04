import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import TopNav from './TopNav'

export default function AuthLayout() {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="flex min-h-[calc(100vh-3.5rem)] items-start justify-center px-4 py-12">
        <Outlet />
      </main>
    </div>
  )
}
