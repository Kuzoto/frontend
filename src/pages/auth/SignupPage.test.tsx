import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
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
  mockUseAuth.mockReturnValue({ user: null, isAuthenticated: false, login: vi.fn(), logout: vi.fn() })
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
})
