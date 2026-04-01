import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  StickyNote,
  CheckSquare,
  Film,
  Plane,
  ShoppingCart,
  X,
  // PanelLeftClose,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/notes', label: 'Notes', Icon: StickyNote },
  { to: '/groceries', label: 'Groceries', Icon: ShoppingCart },
  { to: '/todos', label: 'Todos', Icon: CheckSquare },
  { to: '/movies', label: 'Movies', Icon: Film, comingSoon: true },
  { to: '/travel', label: 'Travel Ideas', Icon: Plane, comingSoon: true },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          'h-[calc(100vh-3.5rem)] border-r bg-background overflow-hidden transition-all duration-300',
          // Mobile: fixed overlay
          'fixed top-14 left-0 z-40 w-60',
          // Desktop: sticky in flow, collapse via width
          'md:sticky md:top-14',
          // Mobile: translate in/out
          open ? 'translate-x-0' : '-translate-x-full',
          // Desktop: width in/out (overrides translate since element is in flow)
          open ? 'md:w-60 md:translate-x-0' : 'md:w-0 md:border-0 md:translate-x-0',
        )}
        aria-label="Sidebar navigation"
      >
        <div className="flex h-full flex-col gap-1 p-3">
          {/* Mobile close button */}
          <div className="flex justify-end md:hidden mb-1">
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close sidebar">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Desktop collapse button */}
          {/* <div className="hidden md:flex justify-end mb-1">
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Collapse sidebar">
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          </div> */}

          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map(({ to, label, Icon, comingSoon }) =>
              comingSoon ? (
                <div
                  key={to}
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground/50 cursor-not-allowed select-none"
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1">{label}</span>
                  <span className="text-xs bg-muted text-muted-foreground/70 rounded-full px-1.5 py-0.5 leading-none">Soon</span>
                </div>
              ) : (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => onClose()}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )
                  }
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </NavLink>
              )
            )}
          </nav>
        </div>
      </aside>
    </>
  )
}
