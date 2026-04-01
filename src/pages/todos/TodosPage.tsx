// AI-assisted code generated with ChatGPT.
// Prompt: Given these repos, help me implement the todos feature.

import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { CheckSquare, Trash2, Archive, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  useCreateTodo,
  useDeleteTodo,
  useTodosInfinite,
  useToggleTodoArchive,
  useToggleTodoComplete,
  useDebouncedValue,
} from '@/hooks/useTodos'
import type { Todo } from '@/types'

function TodoRow({
  todo,
  onToggleComplete,
  onArchive,
  onDelete,
}: {
  todo: Todo
  onToggleComplete: (id: string) => void
  onArchive: (id: string) => void
  onDelete: (id: string) => void
}) {
  return (
    <Card className={todo.completed ? 'opacity-70' : ''}>
      <CardContent className="flex items-center gap-3 p-4">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggleComplete(todo.id)}
          className="h-4 w-4"
        />

        <div className="min-w-0 flex-1">
          <p
            className={
              todo.completed
                ? 'truncate text-sm line-through text-muted-foreground'
                : 'truncate text-sm font-medium'
            }
          >
            {todo.title}
          </p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onArchive(todo.id)}
          title={todo.archived ? 'Unarchive todo' : 'Archive todo'}
        >
          <Archive className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(todo.id)}
          title="Delete todo"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  )
}

export default function TodosPage() {
  const [search, setSearch] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [archived, setArchived] = useState(false)

  const debouncedSearch = useDebouncedValue(search, 300)

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useTodosInfinite({
      search: debouncedSearch,
      archived,
      size: 20,
    })

  const createTodo = useCreateTodo()
  const deleteTodo = useDeleteTodo()
  const toggleComplete = useToggleTodoComplete()
  const toggleArchive = useToggleTodoArchive()

  const todos = useMemo(
    () => data?.pages.flatMap((page) => page.content) ?? [],
    [data]
  )

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const title = newTitle.trim()
    if (!title) return

    createTodo.mutate({ title })
    setNewTitle('')
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-green-500/15 p-2 text-green-600">
          <CheckSquare className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">Todos</h1>
          <p className="text-sm text-muted-foreground">
            Keep track of tasks and cross them off as you go.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Search todos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="flex gap-2">
          <Button
            variant={!archived ? 'default' : 'outline'}
            onClick={() => setArchived(false)}
          >
            Active
          </Button>
          <Button
            variant={archived ? 'default' : 'outline'}
            onClick={() => setArchived(true)}
          >
            Archived
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          placeholder="Add a new todo..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <Button type="submit" disabled={createTodo.isPending}>
          <Plus className="mr-2 h-4 w-4" />
          Add
        </Button>
      </form>

      <div className="flex flex-col gap-3">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading todos...</p>
        ) : todos.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-2 p-10 text-center">
              <CheckSquare className="h-8 w-8 text-muted-foreground" />
              <h2 className="text-lg font-medium">No todos yet</h2>
              <p className="text-sm text-muted-foreground">
                Add your first todo above.
              </p>
            </CardContent>
          </Card>
        ) : (
          todos.map((todo) => (
            <TodoRow
              key={todo.id}
              todo={todo}
              onToggleComplete={(id) => toggleComplete.mutate(id)}
              onArchive={(id) => toggleArchive.mutate(id)}
              onDelete={(id) => deleteTodo.mutate(id)}
            />
          ))
        )}
      </div>

      {hasNextPage && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? 'Loading more...' : 'Load more'}
          </Button>
        </div>
      )}
    </div>
  )
}