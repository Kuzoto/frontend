import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import type { GroceryItemLabel } from '@/types'

interface GroceryItemInputProps {
  allItemLabels: GroceryItemLabel[]
  onAdd: (data: { name: string; quantity: string; labelIds: string[] }) => void
}

export default function GroceryItemInput({ allItemLabels, onAdd }: GroceryItemInputProps) {
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([])

  function handleSubmit() {
    const trimmed = name.trim()
    if (!trimmed) return
    onAdd({ name: trimmed, quantity: quantity.trim(), labelIds: selectedLabelIds })
    setName('')
    setQuantity('')
    setSelectedLabelIds([])
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }

  function toggleLabel(id: string) {
    setSelectedLabelIds((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]
    )
  }

  return (
    <div className="flex items-center gap-2 px-2 pt-2 border-t">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Item name"
        className="h-8 text-sm flex-1"
      />
      <Input
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Qty"
        className="h-8 text-sm w-24"
      />
      {allItemLabels.length > 0 && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 text-xs shrink-0">
              {selectedLabelIds.length > 0 ? `${selectedLabelIds.length} label${selectedLabelIds.length > 1 ? 's' : ''}` : '+ Label'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2">
            <div className="space-y-0.5 max-h-36 overflow-y-auto">
              {allItemLabels.map((label) => (
                <button
                  key={label.id}
                  onClick={() => toggleLabel(label.id)}
                  className={cn(
                    'w-full text-left text-sm px-2 py-1 rounded hover:bg-accent',
                    selectedLabelIds.includes(label.id) && 'bg-accent font-medium'
                  )}
                >
                  {label.name}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}
      <Button size="sm" className="h-8" onClick={handleSubmit} disabled={!name.trim()}>
        Add
      </Button>
    </div>
  )
}
