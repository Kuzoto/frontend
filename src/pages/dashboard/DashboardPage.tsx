import { StickyNote, CheckSquare, Film, Plane, ShoppingCart } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import FeatureCard from '@/components/shared/FeatureCard'
import { useAuth } from '@/hooks/useAuth'

interface FeatureConfig {
  title: string
  description: string
  href: string
  Icon: LucideIcon
  accentBg: string
  accentText: string
  accentBorder: string
  comingSoon?: boolean
}

const FEATURES: FeatureConfig[] = [
  {
    title: 'Notes',
    description: 'Capture ideas, thoughts, and anything worth remembering.',
    href: '/notes',
    Icon: StickyNote,
    accentBg: 'bg-amber-500/15',
    accentText: 'text-amber-600',
    accentBorder: 'border-t-amber-400',
  },
  {
    title: 'Groceries',
    description: 'Plan your shopping and never forget an item again.',
    href: '/groceries',
    Icon: ShoppingCart,
    accentBg: 'bg-rose-500/15',
    accentText: 'text-rose-600',
    accentBorder: 'border-t-rose-500',
  },
  {
    title: 'Todos',
    description: 'Keep track of tasks and cross them off as you go.',
    href: '/todos',
    Icon: CheckSquare,
    accentBg: 'bg-green-500/15',
    accentText: 'text-green-600',
    accentBorder: 'border-t-green-500',
    comingSoon: true,
  },
  {
    title: 'Movies',
    description: "Build your personal watchlist and track what you've seen.",
    href: '/movies',
    Icon: Film,
    accentBg: 'bg-purple-500/15',
    accentText: 'text-purple-600',
    accentBorder: 'border-t-purple-500',
    comingSoon: true,
  },
  {
    title: 'Travel Ideas',
    description: 'Collect destinations, inspiration, and trip plans.',
    href: '/travel',
    Icon: Plane,
    accentBg: 'bg-sky-500/15',
    accentText: 'text-sky-600',
    accentBorder: 'border-t-sky-500',
    comingSoon: true,
  },
]

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Noook</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back{user ? `, ${user.name}` : ''}. What would you like to work on?
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        {FEATURES.map((feature) => (
          <div
            key={feature.href}
            className="w-full sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3)]"
          >
            <FeatureCard {...feature} />
          </div>
        ))}
      </div>
    </div>
  )
}
