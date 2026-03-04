import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import GroceryToolbar from './GroceryToolbar'

const defaultProps = {
  searchQuery: '',
  onSearchChange: vi.fn(),
  activeTab: 'active' as const,
  onTabChange: vi.fn(),
}

describe('GroceryToolbar', () => {
  it('renders search input', () => {
    render(<GroceryToolbar {...defaultProps} />)
    expect(screen.getByPlaceholderText(/search lists/i)).toBeInTheDocument()
  })

  it('renders Active and Archived toggle buttons', () => {
    render(<GroceryToolbar {...defaultProps} />)
    expect(screen.getByRole('button', { name: /active/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /archived/i })).toBeInTheDocument()
  })

  it('calls onTabChange with "archived" when Archived button is clicked', async () => {
    const onTabChange = vi.fn()
    render(<GroceryToolbar {...defaultProps} onTabChange={onTabChange} />)
    await userEvent.setup().click(screen.getByRole('button', { name: /archived/i }))
    expect(onTabChange).toHaveBeenCalledWith('archived')
  })

  it('calls onTabChange with "active" when Active button is clicked on archived tab', async () => {
    const onTabChange = vi.fn()
    render(<GroceryToolbar {...defaultProps} activeTab="archived" onTabChange={onTabChange} />)
    await userEvent.setup().click(screen.getByRole('button', { name: /active/i }))
    expect(onTabChange).toHaveBeenCalledWith('active')
  })
})
