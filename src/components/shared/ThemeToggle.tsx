import { Sun, Moon, Monitor, Flame } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/hooks/useTheme'
import type { Theme } from '@/types'

const OPTIONS: { value: Theme; icon: React.ReactNode; label: string }[] = [
  { value: 'light', icon: <Sun className="h-4 w-4" />, label: 'Light' },
  { value: 'dark', icon: <Moon className="h-4 w-4" />, label: 'Dark' },
  { value: 'system', icon: <Monitor className="h-4 w-4" />, label: 'System' },
  { value: 'warm', icon: <Flame className="h-4 w-4" />, label: 'Warm' },
  { value: 'warm-dark', icon: <Flame className="h-4 w-4" />, label: 'Warm Dark' },
]

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex items-center gap-1 rounded-lg border bg-muted p-1">
      {OPTIONS.map((opt) => (
        <Button
          key={opt.value}
          variant={theme === opt.value ? 'default' : 'ghost'}
          size="sm"
          className="h-7 px-2.5 gap-1.5"
          onClick={() => setTheme(opt.value)}
          aria-label={`${opt.label} theme`}
          aria-pressed={theme === opt.value}
        >
          {opt.icon}
          <span className="text-xs">{opt.label}</span>
        </Button>
      ))}
    </div>
  )
}
