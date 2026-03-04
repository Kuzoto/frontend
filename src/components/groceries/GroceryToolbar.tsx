import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface GroceryToolbarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  activeTab: 'active' | 'archived'
  onTabChange: (tab: 'active' | 'archived') => void
}

export default function GroceryToolbar({
  searchQuery,
  onSearchChange,
  activeTab,
  onTabChange,
}: GroceryToolbarProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search lists..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex rounded-md border overflow-hidden shrink-0">
        <Button
          variant={activeTab === 'active' ? 'default' : 'ghost'}
          size="sm"
          className={cn('rounded-none border-0 h-9 px-4', activeTab !== 'active' && 'text-muted-foreground')}
          onClick={() => onTabChange('active')}
        >
          Active
        </Button>
        <Button
          variant={activeTab === 'archived' ? 'default' : 'ghost'}
          size="sm"
          className={cn('rounded-none border-0 border-l h-9 px-4', activeTab !== 'archived' && 'text-muted-foreground')}
          onClick={() => onTabChange('archived')}
        >
          Archived
        </Button>
      </div>
    </div>
  )
}
