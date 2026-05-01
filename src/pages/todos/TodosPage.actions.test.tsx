// AI-assisted test generated with ChatGPT.
// Prompt used: "Generate a Vitest test for creating a todo from TodosPage."

import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import TodosPage from './TodosPage'

const createMutate = vi.fn()

vi.mock('@/hooks/useTodos', () => ({
  useDebouncedValue: (value: string) => value,
  useTodosInfinite: vi.fn(),
  useCreateTodo: vi.fn(),
  useDeleteTodo: vi.fn(),
  useToggleTodoArchive: vi.fn(),
  useToggleTodoComplete: vi.fn(),
}))

const mockedHooks = await import('@/hooks/useTodos')

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <TodosPage />
    </QueryClientProvider>
  )
}

describe('TodosPage actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(mockedHooks.useTodosInfinite).mockReturnValue({
      data: { pages: [{ content: [] }] },
      isLoading: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: vi.fn(),
    } as never)

    vi.mocked(mockedHooks.useCreateTodo).mockReturnValue({
      mutate: createMutate,
      isPending: false,
    } as never)

    vi.mocked(mockedHooks.useDeleteTodo).mockReturnValue({
      mutate: vi.fn(),
    } as never)

    vi.mocked(mockedHooks.useToggleTodoArchive).mockReturnValue({
      mutate: vi.fn(),
    } as never)

    vi.mocked(mockedHooks.useToggleTodoComplete).mockReturnValue({
      mutate: vi.fn(),
    } as never)
  })

  it('submits a new todo', () => {
    renderPage()

    fireEvent.change(screen.getByPlaceholderText('Add a new todo...'), {
      target: { value: 'Buy milk' },
    })

    fireEvent.click(screen.getByRole('button', { name: /add/i }))

    expect(createMutate).toHaveBeenCalledWith({ title: 'Buy milk' })
  })
})