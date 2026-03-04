import { Search, MoreVertical, Archive } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'

interface NotesToolbarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  activeTab: 'active' | 'archived'
  onTabChange: (tab: 'active' | 'archived') => void
}

export default function NotesToolbar({
  searchQuery,
  onSearchChange,
  activeTab,
  onTabChange,
}: NotesToolbarProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {activeTab === 'active' ? (
            <DropdownMenuItem onClick={() => onTabChange('archived')}>
              <Archive className="h-4 w-4 mr-2" />
              Archived notes
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => onTabChange('active')}>
              <Archive className="h-4 w-4 mr-2" />
              Active notes
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
