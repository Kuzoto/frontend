import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import LoginPage from './LoginPage'
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
      <LoginPage />
    </MemoryRouter>
  )
}

describe('LoginPage', () => {
  it('renders email and password fields', () => {
    renderPage()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('renders log in button', () => {
    renderPage()
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument()
  })

  it('renders sign up navigation link', () => {
    renderPage()
    expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument()
  })

  it('shows validation error for empty email', async () => {
    renderPage()
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /log in/i }))
    expect(screen.getByText(/email is required/i)).toBeInTheDocument()
  })

  it('shows validation error for empty password', async () => {
    renderPage()
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.click(screen.getByRole('button', { name: /log in/i }))
    expect(screen.getByText(/password is required/i)).toBeInTheDocument()
  })
})
