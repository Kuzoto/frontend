import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NoteCard from './NoteCard'
import type { Note } from '@/types'

const mockNote: Note = {
  id: '1',
  title: 'Test Note',
  content: '<p>Hello world</p>',
  pinned: false,
  archived: false,
  labels: [{ id: 'l1', name: 'Work', createdAt: '2024-01-01' }],
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
}

const defaultProps = {
  note: mockNote,
  selected: false,
  selectionMode: false,
  onSelect: vi.fn(),
  onClick: vi.fn(),
  onTogglePin: vi.fn(),
}

describe('NoteCard', () => {
  it('renders note title', () => {
    render(<NoteCard {...defaultProps} />)
    expect(screen.getByText('Test Note')).toBeInTheDocument()
  })

  it('renders content preview as plain text', () => {
    render(<NoteCard {...defaultProps} />)
    expect(screen.getByText('Hello world')).toBeInTheDocument()
  })

  it('renders label badges', () => {
    render(<NoteCard {...defaultProps} />)
    expect(screen.getByText('Work')).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn()
    render(<NoteCard {...defaultProps} onClick={onClick} />)
    const user = userEvent.setup()
    await user.click(screen.getByText('Test Note'))
    expect(onClick).toHaveBeenCalledWith(mockNote)
  })

  it('shows pinned border when pinned', () => {
    const pinnedNote = { ...mockNote, pinned: true }
    const { container } = render(<NoteCard {...defaultProps} note={pinnedNote} />)
    const card = container.firstChild as HTMLElement
    expect(card.className).toContain('border-l-amber-400')
  })
})
