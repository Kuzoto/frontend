// AI-assisted test generated with ChatGPT.
// Prompt used: "Generate Vitest/React Testing Library tests for TodosPage."

import { render, screen } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import TodosPage from './TodosPage'

vi.mock('@/hooks/useTodos', () => ({
  useDebouncedValue: (value: string) => value,
  useTodosInfinite: vi.fn(),
  useCreateTodo: vi.fn(),
  useDeleteTodo: vi.fn(),
  useToggleTodoArchive: vi.fn(),
  useToggleTodoComplete: vi.fn(),
}))

const mockedHooks = await import('@/hooks/useTodos')

describe('TodosPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(mockedHooks.useCreateTodo).mockReturnValue({
      mutate: vi.fn(),
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

  it('renders empty state when there are no todos', () => {
    vi.mocked(mockedHooks.useTodosInfinite).mockReturnValue({
      data: { pages: [{ content: [] }] },
      isLoading: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: vi.fn(),
    } as never)

    render(<TodosPage />)

    expect(screen.getByText('Todos')).toBeInTheDocument()
    expect(screen.getByText('No todos yet')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Add a new todo...')).toBeInTheDocument()
  })

  it('renders todos when data is loaded', () => {
    vi.mocked(mockedHooks.useTodosInfinite).mockReturnValue({
      data: {
        pages: [
          {
            content: [
              {
                id: '1',
                title: 'Buy milk',
                completed: false,
                archived: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              {
                id: '2',
                title: 'Finish homework',
                completed: true,
                archived: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            ],
          },
        ],
      },
      isLoading: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: vi.fn(),
    } as never)

    render(<TodosPage />)

    expect(screen.getByText('Buy milk')).toBeInTheDocument()
    expect(screen.getByText('Finish homework')).toBeInTheDocument()
  })

  it('renders loading state', () => {
    vi.mocked(mockedHooks.useTodosInfinite).mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: vi.fn(),
    } as never)

    render(<TodosPage />)

    expect(screen.getByText('Loading todos...')).toBeInTheDocument()
  })
})