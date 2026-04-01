// AI-assisted code generated with ChatGPT.
// Prompt: Given these repos, help me implement the todos feature.

import { useEffect, useState } from 'react'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { todoApi } from '@/lib/todoApi'
import { ApiError } from '@/lib/api'
import { useToastStore } from '@/store/toastStore'
import type {
  CreateTodoPayload,
  UpdateTodoPayload,
  PaginatedResponse,
  Todo,
} from '@/types'

export const todoKeys = {
  all: ['todos'] as const,
  lists: () => [...todoKeys.all, 'list'] as const,
  list: (params: object) => [...todoKeys.lists(), params] as const,
  details: () => [...todoKeys.all, 'detail'] as const,
  detail: (id: string) => [...todoKeys.details(), id] as const,
}

export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message
  if (error instanceof Error) return error.message
  return 'An unexpected error occurred'
}

function showError(error: unknown) {
  useToastStore.getState().addToast(getErrorMessage(error), 'destructive')
}

interface UseTodosParams {
  search?: string
  archived?: boolean
  size?: number
}

export function useTodosInfinite(params: UseTodosParams) {
  const isSearch = !!params.search

  return useInfiniteQuery({
    queryKey: todoKeys.list(params),
    queryFn: ({ pageParam = 0 }) => {
      if (isSearch) {
        return todoApi.search({
          q: params.search,
          archived: params.archived,
          page: pageParam,
          size: params.size,
        })
      }

      return todoApi.list({
        archived: params.archived,
        page: pageParam,
        size: params.size,
      })
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage: PaginatedResponse<Todo>) =>
      lastPage.page < lastPage.totalPages - 1 ? lastPage.page + 1 : undefined,
  })
}

export function useCreateTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTodoPayload) => todoApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() })
      useToastStore.getState().addToast('Todo created')
    },
    onError: showError,
  })
}

export function useUpdateTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTodoPayload }) =>
      todoApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todoKeys.all })
      useToastStore.getState().addToast('Todo updated')
    },
    onError: showError,
  })
}

export function useDeleteTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => todoApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() })
      useToastStore.getState().addToast('Todo deleted')
    },
    onError: showError,
  })
}

export function useToggleTodoComplete() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => todoApi.toggleComplete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() })
    },
    onError: showError,
  })
}

export function useToggleTodoArchive() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => todoApi.toggleArchive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() })
    },
    onError: showError,
  })
}