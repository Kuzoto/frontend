import { useState, useEffect, useRef, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { Bold, Italic, List, ListOrdered, CheckSquare, Pin, Plus, X, Sparkles } from 'lucide-react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { useLabels, useCreateLabel } from '@/hooks/useNotes'
import { ApiError } from '@/lib/api'
import type { Note, NoteLabel } from '@/types'
import AiRecommendationPanel, { type AiSuggestion } from '@/components/shared/AiRecommendationPanel'

interface NoteEditorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  note: Note | null
  onSave: (data: { title: string; content: string; pinned: boolean; labelIds: string[] }) => void
  error?: string | null
  fieldErrors?: Record<string, string> | null
}

export default function NoteEditor({ open, onOpenChange, note, onSave, error, fieldErrors }: NoteEditorProps) {
  const { data: allLabels = [] } = useLabels()
  const createLabel = useCreateLabel()
  const [title, setTitle] = useState('')
  const [selectedLabels, setSelectedLabels] = useState<string[]>([])
  const [pinned, setPinned] = useState(false)
  const [newLabelName, setNewLabelName] = useState('')
  const [createLabelError, setCreateLabelError] = useState('')
  const [showAiPanel, setShowAiPanel] = useState(false)
  const closedByX = useRef(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] px-3 py-2',
      },
    },
  })

  useEffect(() => {
    if (open) {
      setTitle(note?.title ?? '')
      setSelectedLabels(note?.labels.map((l) => l.id) ?? [])
      setPinned(note?.pinned ?? false)
      editor?.commands.setContent(note?.content ?? '')
      closedByX.current = false
      setShowAiPanel(false)
    }
  }, [open, note, editor])

  const getCurrentData = useCallback(() => ({
    title,
    content: editor?.getHTML() ?? '',
    pinned,
    labelIds: selectedLabels,
  }), [title, editor, pinned, selectedLabels])

  function handleClose(openState: boolean) {
    if (!openState) {
      // If closed by X button, just discard
      if (closedByX.current) {
        closedByX.current = false
        onOpenChange(false)
        return
      }
      // Otherwise (click outside), auto-save
      const data = getCurrentData()
      const hasContent = data.title.trim() || (data.content && data.content !== '<p></p>')
      if (hasContent || note) {
        onSave(data)
      } else {
        onOpenChange(false)
      }
    }
  }

  function handleXClose(e: React.MouseEvent) {
    e.preventDefault()
    closedByX.current = true
    onOpenChange(false)
  }

  function toggleLabel(id: string) {
    setSelectedLabels((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]
    )
  }

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

  const selectedLabelObjects = allLabels.filter((l: NoteLabel) => selectedLabels.includes(l.id))

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleClose}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg max-h-[85vh] flex flex-col"
        >
          <DialogPrimitive.Title className="sr-only">
            {note ? 'Edit note' : 'New note'}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            {note ? 'Edit your note' : 'Create a new note'}
          </DialogPrimitive.Description>

          {/* X close button (discards changes) */}
          <button
            onClick={handleXClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>

          <div className="flex-1 overflow-y-auto space-y-3">
            {/* Title + Pin */}
            <div className="flex items-center gap-2">
              <Input
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-xl font-semibold border-0 px-0 shadow-none focus-visible:ring-0 flex-1"
              />
              <button
                type="button"
                onClick={() => setPinned((p) => !p)}
                className={cn(
                  'p-1.5 rounded-md transition-colors shrink-0',
                  pinned
                    ? 'text-amber-500 bg-amber-50 dark:bg-amber-950'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                title={pinned ? 'Unpin note' : 'Pin note'}
              >
                <Pin className="h-4 w-4" />
              </button>
            </div>
            {fieldErrors?.title && (
              <p className="text-xs text-destructive">{fieldErrors.title}</p>
            )}

            {/* Toolbar */}
            <div className="flex items-center gap-1 border-b pb-2">
              <ToolbarButton
                active={editor?.isActive('bold') ?? false}
                onClick={() => editor?.chain().focus().toggleBold().run()}
              >
                <Bold className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                active={editor?.isActive('italic') ?? false}
                onClick={() => editor?.chain().focus().toggleItalic().run()}
              >
                <Italic className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                active={editor?.isActive('bulletList') ?? false}
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
              >
                <List className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                active={editor?.isActive('orderedList') ?? false}
                onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              >
                <ListOrdered className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                active={editor?.isActive('taskList') ?? false}
                onClick={() => editor?.chain().focus().toggleTaskList().run()}
              >
                <CheckSquare className="h-4 w-4" />
              </ToolbarButton>
              <div className="ml-auto">
                <ToolbarButton
                  active={showAiPanel}
                  onClick={() => setShowAiPanel((v) => !v)}
                >
                  <Sparkles className="h-4 w-4 text-purple-500" />
                </ToolbarButton>
              </div>
            </div>

            {/* Editor */}
            <EditorContent editor={editor} />

            {/* AI Recommendation Panel */}
            {showAiPanel && (
              <AiRecommendationPanel
                type="note"
                title={title}
                currentContent={editor?.getHTML()}
                onApply={(suggestion: AiSuggestion) => {
                  if (suggestion.type === 'note') {
                    editor?.commands.setContent(suggestion.html)
                  }
                  setShowAiPanel(false)
                }}
                onDismiss={() => setShowAiPanel(false)}
              />
            )}

            {/* Label picker */}
            <div className="flex items-center gap-2 flex-wrap">
              {selectedLabelObjects.map((label: NoteLabel) => (
                <Badge
                  key={label.id}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => toggleLabel(label.id)}
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
                      {allLabels.map((label: NoteLabel) => (
                        <button
                          key={label.id}
                          onClick={() => toggleLabel(label.id)}
                          className={cn(
                            'w-full text-left text-sm px-2 py-1 rounded hover:bg-accent',
                            selectedLabels.includes(label.id) && 'bg-accent font-medium'
                          )}
                        >
                          {label.name}
                        </button>
                      ))}
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
          </div>

          {error && (
            <p className="text-sm text-destructive px-1 mt-2">{error}</p>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

function ToolbarButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'p-1.5 rounded-md transition-colors',
        active ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
      )}
    >
      {children}
    </button>
  )
}
