import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { NoteLabel } from '@/types'

interface LabelFilterProps {
  labels: NoteLabel[]
  selectedLabelId: string | null
  onSelectLabel: (id: string | null) => void
}

export default function LabelFilter({ labels, selectedLabelId, onSelectLabel }: LabelFilterProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      <Badge
        variant={selectedLabelId === null ? 'default' : 'outline'}
        className={cn('cursor-pointer shrink-0', selectedLabelId === null && 'shadow-sm')}
        onClick={() => onSelectLabel(null)}
      >
        All
      </Badge>
      {labels.map((label) => (
        <Badge
          key={label.id}
          variant={selectedLabelId === label.id ? 'default' : 'outline'}
          className={cn('cursor-pointer shrink-0', selectedLabelId === label.id && 'shadow-sm')}
          onClick={() => onSelectLabel(label.id)}
        >
          {label.name}
        </Badge>
      ))}
    </div>
  )
}
