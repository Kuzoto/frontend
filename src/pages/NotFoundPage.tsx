import { Home } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'

export default function NotFoundPage() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="relative min-h-screen bg-background flex flex-col items-center justify-center text-center px-4 overflow-hidden">
      {/* Ambient warm glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
        <div className="h-96 w-96 rounded-full bg-amber-400/10 blur-3xl" />
      </div>

      {/* Icon */}
      <div className="relative mb-6 rounded-2xl bg-amber-500/15 p-5">
        <Home className="h-10 w-10 text-amber-600" />
      </div>

      {/* Large 404 */}
      <p className="text-8xl font-bold leading-none text-amber-500/40 mb-4">404</p>

      {/* Heading */}
      <h1 className="text-2xl font-semibold text-foreground mb-2">
        This room doesn't exist.
      </h1>

      {/* Subtitle */}
      <p className="text-muted-foreground mb-8 max-w-sm">
        You've wandered outside My Noook. Let's get you back somewhere cozy.
      </p>

      {/* Auth-aware CTA */}
      <Button onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}>
        {isAuthenticated ? 'Go to Dashboard' : 'Go to Login'}
      </Button>
    </div>
  )
}
