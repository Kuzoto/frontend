import { StickyNote } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  onCreateNote: () => void
}

export default function EmptyState({ onCreateNote }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <StickyNote className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-1">Create your first note</h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-sm">
        Capture your thoughts, ideas, and reminders. Get started by creating a new note.
      </p>
      <Button onClick={onCreateNote}>New Note</Button>
    </div>
  )
}
