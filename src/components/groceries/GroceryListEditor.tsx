import { useState, useEffect } from 'react'
import { X, MoreVertical, Archive, Trash2, Plus } from 'lucide-react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import GroceryItemRow from '@/components/groceries/GroceryItemRow'
import GroceryItemInput from '@/components/groceries/GroceryItemInput'
import GroceryItemLabelManager from '@/components/groceries/GroceryItemLabelManager'
import {
  useGroceryList,
  useGroceryLabels,
  useCreateGroceryLabel,
  useGroceryItemLabels,
  useUpdateGroceryList,
  useDeleteGroceryList,
  useToggleGroceryArchive,
  useCreateGroceryItem,
  useUpdateGroceryItem,
  useDeleteGroceryItem,
  useToggleGroceryItemCheck,
} from '@/hooks/useGroceries'
import { ApiError } from '@/lib/api'
import { useToastStore } from '@/store/toastStore'
import type { GroceryLabel, GroceryItem, CreateGroceryItemPayload } from '@/types'

interface GroceryListEditorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  listId: string | null
  onCreate: (data: { title: string; labelIds: string[]; items: CreateGroceryItemPayload[] }) => void
}

export default function GroceryListEditor({ open, onOpenChange, listId, onCreate }: GroceryListEditorProps) {
  const isNew = !listId
  const { data: list, isLoading } = useGroceryList(listId)
  const { data: allLabels = [] } = useGroceryLabels()
  const { data: allItemLabels = [] } = useGroceryItemLabels()
  const createLabel = useCreateGroceryLabel()
  const updateList = useUpdateGroceryList()
  const deleteList = useDeleteGroceryList()
  const toggleArchive = useToggleGroceryArchive()
  const createItem = useCreateGroceryItem()
  const updateItem = useUpdateGroceryItem()
  const deleteItem = useDeleteGroceryItem()
  const toggleCheck = useToggleGroceryItemCheck()

  // New list local state
  const [title, setTitle] = useState('')
  const [selectedLabels, setSelectedLabels] = useState<string[]>([])
  const [localItems, setLocalItems] = useState<CreateGroceryItemPayload[]>([])
  const [newLabelName, setNewLabelName] = useState('')
  const [createLabelError, setCreateLabelError] = useState('')
  const [editingTitle, setEditingTitle] = useState(false)
  const [editTitleValue, setEditTitleValue] = useState('')
  const [selectedItemLabelId, setSelectedItemLabelId] = useState<string | null>(null)

  useEffect(() => {
    if (open && isNew) {
      setTitle('')
      setSelectedLabels([])
      setLocalItems([])
    }
    if (!open) {
      setSelectedItemLabelId(null)
    }
  }, [open, isNew])

  const items = (list?.items ?? [])
  const uncheckedItems = items.filter((i) => !i.checked)
  const checkedItems = items.filter((i) => i.checked)
  const totalCount = items.length
  const checkedCount = checkedItems.length
  const progressPercent = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0

  const usedItemLabels = allItemLabels.filter((l) =>
    items.some((item) => item.labels.some((il) => il.id === l.id))
  )

  const filteredUnchecked = selectedItemLabelId
    ? uncheckedItems.filter((i) => i.labels.some((l) => l.id === selectedItemLabelId))
    : uncheckedItems
  const filteredChecked = selectedItemLabelId
    ? checkedItems.filter((i) => i.labels.some((l) => l.id === selectedItemLabelId))
    : checkedItems

  function handleCreateLabel() {
    const trimmed = newLabelName.trim()
    if (!trimmed) return
    setCreateLabelError('')
    createLabel.mutate(
      { name: trimmed },
      {
        onSuccess: (newLabel) => {
          setNewLabelName('')
          setSelectedLabels((prev) => [...prev, newLabel.id])
        },
        onError: (err) => {
          if (err instanceof ApiError && err.status === 409) {
            setCreateLabelError('Label already exists')
          } else {
            setCreateLabelError('Failed to create label')
          }
        },
      }
    )
  }

  function toggleLabelSelection(id: string) {
    if (isNew) {
      setSelectedLabels((prev) =>
        prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]
      )
    } else if (list) {
      const currentIds = (list.labels ?? []).map((l) => l.id)
      const newIds = currentIds.includes(id)
        ? currentIds.filter((l) => l !== id)
        : [...currentIds, id]
      updateList.mutate({ id: list.id, data: { labelIds: newIds } })
    }
  }

  function handleAddItem(data: { name: string; quantity: string; labelIds: string[] }) {
    if (isNew) {
      setLocalItems((prev) => [...prev, { name: data.name, quantity: data.quantity || undefined, labelIds: data.labelIds.length > 0 ? data.labelIds : undefined }])
    } else if (list) {
      createItem.mutate({
        listId: list.id,
        data: { name: data.name, quantity: data.quantity || undefined, labelIds: data.labelIds.length > 0 ? data.labelIds : undefined },
      })
    }
  }

  function handleCreateList() {
    const trimmed = title.trim()
    if (!trimmed) return
    onCreate({
      title: trimmed,
      labelIds: selectedLabels,
      items: localItems,
    })
  }

  function handleArchive() {
    if (!list) return
    const willArchive = !list.archived
    toggleArchive.mutate(list.id, {
      onSuccess: () => {
        useToastStore.getState().addToast(willArchive ? 'List archived' : 'List unarchived')
      },
    })
  }

  function handleToggleCheck(item: GroceryItem) {
    if (!list) return

    const isLastUnchecked = !item.checked && uncheckedItems.length === 1 && totalCount > 0
    const shouldUnarchive = list.archived && item.checked

    toggleCheck.mutate(
      { listId: list.id, itemId: item.id },
      {
        onSuccess: () => {
          if (isLastUnchecked) {
            toggleArchive.mutate(list.id, {
              onSuccess: () => {
                useToastStore.getState().addToast(
                  'List done! Archived.',
                  'default',
                  { label: 'Undo', onClick: () => toggleArchive.mutate(list.id) }
                )
              },
            })
          } else if (shouldUnarchive) {
            toggleArchive.mutate(list.id, {
              onSuccess: () => {
                useToastStore.getState().addToast('List unarchived')
              },
            })
          }
        },
      }
    )
  }

  function handleDelete() {
    if (list) {
      deleteList.mutate(list.id, {
        onSuccess: () => onOpenChange(false),
      })
    }
  }

  function startTitleEdit() {
    if (list) {
      setEditTitleValue(list.title)
      setEditingTitle(true)
    }
  }

  function saveTitleEdit() {
    if (list && editTitleValue.trim()) {
      updateList.mutate({ id: list.id, data: { title: editTitleValue.trim() } })
    }
    setEditingTitle(false)
  }

  const currentLabels = isNew
    ? allLabels.filter((l: GroceryLabel) => selectedLabels.includes(l.id))
    : (list?.labels ?? [])

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg max-h-[85vh] flex flex-col"
        >
          <DialogPrimitive.Title className="sr-only">
            {isNew ? 'New Grocery List' : (list?.title ?? 'Grocery List')}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            {isNew ? 'Create a new grocery list' : 'View and edit your grocery list'}
          </DialogPrimitive.Description>

          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-4">
            <div className="flex-1 min-w-0">
              {isNew ? (
                <Input
                  placeholder="List title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-lg font-semibold border-0 px-0 shadow-none focus-visible:ring-0"
                />
              ) : editingTitle ? (
                <Input
                  value={editTitleValue}
                  onChange={(e) => setEditTitleValue(e.target.value)}
                  onBlur={saveTitleEdit}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveTitleEdit()
                    if (e.key === 'Escape') setEditingTitle(false)
                  }}
                  className="text-lg font-semibold border-0 px-0 shadow-none focus-visible:ring-0"
                  autoFocus
                />
              ) : (
                <h2
                  className="text-lg font-semibold truncate cursor-pointer hover:text-primary"
                  onClick={startTitleEdit}
                >
                  {list?.title}
                  {list?.archived && (
                    <Badge variant="secondary" className="ml-2 text-xs">Archived</Badge>
                  )}
                </h2>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {!isNew && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleArchive}>
                      <Archive className="h-4 w-4 mr-2" />
                      {list?.archived ? 'Unarchive' : 'Archive'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              <button
                onClick={() => onOpenChange(false)}
                className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </button>
            </div>
          </div>

          {/* Labels */}
          <div className="flex items-center gap-2 flex-wrap mb-3">
            {currentLabels.map((label: GroceryLabel) => (
              <Badge
                key={label.id}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => toggleLabelSelection(label.id)}
              >
                {label.name} &times;
              </Badge>
            ))}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 text-xs">
                  + Label
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-52 p-2">
                {allLabels.length > 0 && (
                  <div className="space-y-0.5 max-h-36 overflow-y-auto mb-2">
                    {allLabels.map((label: GroceryLabel) => {
                      const isSelected = isNew
                        ? selectedLabels.includes(label.id)
                        : (list?.labels ?? []).some((l) => l.id === label.id) ?? false
                      return (
                        <button
                          key={label.id}
                          onClick={() => toggleLabelSelection(label.id)}
                          className={cn(
                            'w-full text-left text-sm px-2 py-1 rounded hover:bg-accent',
                            isSelected && 'bg-accent font-medium'
                          )}
                        >
                          {label.name}
                        </button>
                      )
                    })}
                  </div>
                )}
                <div className="border-t pt-2">
                  <div className="flex items-center gap-1">
                    <Input
                      value={newLabelName}
                      onChange={(e) => {
                        setNewLabelName(e.target.value)
                        setCreateLabelError('')
                      }}
                      placeholder="New label..."
                      className="h-7 text-xs flex-1"
                      onKeyDown={(e) => e.key === 'Enter' && handleCreateLabel()}
                    />
                    <Button size="sm" variant="secondary" className="h-7 text-xs px-2" onClick={handleCreateLabel}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  {createLabelError && (
                    <p className="text-[11px] text-destructive mt-1">{createLabelError}</p>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Progress (existing list only) */}
          {!isNew && totalCount > 0 && (
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Progress</span>
                <span>{checkedCount}/{totalCount} checked</span>
              </div>
              <Progress value={progressPercent} />
            </div>
          )}

          {/* Item label filter (existing list only, when labels are in use) */}
          {!isNew && usedItemLabels.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap mb-2">
              <button
                onClick={() => setSelectedItemLabelId(null)}
                className={cn(
                  'text-xs px-2 py-0.5 rounded-full border',
                  !selectedItemLabelId && 'bg-primary text-primary-foreground'
                )}
              >
                All
              </button>
              {usedItemLabels.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setSelectedItemLabelId(l.id === selectedItemLabelId ? null : l.id)}
                  className={cn(
                    'text-xs px-2 py-0.5 rounded-full border',
                    selectedItemLabelId === l.id && 'bg-primary text-primary-foreground'
                  )}
                >
                  {l.name}
                </button>
              ))}
              <GroceryItemLabelManager />
            </div>
          )}

          {/* Items */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {isNew ? (
              <>
                {localItems.length > 0 && (
                  <div className="space-y-1 mb-2">
                    {localItems.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 py-1.5 px-2 hover:bg-accent/50 rounded-md group">
                        <span className="text-sm flex-1">{item.name}</span>
                        {item.quantity && (
                          <span className="text-xs text-muted-foreground">{item.quantity}</span>
                        )}
                        <button
                          onClick={() => setLocalItems((prev) => prev.filter((_, i) => i !== index))}
                          className="p-1 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : isLoading ? (
              <p className="text-sm text-muted-foreground text-center py-4">Loading...</p>
            ) : (
              <>
                {filteredUnchecked.map((item) => (
                  <GroceryItemRow
                    key={item.id}
                    item={item}
                    onToggleCheck={() => handleToggleCheck(item)}
                    onUpdate={(data) => updateItem.mutate({ listId: list!.id, itemId: item.id, data })}
                    onDelete={() => deleteItem.mutate({ listId: list!.id, itemId: item.id })}
                  />
                ))}

                {filteredChecked.length > 0 && (
                  <>
                    <div className="flex items-center gap-2 my-2 px-2">
                      <Separator className="flex-1" />
                      <span className="text-xs text-muted-foreground shrink-0">
                        Checked ({filteredChecked.length})
                      </span>
                      <Separator className="flex-1" />
                    </div>
                    {filteredChecked.map((item) => (
                      <GroceryItemRow
                        key={item.id}
                        item={item}
                        onToggleCheck={() => handleToggleCheck(item)}
                        onUpdate={(data) => updateItem.mutate({ listId: list!.id, itemId: item.id, data })}
                        onDelete={() => deleteItem.mutate({ listId: list!.id, itemId: item.id })}
                      />
                    ))}
                  </>
                )}
              </>
            )}

            {/* Add item input */}
            <GroceryItemInput allItemLabels={allItemLabels} onAdd={handleAddItem} />
          </div>

          {/* Create button (new list only) */}
          {isNew && (
            <div className="flex justify-end mt-4 pt-3 border-t">
              <Button onClick={handleCreateList} disabled={!title.trim()}>
                Create List
              </Button>
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
