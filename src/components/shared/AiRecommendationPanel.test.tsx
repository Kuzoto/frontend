// Tests that AI-suggested objects are created when the user accepts suggestions,
// and that partial selection only sends the items the user checked.

import { render, screen, fireEvent, act } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import AiRecommendationPanel from './AiRecommendationPanel'
import type { AiSuggestion } from './AiRecommendationPanel'
import { useAiRecommend } from '@/hooks/useAi'

vi.mock('@/hooks/useAi', () => ({
  useAiRecommend: vi.fn(),
}))

// Helper: render the panel and simulate receiving a suggestion from the AI
function setupWithSuggestionResponse(
  type: 'note' | 'todo' | 'grocery',
  suggestionJson: string,
  onApply = vi.fn(),
  onDismiss = vi.fn(),
) {
  const mutateMock = vi.fn()
  vi.mocked(useAiRecommend).mockReturnValue({
    mutate: mutateMock,
    isPending: false,
  } as never)

  render(
    <AiRecommendationPanel
      type={type}
      onApply={onApply}
      onDismiss={onDismiss}
    />,
  )

  // Click "Suggest" to trigger the mutation
  fireEvent.click(screen.getByRole('button', { name: /suggest/i }))
  expect(mutateMock).toHaveBeenCalledOnce()

  // Simulate the AI returning a suggestion
  const [, { onSuccess }] = mutateMock.mock.calls[0] as [unknown, { onSuccess: (r: { suggestion: string }) => void }]
  act(() => onSuccess({ suggestion: suggestionJson }))

  return { onApply, onDismiss }
}

describe('AiRecommendationPanel — todo suggestions', () => {
  beforeEach(() => vi.clearAllMocks())

  it('calls onApply with all suggested todo items when all are checked', () => {
    const { onApply } = setupWithSuggestionResponse(
      'todo',
      '["Buy milk", "Call dentist", "Finish report"]',
    )

    fireEvent.click(screen.getByRole('button', { name: /add selected/i }))

    expect(onApply).toHaveBeenCalledOnce()
    expect(onApply).toHaveBeenCalledWith<[AiSuggestion]>({
      type: 'todo',
      items: ['Buy milk', 'Call dentist', 'Finish report'],
    })
  })

  it('only includes checked items when some are deselected before accepting', () => {
    const { onApply } = setupWithSuggestionResponse(
      'todo',
      '["Buy milk", "Call dentist", "Finish report"]',
    )

    // Uncheck the second item ("Call dentist")
    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[1])

    fireEvent.click(screen.getByRole('button', { name: /add selected/i }))

    expect(onApply).toHaveBeenCalledWith<[AiSuggestion]>({
      type: 'todo',
      items: ['Buy milk', 'Finish report'],
    })
  })

  it('disables Add Selected when all items are unchecked', () => {
    setupWithSuggestionResponse('todo', '["Buy milk"]')

    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[0]) // uncheck the only item

    expect(screen.getByRole('button', { name: /add selected/i })).toBeDisabled()
  })
})

describe('AiRecommendationPanel — grocery suggestions', () => {
  beforeEach(() => vi.clearAllMocks())

  it('calls onApply with all suggested grocery items', () => {
    const { onApply } = setupWithSuggestionResponse(
      'grocery',
      '[{"name":"Milk","quantity":"1 gallon"},{"name":"Eggs","quantity":"12"}]',
    )

    fireEvent.click(screen.getByRole('button', { name: /add selected/i }))

    expect(onApply).toHaveBeenCalledWith<[AiSuggestion]>({
      type: 'grocery',
      items: [
        { name: 'Milk', quantity: '1 gallon' },
        { name: 'Eggs', quantity: '12' },
      ],
    })
  })

  it('only includes checked grocery items when some are deselected', () => {
    const { onApply } = setupWithSuggestionResponse(
      'grocery',
      '[{"name":"Milk","quantity":"1 gallon"},{"name":"Eggs","quantity":"12"}]',
    )

    // Uncheck Eggs
    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[1])

    fireEvent.click(screen.getByRole('button', { name: /add selected/i }))

    expect(onApply).toHaveBeenCalledWith<[AiSuggestion]>({
      type: 'grocery',
      items: [{ name: 'Milk', quantity: '1 gallon' }],
    })
  })
})

describe('AiRecommendationPanel — note suggestions', () => {
  beforeEach(() => vi.clearAllMocks())

  it('calls onApply with HTML content when Apply is clicked', () => {
    const { onApply } = setupWithSuggestionResponse(
      'note',
      '<p>Improved content</p>',
    )

    fireEvent.click(screen.getByRole('button', { name: /apply/i }))

    expect(onApply).toHaveBeenCalledWith<[AiSuggestion]>({
      type: 'note',
      html: '<p>Improved content</p>',
    })
  })
})

describe('AiRecommendationPanel — dismiss and retry', () => {
  beforeEach(() => vi.clearAllMocks())

  it('calls onDismiss when the X button is clicked', () => {
    const onDismiss = vi.fn()
    vi.mocked(useAiRecommend).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as never)

    render(
      <AiRecommendationPanel type="todo" onApply={vi.fn()} onDismiss={onDismiss} />,
    )

    fireEvent.click(screen.getByRole('button', { name: /dismiss/i }))
    expect(onDismiss).toHaveBeenCalledOnce()
  })

  it('shows error message when AI returns invalid JSON for todo type', () => {
    const mutateMock = vi.fn()
    vi.mocked(useAiRecommend).mockReturnValue({
      mutate: mutateMock,
      isPending: false,
    } as never)

    render(<AiRecommendationPanel type="todo" onApply={vi.fn()} onDismiss={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: /suggest/i }))

    const [, { onSuccess }] = mutateMock.mock.calls[0] as [unknown, { onSuccess: (r: { suggestion: string }) => void }]
    act(() => onSuccess({ suggestion: 'not valid json' }))

    expect(screen.getByText(/could not parse suggestion/i)).toBeInTheDocument()
  })
})
