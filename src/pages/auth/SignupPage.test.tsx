import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import SignupPage from './SignupPage'
import { useAuth } from '@/hooks/useAuth'

vi.mock('@/hooks/useAuth')
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => vi.fn() }
})

const mockUseAuth = useAuth as ReturnType<typeof vi.fn>

function renderPage() {
  mockUseAuth.mockReturnValue({ user: null, isAuthenticated: false, login: vi.fn(), logout: vi.fn(), setTokens: vi.fn() })
  return render(
    <MemoryRouter>
      <SignupPage />
    </MemoryRouter>
  )
}

describe('SignupPage', () => {
  it('renders name, email, password, confirm fields', () => {
    renderPage()
    expect(screen.getByLabelText(/^name$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
  })

  it('renders sign up button', () => {
    renderPage()
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument()
  })

  it('renders feature list bullets', () => {
    renderPage()
    expect(screen.getByText(/capture and organise/i)).toBeInTheDocument()
  })

  it('renders login navigation link', () => {
    renderPage()
    expect(screen.getByRole('link', { name: /log in/i })).toBeInTheDocument()
  })

  it('shows error when passwords do not match', async () => {
    renderPage()
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/^name$/i), 'Jane')
    await user.type(screen.getByLabelText(/email/i), 'jane@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'different123')
    await user.click(screen.getByRole('button', { name: /sign up/i }))
    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
  })
})
