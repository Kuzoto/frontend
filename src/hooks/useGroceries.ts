import {
  useInfiniteQuery,
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { groceryListsApi, groceryItemsApi, groceryLabelsApi, groceryItemLabelsApi } from '@/lib/groceryApi'
import { ApiError } from '@/lib/api'
import { useToastStore } from '@/store/toastStore'
import type {
  CreateGroceryListPayload,
  UpdateGroceryListPayload,
  CreateGroceryItemPayload,
  UpdateGroceryItemPayload,
  CreateGroceryLabelPayload,
  UpdateGroceryLabelPayload,
  CreateGroceryItemLabelPayload,
  UpdateGroceryItemLabelPayload,
  PaginatedResponse,
  GroceryListSummary,
} from '@/types'

// Query key factories
export const groceryListKeys = {
  all: ['groceryLists'] as const,
  lists: () => [...groceryListKeys.all, 'list'] as const,
  list: (params: object) => [...groceryListKeys.lists(), params] as const,
  details: () => [...groceryListKeys.all, 'detail'] as const,
  detail: (id: string) => [...groceryListKeys.details(), id] as const,
}

export const groceryLabelKeys = {
  all: ['groceryLabels'] as const,
}

export const groceryItemLabelKeys = {
  all: ['groceryItemLabels'] as const,
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
interface UseGroceryListsParams {
  search?: string
  archived?: boolean
  size?: number
}

export function useGroceryListsInfinite(params: UseGroceryListsParams) {
  const isSearch = !!params.search

  return useInfiniteQuery({
    queryKey: groceryListKeys.list(params),
    queryFn: ({ pageParam = 0 }) => {
      if (isSearch) {
        return groceryListsApi.search({
          q: params.search,
          archived: params.archived,
          page: pageParam,
          size: params.size,
        })
      }
      return groceryListsApi.list({
        archived: params.archived,
        page: pageParam,
        size: params.size,
      })
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage: PaginatedResponse<GroceryListSummary>) =>
      lastPage.page < lastPage.totalPages - 1 ? lastPage.page + 1 : undefined,
  })
}

export function useGroceryList(id: string | null) {
  return useQuery({
    queryKey: groceryListKeys.detail(id ?? ''),
    queryFn: () => groceryListsApi.getById(id!),
    enabled: !!id,
  })
}

export function useGroceryLabels() {
  return useQuery({
    queryKey: groceryLabelKeys.all,
    queryFn: groceryLabelsApi.getAll,
  })
}

// List mutations
export function useCreateGroceryList() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateGroceryListPayload) => groceryListsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groceryListKeys.lists() })
      useToastStore.getState().addToast('Grocery list created')
    },
    onError: showError,
  })
}

export function useUpdateGroceryList() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGroceryListPayload }) =>
      groceryListsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groceryListKeys.all })
      useToastStore.getState().addToast('Grocery list updated')
    },
    onError: showError,
  })
}

export function useDeleteGroceryList() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => groceryListsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groceryListKeys.lists() })
      useToastStore.getState().addToast('Grocery list deleted')
    },
    onError: showError,
  })
}

export function useToggleGroceryArchive() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => groceryListsApi.toggleArchive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groceryListKeys.all })
    },
    onError: showError,
  })
}

// Item mutations
export function useCreateGroceryItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ listId, data }: { listId: string; data: CreateGroceryItemPayload }) =>
      groceryItemsApi.create(listId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groceryListKeys.all })
    },
    onError: showError,
  })
}

export function useUpdateGroceryItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      listId,
      itemId,
      data,
    }: {
      listId: string
      itemId: string
      data: UpdateGroceryItemPayload
    }) => groceryItemsApi.update(listId, itemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groceryListKeys.all })
    },
    onError: showError,
  })
}

export function useDeleteGroceryItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ listId, itemId }: { listId: string; itemId: string }) =>
      groceryItemsApi.delete(listId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groceryListKeys.all })
    },
    onError: showError,
  })
}

export function useToggleGroceryItemCheck() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ listId, itemId }: { listId: string; itemId: string }) =>
      groceryItemsApi.toggleCheck(listId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groceryListKeys.all })
    },
    onError: showError,
  })
}

// Bulk mutations
export function useBulkDeleteGroceryLists() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (ids: string[]) =>
      Promise.all(ids.map((id) => groceryListsApi.delete(id))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groceryListKeys.lists() })
      useToastStore.getState().addToast('Grocery lists deleted')
    },
    onError: showError,
  })
}

export function useBulkArchiveGroceryLists() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (ids: string[]) =>
      Promise.all(ids.map((id) => groceryListsApi.toggleArchive(id))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groceryListKeys.lists() })
      useToastStore.getState().addToast('Grocery lists archived')
    },
    onError: showError,
  })
}

// Label mutations
export function useCreateGroceryLabel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateGroceryLabelPayload) => groceryLabelsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groceryLabelKeys.all })
    },
  })
}

export function useUpdateGroceryLabel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGroceryLabelPayload }) =>
      groceryLabelsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groceryLabelKeys.all })
    },
    onError: showError,
  })
}

export function useDeleteGroceryLabel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => groceryLabelsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groceryLabelKeys.all })
      queryClient.invalidateQueries({ queryKey: groceryListKeys.lists() })
    },
    onError: showError,
  })
}

// Item label query + mutations
export function useGroceryItemLabels() {
  return useQuery({
    queryKey: groceryItemLabelKeys.all,
    queryFn: groceryItemLabelsApi.getAll,
  })
}

export function useCreateGroceryItemLabel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateGroceryItemLabelPayload) => groceryItemLabelsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groceryItemLabelKeys.all })
    },
    onError: showError,
  })
}

export function useUpdateGroceryItemLabel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGroceryItemLabelPayload }) =>
      groceryItemLabelsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groceryItemLabelKeys.all })
    },
    onError: showError,
  })
}

export function useDeleteGroceryItemLabel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => groceryItemLabelsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groceryItemLabelKeys.all })
      queryClient.invalidateQueries({ queryKey: groceryListKeys.all })
    },
    onError: showError,
  })
}
