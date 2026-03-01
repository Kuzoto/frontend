import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import TopNav from './TopNav'
import { useAuth } from '@/hooks/useAuth'

vi.mock('@/hooks/useAuth')

const mockUseAuth = useAuth as ReturnType<typeof vi.fn>

function renderNav() {
  return render(
    <MemoryRouter>
      <TopNav />
    </MemoryRouter>
  )
}

describe('TopNav', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders logged-out state with sign-up and log-in buttons', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
    })
    renderNav()
    expect(screen.getByText(/sign up/i)).toBeInTheDocument()
    expect(screen.getByText(/log in/i)).toBeInTheDocument()
  })

  it('renders logged-in state with user name and avatar button', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', name: 'Jane', email: 'jane@example.com' },
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    })
    renderNav()
    expect(screen.getByText(/hi, jane/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/user menu/i)).toBeInTheDocument()
  })
})
