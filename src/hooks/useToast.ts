import { useToastStore } from '@/store/toastStore'

export function useToast() {
  const addToast = useToastStore((s) => s.addToast)

  return {
    toast: (message: string) => addToast(message, 'default'),
    errorToast: (message: string) => addToast(message, 'destructive'),
  }
}
