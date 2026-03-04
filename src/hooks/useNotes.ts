import { useState, useEffect } from 'react'
import {
  useInfiniteQuery,
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { notesApi, labelsApi } from '@/lib/notesApi'
import { ApiError } from '@/lib/api'
import { useToastStore } from '@/store/toastStore'
import type {
  CreateNotePayload,
  UpdateNotePayload,
  CreateLabelPayload,
  UpdateLabelPayload,
  PaginatedResponse,
  Note,
} from '@/types'

// Query key factories
export const noteKeys = {
  all: ['notes'] as const,
  lists: () => [...noteKeys.all, 'list'] as const,
  list: (params: object) => [...noteKeys.lists(), params] as const,
  details: () => [...noteKeys.all, 'detail'] as const,
  detail: (id: string) => [...noteKeys.details(), id] as const,
}

export const labelKeys = {
  all: ['labels'] as const,
}

// Debounce hook
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

// Error helper
function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message
  if (error instanceof Error) return error.message
  return 'An unexpected error occurred'
}

function showError(error: unknown) {
  useToastStore.getState().addToast(getErrorMessage(error), 'destructive')
}

// Queries
interface UseNotesParams {
  search?: string
  archived?: boolean
  size?: number
}

export function useNotesInfinite(params: UseNotesParams) {
  const isSearch = !!params.search

  return useInfiniteQuery({
    queryKey: noteKeys.list(params),
    queryFn: ({ pageParam = 0 }) => {
      if (isSearch) {
        return notesApi.search({
          q: params.search,
          archived: params.archived,
          page: pageParam,
          size: params.size,
        })
      }
      return notesApi.list({
        archived: params.archived,
        page: pageParam,
        size: params.size,
      })
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage: PaginatedResponse<Note>) =>
      lastPage.page < lastPage.totalPages - 1 ? lastPage.page + 1 : undefined,
  })
}

export function useLabels() {
  return useQuery({
    queryKey: labelKeys.all,
    queryFn: labelsApi.getAll,
  })
}

// Note mutations
export function useCreateNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateNotePayload) => notesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() })
      useToastStore.getState().addToast('Note created')
    },
    onError: showError,
  })
}

export function useUpdateNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateNotePayload }) =>
      notesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.all })
      useToastStore.getState().addToast('Note updated')
    },
    onError: showError,
  })
}

export function useDeleteNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => notesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() })
      useToastStore.getState().addToast('Note deleted')
    },
    onError: showError,
  })
}

export function useTogglePin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => notesApi.togglePin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() })
    },
    onError: showError,
  })
}

export function useToggleArchive() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => notesApi.toggleArchive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() })
    },
    onError: showError,
  })
}

// Bulk mutations
export function useBulkDeleteNotes() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (ids: string[]) => Promise.all(ids.map((id) => notesApi.delete(id))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() })
      useToastStore.getState().addToast('Notes deleted')
    },
    onError: showError,
  })
}

export function useBulkArchiveNotes() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (ids: string[]) =>
      Promise.all(ids.map((id) => notesApi.toggleArchive(id))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() })
      useToastStore.getState().addToast('Notes archived')
    },
    onError: showError,
  })
}

// Label mutations
export function useCreateLabel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateLabelPayload) => labelsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: labelKeys.all })
    },
    onError: showError,
  })
}

export function useUpdateLabel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLabelPayload }) =>
      labelsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: labelKeys.all })
    },
    onError: showError,
  })
}

export function useDeleteLabel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => labelsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: labelKeys.all })
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() })
    },
    onError: showError,
  })
}
