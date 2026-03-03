import { Link, useNavigate } from 'react-router-dom'
import { User, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'

interface TopNavProps {
  onMenuClick?: () => void
}

export default function TopNav({ onMenuClick }: TopNavProps) {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  useTheme()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 gap-4">
        {isAuthenticated && (
          <Button
            variant="ghost"
            size="icon"
            className=""
            onClick={onMenuClick}
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2 font-semibold text-lg">
          <span className="text-primary">Noook</span>
        </Link>

        <div className="flex-1" />

        {isAuthenticated && user ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:inline">Hi, {user.name}</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full" aria-label="User menu">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link to="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">Log in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/">Sign up</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}
