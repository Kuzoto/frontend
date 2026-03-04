import { useState, useRef, useEffect, useCallback } from 'react'
import { Plus } from 'lucide-react'
import GroceryToolbar from '@/components/groceries/GroceryToolbar'
import GroceryListCard from '@/components/groceries/GroceryListCard'
import GroceryListEditor from '@/components/groceries/GroceryListEditor'
import GroceryLabelFilter from '@/components/groceries/GroceryLabelFilter'
import GroceryLabelManager from '@/components/groceries/GroceryLabelManager'
import GroceryFloatingActionBar from '@/components/groceries/GroceryFloatingActionBar'
import GroceryEmptyState from '@/components/groceries/GroceryEmptyState'
import { Button } from '@/components/ui/button'
import {
  useGroceryListsInfinite,
  useGroceryLabels,
  useCreateGroceryList,
  useBulkDeleteGroceryLists,
  useBulkArchiveGroceryLists,
} from '@/hooks/useGroceries'
import { useDebouncedValue } from '@/hooks/useNotes'
import type { GroceryListSummary, CreateGroceryItemPayload } from '@/types'

export default function GroceriesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active')
  const [selectedLabelId, setSelectedLabelId] = useState<string | null>(null)
  const [selectedListIds, setSelectedListIds] = useState<Set<string>>(new Set())
  const [editorOpen, setEditorOpen] = useState(false)
  const [editorListId, setEditorListId] = useState<string | null>(null)

  const debouncedSearch = useDebouncedValue(searchQuery, 300)

  const { data: labels = [] } = useGroceryLabels()
  const {
    data: listsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useGroceryListsInfinite({
    search: debouncedSearch || undefined,
    archived: activeTab === 'archived',
    size: 20,
  })

  const createList = useCreateGroceryList()
  const bulkDelete = useBulkDeleteGroceryLists()
  const bulkArchive = useBulkArchiveGroceryLists()

  // Flatten pages and filter by label client-side
  const rawLists = listsData?.pages.flatMap((page) => page.content) ?? []
  const allLists = selectedLabelId
    ? rawLists.filter((l) => (l.labels ?? []).some((lb) => lb.id === selectedLabelId))
    : rawLists

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
    setSelectedListIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const clearSelection = useCallback(() => setSelectedListIds(new Set()), [])

  function openNewList() {
    setEditorListId(null)
    setEditorOpen(true)
  }

  function openEditList(list: GroceryListSummary) {
    setEditorListId(list.id)
    setEditorOpen(true)
  }

  function handleCreate(data: { title: string; labelIds: string[]; items: CreateGroceryItemPayload[] }) {
    createList.mutate(
      {
        title: data.title,
        labelIds: data.labelIds.length > 0 ? data.labelIds : undefined,
        items: data.items.length > 0 ? data.items : undefined,
      },
      { onSuccess: () => setEditorOpen(false) }
    )
  }

  function handleBulkArchive() {
    bulkArchive.mutate([...selectedListIds], { onSuccess: clearSelection })
  }

  function handleBulkDelete() {
    bulkDelete.mutate([...selectedListIds], { onSuccess: clearSelection })
  }

  const isEmpty = !isLoading && allLists.length === 0 && !debouncedSearch
  const noResults = !isLoading && allLists.length === 0 && !!debouncedSearch

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Grocery Lists</h1>
        <p className="text-muted-foreground text-sm">
          Manage your shopping lists
        </p>
      </div>

      <GroceryToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="flex items-center gap-2">
        <GroceryLabelFilter
          labels={labels}
          selectedLabelId={selectedLabelId}
          onSelectLabel={setSelectedLabelId}
        />
        <GroceryLabelManager />
      </div>

      {isEmpty ? (
        activeTab === 'archived' ? (
          <p className="text-center text-muted-foreground py-12">
            No archived grocery lists
          </p>
        ) : (
          <GroceryEmptyState onCreateList={openNewList} />
        )
      ) : noResults ? (
        <p className="text-center text-muted-foreground py-12">
          No lists found for &ldquo;{debouncedSearch}&rdquo;
        </p>
      ) : (
        <>
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
            {allLists.map((list) => (
              <GroceryListCard
                key={list.id}
                list={list}
                selected={selectedListIds.has(list.id)}
                selectionMode={selectedListIds.size > 0}
                onSelect={toggleSelect}
                onClick={openEditList}
              />
            ))}
          </div>

          {/* Sentinel for infinite scroll */}
          <div ref={sentinelRef} className="h-4" />
          {isFetchingNextPage && (
            <p className="text-center text-sm text-muted-foreground">Loading more...</p>
          )}
        </>
      )}

      {/* Floating action bar */}
      <GroceryFloatingActionBar
        count={selectedListIds.size}
        onArchive={handleBulkArchive}
        onDelete={handleBulkDelete}
        onCancel={clearSelection}
      />

      {/* Floating add button */}
      <Button
        onClick={openNewList}
        size="icon"
        className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-lg z-40"
      >
        <Plus className="h-7 w-7" />
      </Button>

      {/* List editor dialog */}
      <GroceryListEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        listId={editorListId}
        onCreate={handleCreate}
      />
    </div>
  )
}
