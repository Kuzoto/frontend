import { api } from '@/lib/api'
import type {
  Note,
  NoteLabel,
  PaginatedResponse,
  NotesListParams,
  NotesSearchParams,
  CreateNotePayload,
  UpdateNotePayload,
  CreateLabelPayload,
  UpdateLabelPayload,
} from '@/types'

function toQuery(params: object) {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) query.set(key, String(value))
  }
  return query.toString()
}

export const notesApi = {
  list: (params: NotesListParams) =>
    api.get<PaginatedResponse<Note>>(`/api/notes?${toQuery(params)}`),

  search: (params: NotesSearchParams) =>
    api.get<PaginatedResponse<Note>>(`/api/notes/search?${toQuery(params)}`),

  getById: (id: string) => api.get<Note>(`/api/notes/${id}`),

  create: (data: CreateNotePayload) => api.post<Note>('/api/notes', data),

  update: (id: string, data: UpdateNotePayload) => api.put<Note>(`/api/notes/${id}`, data),

  delete: (id: string) => api.delete<void>(`/api/notes/${id}`),

  togglePin: (id: string) => api.patch<Note>(`/api/notes/${id}/pin`),

  toggleArchive: (id: string) => api.patch<Note>(`/api/notes/${id}/archive`),
}

export const labelsApi = {
  getAll: () => api.get<NoteLabel[]>('/api/notes/labels'),

  create: (data: CreateLabelPayload) => api.post<NoteLabel>('/api/notes/labels', data),

  update: (id: string, data: UpdateLabelPayload) =>
    api.put<NoteLabel>(`/api/notes/labels/${id}`, data),

  delete: (id: string) => api.delete<void>(`/api/notes/labels/${id}`),
}
