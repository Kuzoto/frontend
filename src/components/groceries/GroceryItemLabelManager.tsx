import { useState } from 'react'
import { Settings, Pencil, Trash2, Check, X } from 'lucide-react'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ApiError } from '@/lib/api'
import { useGroceryItemLabels, useCreateGroceryItemLabel, useUpdateGroceryItemLabel, useDeleteGroceryItemLabel } from '@/hooks/useGroceries'

export default function GroceryItemLabelManager() {
  const { data: labels = [] } = useGroceryItemLabels()
  const createLabel = useCreateGroceryItemLabel()
  const updateLabel = useUpdateGroceryItemLabel()
  const deleteLabel = useDeleteGroceryItemLabel()

  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [createError, setCreateError] = useState('')
  const [editError, setEditError] = useState('')

  function handleCreate() {
    const trimmed = newName.trim()
    if (!trimmed) return
    setCreateError('')
    createLabel.mutate(
      { name: trimmed },
      {
        onSuccess: () => setNewName(''),
        onError: (error) => {
          if (error instanceof ApiError && error.status === 409) {
            setCreateError('Label already exists')
          } else if (error instanceof ApiError && error.errors?.name) {
            setCreateError(error.errors.name)
          } else {
            setCreateError(error instanceof ApiError ? error.message : 'Failed to create label')
          }
        },
      }
    )
  }

  function startEdit(id: string, name: string) {
    setEditingId(id)
    setEditingName(name)
    setEditError('')
  }

  function handleUpdate() {
    if (!editingId) return
    const trimmed = editingName.trim()
    if (!trimmed) return
    setEditError('')
    updateLabel.mutate(
      { id: editingId, data: { name: trimmed } },
      {
        onSuccess: () => setEditingId(null),
        onError: (error) => {
          if (error instanceof ApiError && error.status === 409) {
            setEditError('Label already exists')
          } else if (error instanceof ApiError && error.errors?.name) {
            setEditError(error.errors.name)
          } else {
            setEditError(error instanceof ApiError ? error.message : 'Failed to update label')
          }
        },
      }
    )
  }

  function handleDelete(id: string) {
    deleteLabel.mutate(id)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Settings className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64">
        <h4 className="font-medium text-sm mb-3">Manage Item Labels</h4>

        <div className="space-y-2 max-h-48 overflow-y-auto">
          {labels.map((label) => (
            <div key={label.id}>
              <div className="flex items-center gap-1">
                {editingId === label.id ? (
                  <>
                    <Input
                      value={editingName}
                      onChange={(e) => {
                        setEditingName(e.target.value)
                        setEditError('')
                      }}
                      className="h-7 text-xs flex-1"
                      onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
                    />
                    <button onClick={handleUpdate} className="p-1 text-green-600 hover:text-green-700">
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => setEditingId(null)} className="p-1 text-muted-foreground hover:text-foreground">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-sm flex-1 truncate">{label.name}</span>
                    <button onClick={() => startEdit(label.id, label.name)} className="p-1 text-muted-foreground hover:text-foreground">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleDelete(label.id)} className="p-1 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}
              </div>
              {editingId === label.id && editError && (
                <p className="text-[11px] text-destructive mt-0.5 ml-1">{editError}</p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-3 pt-3 border-t">
          <div className="flex items-center gap-1">
            <Input
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value)
                setCreateError('')
              }}
              placeholder="New label..."
              className="h-7 text-xs flex-1"
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
            <Button size="sm" variant="secondary" className="h-7 text-xs" onClick={handleCreate}>
              Add
            </Button>
          </div>
          {createError && (
            <p className="text-[11px] text-destructive mt-1 ml-1">{createError}</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
