import { useState } from 'react'
import { Pencil, Trash2, Check, X } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { GroceryItem } from '@/types'

interface GroceryItemRowProps {
  item: GroceryItem
  onToggleCheck: () => void
  onUpdate: (data: { name: string; quantity: string }) => void
  onDelete: () => void
}

export default function GroceryItemRow({ item, onToggleCheck, onUpdate, onDelete }: GroceryItemRowProps) {
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editQty, setEditQty] = useState('')

  function startEdit() {
    setEditName(item.name)
    setEditQty(item.quantity)
    setEditing(true)
  }

  function handleSave() {
    const trimmed = editName.trim()
    if (!trimmed) return
    onUpdate({ name: trimmed, quantity: editQty.trim() })
    setEditing(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSave()
    if (e.key === 'Escape') setEditing(false)
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2 py-1.5 px-2">
        <Input
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-8 text-sm flex-1"
          autoFocus
        />
        <Input
          value={editQty}
          onChange={(e) => setEditQty(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-8 text-sm w-24"
          placeholder="Qty"
        />
        <button onClick={handleSave} className="p-1 text-green-600 hover:text-green-700">
          <Check className="h-4 w-4" />
        </button>
        <button onClick={() => setEditing(false)} className="p-1 text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 py-1.5 px-2 group hover:bg-accent/50 rounded-md">
      <div onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={item.checked}
          onCheckedChange={onToggleCheck}
        />
      </div>
      <span className={cn('text-sm flex-1', item.checked && 'line-through text-muted-foreground')}>
        {item.name}
      </span>
      {item.quantity && (
        <span className={cn('text-xs text-muted-foreground', item.checked && 'line-through')}>
          {item.quantity}
        </span>
      )}
      {(item.labels ?? []).length > 0 && (
        <div className="flex gap-1">
          {(item.labels ?? []).map((label) => (
            <Badge key={label.id} variant="secondary" className="text-[10px] px-1.5 py-0">
              {label.name}
            </Badge>
          ))}
        </div>
      )}
      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={startEdit} className="p-1 text-muted-foreground hover:text-foreground">
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button onClick={onDelete} className="p-1 text-muted-foreground hover:text-destructive">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
