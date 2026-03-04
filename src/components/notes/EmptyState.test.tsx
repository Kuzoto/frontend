import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EmptyState from './EmptyState'

describe('EmptyState', () => {
  it('renders heading and description', () => {
    render(<EmptyState onCreateNote={vi.fn()} />)
    expect(screen.getByText(/create your first note/i)).toBeInTheDocument()
  })

  it('calls onCreateNote when button is clicked', async () => {
    const onCreateNote = vi.fn()
    render(<EmptyState onCreateNote={onCreateNote} />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /new note/i }))
    expect(onCreateNote).toHaveBeenCalledOnce()
  })
})
