import { api } from '@/lib/api'
import type {
  Todo,
  PaginatedResponse,
  TodosListParams,
  TodosSearchParams,
  CreateTodoPayload,
  UpdateTodoPayload,
} from '@/types'

function toQuery(params: { [key: string]: string | number | boolean | undefined }) {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) query.set(key, String(value))
  }
  return query.toString()
}

export const todoApi = {
  list: (params: TodosListParams) =>
    api.get<PaginatedResponse<Todo>>(`/api/todos?${toQuery({...params})}`),

  search: (params: TodosSearchParams) =>
    api.get<PaginatedResponse<Todo>>(`/api/todos/search?${toQuery({...params})}`),

  getById: (id: string) =>
    api.get<Todo>(`/api/todos/${id}`),

  create: (data: CreateTodoPayload) =>
    api.post<Todo>('/api/todos', data),

  update: (id: string, data: UpdateTodoPayload) =>
    api.put<Todo>(`/api/todos/${id}`, data),

  delete: (id: string) =>
    api.delete<void>(`/api/todos/${id}`),

  toggleComplete: (id: string) =>
    api.patch<Todo>(`/api/todos/${id}/complete`),

  toggleArchive: (id: string) =>
    api.patch<Todo>(`/api/todos/${id}/archive`),
}