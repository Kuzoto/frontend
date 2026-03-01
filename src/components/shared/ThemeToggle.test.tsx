import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ThemeToggle from './ThemeToggle'
import { useTheme } from '@/hooks/useTheme'

vi.mock('@/hooks/useTheme')

const mockUseTheme = useTheme as ReturnType<typeof vi.fn>

describe('ThemeToggle', () => {
  const setTheme = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseTheme.mockReturnValue({ theme: 'system', setTheme })
  })

  it('renders all three theme options', () => {
    render(<ThemeToggle />)
    expect(screen.getByLabelText(/light theme/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/dark theme/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/system theme/i)).toBeInTheDocument()
  })

  it('calls setTheme with "light" when Light button is clicked', async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)
    await user.click(screen.getByLabelText(/light theme/i))
    expect(setTheme).toHaveBeenCalledWith('light')
  })

  it('calls setTheme with "dark" when Dark button is clicked', async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)
    await user.click(screen.getByLabelText(/dark theme/i))
    expect(setTheme).toHaveBeenCalledWith('dark')
  })
})
