import { Archive, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface GroceryFloatingActionBarProps {
  count: number
  onArchive: () => void
  onDelete: () => void
  onCancel: () => void
}

export default function GroceryFloatingActionBar({ count, onArchive, onDelete, onCancel }: GroceryFloatingActionBarProps) {
  if (count === 0) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-lg border bg-background px-4 py-3 shadow-lg animate-in slide-in-from-bottom-4 fade-in">
      <span className="text-sm font-medium">{count} selected</span>
      <div className="h-4 w-px bg-border" />
      <Button variant="ghost" size="sm" onClick={onArchive} className="gap-1.5">
        <Archive className="h-4 w-4" />
        Archive
      </Button>
      <Button variant="ghost" size="sm" onClick={onDelete} className="gap-1.5 text-destructive hover:text-destructive">
        <Trash2 className="h-4 w-4" />
        Delete
      </Button>
      <Button variant="ghost" size="icon" onClick={onCancel} className="h-8 w-8">
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}
