import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useToastStore } from './toastStore'

describe('toastStore', () => {
  beforeEach(() => {
    useToastStore.setState({ toasts: [] })
  })

  it('addToast stores a toast without action', () => {
    useToastStore.getState().addToast('Hello')
    const toasts = useToastStore.getState().toasts
    expect(toasts).toHaveLength(1)
    expect(toasts[0].message).toBe('Hello')
    expect(toasts[0].action).toBeUndefined()
  })

  it('addToast stores a toast with action', () => {
    const onClick = vi.fn()
    useToastStore.getState().addToast('Archived', 'default', { label: 'Undo', onClick })
    const toasts = useToastStore.getState().toasts
    expect(toasts[0].action?.label).toBe('Undo')
    expect(toasts[0].action?.onClick).toBe(onClick)
  })

  it('removeToast removes the toast by id', () => {
    useToastStore.getState().addToast('Msg')
    const id = useToastStore.getState().toasts[0].id
    useToastStore.getState().removeToast(id)
    expect(useToastStore.getState().toasts).toHaveLength(0)
  })
})
