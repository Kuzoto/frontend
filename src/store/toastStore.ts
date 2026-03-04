import { create } from 'zustand'

export interface ToastAction {
  label: string
  onClick: () => void
}

export interface Toast {
  id: string
  message: string
  variant: 'default' | 'destructive'
  action?: ToastAction
}

interface ToastState {
  toasts: Toast[]
  addToast: (message: string, variant?: Toast['variant'], action?: ToastAction) => void
  removeToast: (id: string) => void
}

let nextId = 0

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  addToast: (message, variant = 'default', action) => {
    const id = String(++nextId)
    set((state) => ({ toasts: [...state.toasts, { id, message, variant, action }] }))
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
    }, 5000)
  },

  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}))
