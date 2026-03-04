import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import NotesPage from './NotesPage'

vi.mock('@/lib/api', () => ({
  ApiError: class ApiError extends Error {
    status: number
    errors: Record<string, string> | null
    constructor(status: number, message: string, errors: Record<string, string> | null = null) {
      super(message)
      this.status = status
      this.errors = errors
      this.name = 'ApiError'
    }
  },
}))

vi.mock('@/hooks/useNotes', () => ({
  useNotesInfinite: () => ({
    data: undefined,
    fetchNextPage: vi.fn(),
    hasNextPage: false,
    isFetchingNextPage: false,
    isLoading: false,
  }),
  useLabels: () => ({ data: [] }),
  useCreateNote: () => ({ mutate: vi.fn(), isPending: false }),
  useUpdateNote: () => ({ mutate: vi.fn(), isPending: false }),
  useDeleteNote: () => ({ mutate: vi.fn() }),
  useTogglePin: () => ({ mutate: vi.fn() }),
  useBulkDeleteNotes: () => ({ mutate: vi.fn() }),
  useBulkArchiveNotes: () => ({ mutate: vi.fn() }),
  useCreateLabel: () => ({ mutate: vi.fn() }),
  useUpdateLabel: () => ({ mutate: vi.fn() }),
  useDeleteLabel: () => ({ mutate: vi.fn() }),
  useDebouncedValue: (val: string) => val,
}))

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <NotesPage />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('NotesPage', () => {
  it('renders the page title', () => {
    renderPage()
    expect(screen.getByText('Notes')).toBeInTheDocument()
  })

  it('renders the toolbar with search input', () => {
    renderPage()
    expect(screen.getByPlaceholderText(/search notes/i)).toBeInTheDocument()
  })

  it('shows empty state when no notes', () => {
    renderPage()
    expect(screen.getByText(/create your first note/i)).toBeInTheDocument()
  })

  it('renders new note button', () => {
    renderPage()
    expect(screen.getAllByRole('button', { name: /new note/i }).length).toBeGreaterThan(0)
  })
})
