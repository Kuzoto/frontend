import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { useGroceryList } from '@/hooks/useGroceries'
import type { GroceryListSummary } from '@/types'

const MAX_PREVIEW_ITEMS = 8

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
  const { data: fullList } = useGroceryList(list.id)
  const items = fullList?.items ?? []
  const itemCount = items.length
  const checkedCount = items.filter((i) => i.checked).length
  const labels = fullList?.labels ?? list.labels ?? []
  const progressPercent = itemCount > 0 ? (checkedCount / itemCount) * 100 : 0

  const uncheckedItems = items.filter((i) => !i.checked)
  const checkedItems = items.filter((i) => i.checked)

  // Truncate for preview
  const previewUnchecked = uncheckedItems.slice(0, MAX_PREVIEW_ITEMS)
  const remainingSlots = MAX_PREVIEW_ITEMS - previewUnchecked.length
  const previewChecked = remainingSlots > 0 ? checkedItems.slice(0, remainingSlots) : []
  const totalPreviewCount = previewUnchecked.length + previewChecked.length
  const hasMore = itemCount > totalPreviewCount

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
        </div>

        {/* Progress bar */}
        {itemCount > 0 && (
          <div className="mt-2">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
              <span>Progress</span>
              <span>{checkedCount}/{itemCount} checked</span>
            </div>
            <Progress value={progressPercent} className="h-1.5" />
          </div>
        )}

        {/* Item preview */}
        {items.length > 0 && (
          <div className="mt-2">
            <div className="relative max-h-40 overflow-hidden">
              <div className="space-y-0.5">
                {previewUnchecked.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 py-0.5">
                    <Checkbox checked={false} className="pointer-events-none h-3.5 w-3.5" tabIndex={-1} />
                    <span className="text-xs flex-1 truncate">{item.name}</span>
                    {item.quantity && (
                      <span className="text-[10px] text-muted-foreground shrink-0">{item.quantity}</span>
                    )}
                  </div>
                ))}
                {previewChecked.length > 0 && (
                  <>
                    <div className="flex items-center gap-2 my-1">
                      <Separator className="flex-1" />
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        Checked ({checkedItems.length})
                      </span>
                      <Separator className="flex-1" />
                    </div>
                    {previewChecked.map((item) => (
                      <div key={item.id} className="flex items-center gap-2 py-0.5">
                        <Checkbox checked className="pointer-events-none h-3.5 w-3.5" tabIndex={-1} />
                        <span className="text-xs flex-1 truncate line-through text-muted-foreground">{item.name}</span>
                        {item.quantity && (
                          <span className="text-[10px] text-muted-foreground shrink-0 line-through">{item.quantity}</span>
                        )}
                      </div>
                    ))}
                  </>
                )}
              </div>
              {hasMore && (
                <div className="absolute bottom-0 inset-x-0 h-8 bg-gradient-to-t from-card to-transparent" />
              )}
            </div>
            {hasMore && (
              <span className="text-[10px] text-muted-foreground mt-1 block">
                +{itemCount - totalPreviewCount} more
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
