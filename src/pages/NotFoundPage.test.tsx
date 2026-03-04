import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import NotFoundPage from './NotFoundPage'
import { useAuth } from '@/hooks/useAuth'

vi.mock('@/hooks/useAuth')

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

const mockUseAuth = useAuth as ReturnType<typeof vi.fn>

function renderPage(isAuthenticated: boolean) {
  mockUseAuth.mockReturnValue({ isAuthenticated })
  return render(
    <MemoryRouter>
      <NotFoundPage />
    </MemoryRouter>
  )
}

describe('NotFoundPage', () => {
  it('renders the 404 heading', () => {
    renderPage(false)
    expect(screen.getByRole('heading', { name: /this room doesn't exist/i })).toBeInTheDocument()
  })

  it('renders the 404 number', () => {
    renderPage(false)
    expect(screen.getByText('404')).toBeInTheDocument()
  })

  it('shows Go to Login button when unauthenticated', () => {
    renderPage(false)
    expect(screen.getByRole('button', { name: /go to login/i })).toBeInTheDocument()
  })

  it('shows Go to Dashboard button when authenticated', () => {
    renderPage(true)
    expect(screen.getByRole('button', { name: /go to dashboard/i })).toBeInTheDocument()
  })

  it('navigates to /login when unauthenticated and button clicked', async () => {
    renderPage(false)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /go to login/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })

  it('navigates to /dashboard when authenticated and button clicked', async () => {
    renderPage(true)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /go to dashboard/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
  })
})
