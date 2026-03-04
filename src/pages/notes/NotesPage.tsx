import { useState, useRef, useEffect, useCallback } from 'react'
import { Plus } from 'lucide-react'
import NotesToolbar from '@/components/notes/NotesToolbar'
import NoteCard from '@/components/notes/NoteCard'
import NoteEditor from '@/components/notes/NoteEditor'
import LabelFilter from '@/components/notes/LabelFilter'
import LabelManager from '@/components/notes/LabelManager'
import FloatingActionBar from '@/components/notes/FloatingActionBar'
import EmptyState from '@/components/notes/EmptyState'
import { Button } from '@/components/ui/button'
import {
  useNotesInfinite,
  useLabels,
  useCreateNote,
  useUpdateNote,
  useTogglePin,
  useBulkDeleteNotes,
  useBulkArchiveNotes,
  useDebouncedValue,
} from '@/hooks/useNotes'
import { ApiError } from '@/lib/api'
import type { Note } from '@/types'

export default function NotesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active')
  const [selectedLabelId, setSelectedLabelId] = useState<string | null>(null)
  const [selectedNoteIds, setSelectedNoteIds] = useState<Set<string>>(new Set())
  const [editorOpen, setEditorOpen] = useState(false)
  const [editorNote, setEditorNote] = useState<Note | null>(null)
  const [editorError, setEditorError] = useState<string | null>(null)
  const [editorFieldErrors, setEditorFieldErrors] = useState<Record<string, string> | null>(null)

  const debouncedSearch = useDebouncedValue(searchQuery, 300)

  const { data: labels = [] } = useLabels()
  const {
    data: notesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useNotesInfinite({
    search: debouncedSearch || undefined,
    archived: activeTab === 'archived',
    size: 20,
  })

  const createNote = useCreateNote()
  const updateNote = useUpdateNote()
  const togglePin = useTogglePin()
  const bulkDelete = useBulkDeleteNotes()
  const bulkArchive = useBulkArchiveNotes()

  // Flatten pages and filter by label client-side
  const rawNotes = notesData?.pages.flatMap((page) => page.content) ?? []
  const allNotes = selectedLabelId
    ? rawNotes.filter((n) => n.labels.some((l) => l.id === selectedLabelId))
    : rawNotes
  const pinnedNotes = allNotes.filter((n) => n.pinned && !n.archived)
  const unpinnedNotes = allNotes.filter((n) => !n.pinned || n.archived)

  // Infinite scroll sentinel
  const sentinelRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { rootMargin: '200px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  // Selection
  const toggleSelect = useCallback((id: string) => {
    setSelectedNoteIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const clearSelection = useCallback(() => setSelectedNoteIds(new Set()), [])

  function openNewNote() {
    setEditorNote(null)
    setEditorError(null)
    setEditorFieldErrors(null)
    setEditorOpen(true)
  }

  function openEditNote(note: Note) {
    setEditorNote(note)
    setEditorError(null)
    setEditorFieldErrors(null)
    setEditorOpen(true)
  }

  function handleEditorError(error: unknown) {
    if (error instanceof ApiError) {
      setEditorError(error.message)
      setEditorFieldErrors(error.errors)
    } else {
      setEditorError('An unexpected error occurred')
    }
  }

  function handleSave(data: { title: string; content: string; pinned: boolean; labelIds: string[] }) {
    setEditorError(null)
    setEditorFieldErrors(null)
    if (editorNote) {
      updateNote.mutate(
        { id: editorNote.id, data },
        {
          onSuccess: () => setEditorOpen(false),
          onError: handleEditorError,
        }
      )
    } else {
      createNote.mutate(data, {
        onSuccess: () => setEditorOpen(false),
        onError: handleEditorError,
      })
    }
  }

  function handleBulkArchive() {
    bulkArchive.mutate([...selectedNoteIds], { onSuccess: clearSelection })
  }

  function handleBulkDelete() {
    bulkDelete.mutate([...selectedNoteIds], { onSuccess: clearSelection })
  }

  const isEmpty = !isLoading && allNotes.length === 0 && !debouncedSearch
  const noResults = !isLoading && allNotes.length === 0 && !!debouncedSearch

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Notes</h1>
        <p className="text-muted-foreground text-sm">
          Capture and organize your thoughts
        </p>
      </div>

      <NotesToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="flex items-center gap-2">
        <LabelFilter
          labels={labels}
          selectedLabelId={selectedLabelId}
          onSelectLabel={setSelectedLabelId}
        />
        <LabelManager />
      </div>

      {isEmpty ? (
        activeTab === 'archived' ? (
          <p className="text-center text-muted-foreground py-12">
            No archived notes
          </p>
        ) : (
          <EmptyState onCreateNote={openNewNote} />
        )
      ) : noResults ? (
        <p className="text-center text-muted-foreground py-12">
          No notes found for &ldquo;{debouncedSearch}&rdquo;
        </p>
      ) : (
        <>
          {/* Pinned section */}
          {pinnedNotes.length > 0 && activeTab === 'active' && (
            <div>
              <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                Pinned
              </h2>
              <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
                {pinnedNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    selected={selectedNoteIds.has(note.id)}
                    selectionMode={selectedNoteIds.size > 0}
                    onSelect={toggleSelect}
                    onClick={openEditNote}
                    onTogglePin={(id) => togglePin.mutate(id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Others */}
          {unpinnedNotes.length > 0 && (
            <div>
              {pinnedNotes.length > 0 && activeTab === 'active' && (
                <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                  Others
                </h2>
              )}
              <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
                {unpinnedNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    selected={selectedNoteIds.has(note.id)}
                    selectionMode={selectedNoteIds.size > 0}
                    onSelect={toggleSelect}
                    onClick={openEditNote}
                    onTogglePin={(id) => togglePin.mutate(id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Sentinel for infinite scroll */}
          <div ref={sentinelRef} className="h-4" />
          {isFetchingNextPage && (
            <p className="text-center text-sm text-muted-foreground">Loading more...</p>
          )}
        </>
      )}

      {/* Floating action bar */}
      <FloatingActionBar
        count={selectedNoteIds.size}
        onArchive={handleBulkArchive}
        onDelete={handleBulkDelete}
        onCancel={clearSelection}
      />

      {/* Floating add button */}
      <Button
        onClick={openNewNote}
        size="icon"
        className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-lg z-40"
      >
        <Plus className="h-7 w-7" />
      </Button>

      {/* Note editor dialog */}
      <NoteEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        note={editorNote}
        onSave={handleSave}
        error={editorError}
        fieldErrors={editorFieldErrors}
      />
    </div>
  )
}
