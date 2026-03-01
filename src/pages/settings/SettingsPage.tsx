import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import ThemeToggle from '@/components/shared/ThemeToggle'
import { useAuth } from '@/hooks/useAuth'

export default function SettingsPage() {
  const { user } = useAuth()

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your preferences and account settings.</p>
      </div>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Appearance</CardTitle>
          <CardDescription>Choose how Personal Space looks on your device.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Theme</p>
              <p className="text-xs text-muted-foreground">Select light, dark, or follow your system setting.</p>
            </div>
            <ThemeToggle />
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Account */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
          <CardDescription>Manage your email address and password.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1 text-sm">
            <p className="text-muted-foreground">Email address</p>
            <p className="font-medium">{user?.email ?? '—'}</p>
          </div>
          <div className="rounded-md border p-3 text-sm text-muted-foreground bg-muted/40">
            Email change and password change coming soon.
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notifications</CardTitle>
          <CardDescription>Control which notifications you receive.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border p-3 text-sm text-muted-foreground bg-muted/40">
            Notification preferences coming soon.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
