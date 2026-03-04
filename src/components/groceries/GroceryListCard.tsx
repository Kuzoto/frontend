import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import type { GroceryListSummary } from '@/types'

interface GroceryListCardProps {
  list: GroceryListSummary
  selected: boolean
  selectionMode: boolean
  onSelect: (id: string) => void
  onClick: (list: GroceryListSummary) => void
}

export default function GroceryListCard({
  list,
  selected,
  selectionMode,
  onSelect,
  onClick,
}: GroceryListCardProps) {
  const itemCount = list.itemCount ?? 0
  const checkedCount = list.checkedCount ?? 0
  const labels = list.labels ?? []
  const previewItems = list.previewItems ?? []
  const progressPercent = itemCount > 0 ? (checkedCount / itemCount) * 100 : 0

  return (
    <Card
      className={cn(
        'break-inside-avoid mb-4 cursor-pointer transition-all hover:shadow-md group relative',
        selected && 'ring-2 ring-primary'
      )}
      onClick={() => {
        if (selectionMode) {
          onSelect(list.id)
        } else {
          onClick(list)
        }
      }}
    >
      <div className="p-4">
        {/* Header row */}
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
                onCheckedChange={() => onSelect(list.id)}
              />
            </div>
            <h3 className="font-semibold text-sm truncate">{list.title}</h3>
          </div>
          {itemCount > 0 && (
            <span className="text-xs text-muted-foreground shrink-0">
              {checkedCount}/{itemCount} &#10003;
            </span>
          )}
        </div>

        {/* Progress bar */}
        {itemCount > 0 && (
          <div className="mt-2">
            <Progress value={progressPercent} className="h-1.5" />
          </div>
        )}

        {/* Item preview */}
        {previewItems.length > 0 && (
          <div className="mt-2">
            <div className="relative max-h-40 overflow-hidden">
              <div className="space-y-0.5">
                {previewItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-1.5 text-xs">
                    <span className={cn(
                      'truncate',
                      item.checked ? 'line-through text-muted-foreground' : 'text-foreground'
                    )}>
                      {item.checked ? '☑' : '☐'} {item.name}
                    </span>
                  </div>
                ))}
              </div>
              {itemCount > previewItems.length && (
                <div className="absolute bottom-0 inset-x-0 h-8 bg-gradient-to-t from-card to-transparent" />
              )}
            </div>
            {itemCount > previewItems.length && (
              <span className="text-[10px] text-muted-foreground mt-1 block">
                +{itemCount - previewItems.length} more
              </span>
            )}
          </div>
        )}

        {/* Labels */}
        {labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {labels.map((label) => (
              <Badge key={label.id} variant="secondary" className="text-[10px] px-1.5 py-0">
                {label.name}
              </Badge>
            ))}
          </div>
        )}

        {/* Archived badge */}
        {list.archived && (
          <Badge variant="outline" className="mt-2 text-[10px]">Archived</Badge>
        )}
      </div>
    </Card>
  )
}
