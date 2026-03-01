import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/hooks/useAuth'
import { authApi } from '@/lib/api'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [showForgot, setShowForgot] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSent, setForgotSent] = useState(false)
  const [forgotLoading, setForgotLoading] = useState(false)

  const [resendEmail, setResendEmail] = useState('')
  const [showResend, setShowResend] = useState(false)
  const [resendSent, setResendSent] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await authApi.login(form)
      login(user)
      navigate('/dashboard')
    } catch {
      setError('Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault()
    setForgotLoading(true)
    await authApi.forgotPassword(forgotEmail).catch(() => {})
    setForgotSent(true)
    setForgotLoading(false)
  }

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault()
    await authApi.resendConfirmation(resendEmail).catch(() => {})
    setResendSent(true)
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Sign in to your Personal Space account.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="jane@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in…' : 'Log in'}
          </Button>
        </form>

        <div className="flex flex-col gap-2">
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 text-muted-foreground"
            onClick={() => { setShowForgot((v) => !v); setShowResend(false) }}
          >
            Forgot password?
          </Button>

          {showForgot && (
            <form onSubmit={handleForgot} className="space-y-2 rounded-md border p-3 bg-muted/50">
              {forgotSent ? (
                <p className="text-sm text-muted-foreground">
                  If that email exists, we sent a reset link. Check your inbox.
                </p>
              ) : (
                <>
                  <Label htmlFor="forgot-email" className="text-xs">Enter your email</Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="jane@example.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                  />
                  <Button type="submit" size="sm" disabled={forgotLoading} className="w-full">
                    {forgotLoading ? 'Sending…' : 'Send reset link'}
                  </Button>
                </>
              )}
            </form>
          )}

          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 text-muted-foreground"
            onClick={() => { setShowResend((v) => !v); setShowForgot(false) }}
          >
            Resend confirmation email
          </Button>

          {showResend && (
            <form onSubmit={handleResend} className="space-y-2 rounded-md border p-3 bg-muted/50">
              {resendSent ? (
                <p className="text-sm text-muted-foreground">Confirmation email resent. Check your inbox.</p>
              ) : (
                <>
                  <Label htmlFor="resend-email" className="text-xs">Enter your email</Label>
                  <Input
                    id="resend-email"
                    type="email"
                    placeholder="jane@example.com"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    required
                  />
                  <Button type="submit" size="sm" className="w-full">Resend</Button>
                </>
              )}
            </form>
          )}
        </div>

        <Separator />

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link to="/" className="text-primary underline-offset-4 hover:underline">
            Sign up
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
