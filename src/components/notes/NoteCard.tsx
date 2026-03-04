import { Pin } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import type { Note } from '@/types'

interface NoteCardProps {
  note: Note
  selected: boolean
  selectionMode: boolean
  onSelect: (id: string) => void
  onClick: (note: Note) => void
  onTogglePin: (id: string) => void
}

export default function NoteCard({
  note,
  selected,
  selectionMode,
  onSelect,
  onClick,
  onTogglePin,
}: NoteCardProps) {
  return (
    <Card
      className={cn(
        'break-inside-avoid mb-4 cursor-pointer transition-all hover:shadow-md group relative',
        note.pinned && 'border-l-4 border-l-amber-400',
        selected && 'ring-2 ring-primary'
      )}
      onClick={() => {
        if (selectionMode) {
          onSelect(note.id)
        } else {
          onClick(note)
        }
      }}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={cn(
                'shrink-0',
                selectionMode ? 'block' : 'hidden group-hover:block'
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <Checkbox
                checked={selected}
                onCheckedChange={() => onSelect(note.id)}
              />
            </div>
            {note.title && (
              <h3 className="font-semibold text-sm truncate">{note.title}</h3>
            )}
          </div>
          {!note.archived && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onTogglePin(note.id)
              }}
              className={cn(
                'shrink-0 p-1 rounded-sm transition-opacity',
                note.pinned
                  ? 'text-amber-500 opacity-100'
                  : 'opacity-0 group-hover:opacity-70 hover:!opacity-100 text-muted-foreground'
              )}
            >
              <Pin className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {note.content && note.content !== '<p></p>' && (
          <div
            className="prose prose-sm max-w-none text-xs text-muted-foreground mt-2 max-h-40 overflow-hidden [&>*:first-child]:mt-0"
            dangerouslySetInnerHTML={{ __html: note.content }}
          />
        )}

        {note.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {note.labels.map((label) => (
              <Badge key={label.id} variant="secondary" className="text-[10px] px-1.5 py-0">
                {label.name}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}
