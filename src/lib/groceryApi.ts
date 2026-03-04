import { api } from '@/lib/api'
import type {
  GroceryList,
  GroceryListSummary,
  PaginatedResponse,
  GroceryListsParams,
  GroceryListsSearchParams,
  CreateGroceryListPayload,
  UpdateGroceryListPayload,
  CreateGroceryItemPayload,
  UpdateGroceryItemPayload,
  GroceryItem,
  GroceryLabel,
  CreateGroceryLabelPayload,
  UpdateGroceryLabelPayload,
  GroceryItemLabel,
  CreateGroceryItemLabelPayload,
  UpdateGroceryItemLabelPayload,
} from '@/types'

function toQuery(params: object) {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) query.set(key, String(value))
  }
  return query.toString()
}

export const groceryListsApi = {
  list: (params: GroceryListsParams) =>
    api.get<PaginatedResponse<GroceryListSummary>>(`/api/grocery-lists?${toQuery(params)}`),

  search: (params: GroceryListsSearchParams) =>
    api.get<PaginatedResponse<GroceryListSummary>>(`/api/grocery-lists/search?${toQuery(params)}`),

  getById: (id: string) => api.get<GroceryList>(`/api/grocery-lists/${id}`),

  create: (data: CreateGroceryListPayload) => api.post<GroceryList>('/api/grocery-lists', data),

  update: (id: string, data: UpdateGroceryListPayload) =>
    api.put<GroceryList>(`/api/grocery-lists/${id}`, data),

  delete: (id: string) => api.delete<void>(`/api/grocery-lists/${id}`),

  toggleArchive: (id: string) => api.patch<GroceryList>(`/api/grocery-lists/${id}/archive`),
}

export const groceryItemsApi = {
  create: (listId: string, data: CreateGroceryItemPayload) =>
    api.post<GroceryItem>(`/api/grocery-lists/${listId}/items`, data),

  update: (listId: string, itemId: string, data: UpdateGroceryItemPayload) =>
    api.put<GroceryItem>(`/api/grocery-lists/${listId}/items/${itemId}`, data),

  delete: (listId: string, itemId: string) =>
    api.delete<void>(`/api/grocery-lists/${listId}/items/${itemId}`),

  toggleCheck: (listId: string, itemId: string) =>
    api.patch<GroceryItem>(`/api/grocery-lists/${listId}/items/${itemId}/check`),
}

export const groceryLabelsApi = {
  getAll: () => api.get<GroceryLabel[]>('/api/grocery-lists/labels'),

  create: (data: CreateGroceryLabelPayload) =>
    api.post<GroceryLabel>('/api/grocery-lists/labels', data),

  update: (id: string, data: UpdateGroceryLabelPayload) =>
    api.put<GroceryLabel>(`/api/grocery-lists/labels/${id}`, data),

  delete: (id: string) => api.delete<void>(`/api/grocery-lists/labels/${id}`),
}

export const groceryItemLabelsApi = {
  getAll: () => api.get<GroceryItemLabel[]>('/api/grocery-lists/items/labels'),

  create: (data: CreateGroceryItemLabelPayload) =>
    api.post<GroceryItemLabel>('/api/grocery-lists/items/labels', data),

  update: (id: string, data: UpdateGroceryItemLabelPayload) =>
    api.put<GroceryItemLabel>(`/api/grocery-lists/items/labels/${id}`, data),

  delete: (id: string) => api.delete<void>(`/api/grocery-lists/items/labels/${id}`),
}
