import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NotesToolbar from './NotesToolbar'

const defaultProps = {
  searchQuery: '',
  onSearchChange: vi.fn(),
  activeTab: 'active' as const,
  onTabChange: vi.fn(),
}

describe('NotesToolbar', () => {
  it('renders search input', () => {
    render(<NotesToolbar {...defaultProps} />)
    expect(screen.getByPlaceholderText(/search notes/i)).toBeInTheDocument()
  })

  it('calls onSearchChange when typing', async () => {
    const onSearchChange = vi.fn()
    render(<NotesToolbar {...defaultProps} onSearchChange={onSearchChange} />)
    const user = userEvent.setup()
    await user.type(screen.getByPlaceholderText(/search notes/i), 'hello')
    expect(onSearchChange).toHaveBeenCalled()
  })

  it('shows three-dots menu with archived option', async () => {
    const onTabChange = vi.fn()
    render(<NotesToolbar {...defaultProps} onTabChange={onTabChange} />)
    const user = userEvent.setup()
    // Click the dropdown trigger (MoreVertical icon button)
    const menuButton = screen.getByRole('button')
    await user.click(menuButton)
    expect(screen.getByText('Archived notes')).toBeInTheDocument()
  })

  it('shows active notes option when on archived tab', async () => {
    render(<NotesToolbar {...defaultProps} activeTab="archived" />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button'))
    expect(screen.getByText('Active notes')).toBeInTheDocument()
  })
})
