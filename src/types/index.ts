export interface User {
  id: string
  name: string
  email: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  expiresAt: number
  name: string
  email: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  accessToken: string | null
  refreshToken: string | null
  expiresAt: number | null
  login: (user: User, tokens: { accessToken: string; refreshToken: string; expiresAt: number }) => void
  logout: () => Promise<void>
  forceLogout: () => void
  setTokens: (tokens: { accessToken: string; refreshToken: string; expiresAt: number }) => void
}

export type Theme = 'light' | 'dark' | 'system' | 'warm' | 'warm-dark'

export interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
}

export interface Feature {
  id: string
  title: string
  description: string
  icon: string
  href: string
}

// Notes
export interface NoteLabel {
  id: string
  name: string
  createdAt: string
}

export interface Note {
  id: string
  title: string
  content: string
  pinned: boolean
  archived: boolean
  labels: NoteLabel[]
  createdAt: string
  updatedAt: string
}

export interface PaginatedResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface NotesListParams {
  archived?: boolean
  page?: number
  size?: number
}

export interface NotesSearchParams {
  q?: string
  archived?: boolean
  page?: number
  size?: number
}

export interface CreateNotePayload {
  title?: string
  content?: string
  pinned?: boolean
  labelIds?: string[]
}

export interface UpdateNotePayload {
  title?: string
  content?: string
  pinned?: boolean
  archived?: boolean
  labelIds?: string[]
}

export interface CreateLabelPayload {
  name: string
}

export interface UpdateLabelPayload {
  name: string
}

export interface ApiErrorResponse {
  status: number
  message: string
  errors?: Record<string, string>
  timestamp: string
}

// Groceries
export type {
  GroceryLabel,
  GroceryItemLabel,
  GroceryItem,
  GroceryList,
  GroceryListSummary,
  GroceryListsParams,
  GroceryListsSearchParams,
  CreateGroceryListPayload,
  UpdateGroceryListPayload,
  CreateGroceryItemPayload,
  UpdateGroceryItemPayload,
  CreateGroceryLabelPayload,
  UpdateGroceryLabelPayload,
  CreateGroceryItemLabelPayload,
  UpdateGroceryItemLabelPayload,
} from './grocery'

export type {
  Todo,
  TodosListParams,
  TodosSearchParams,
  CreateTodoPayload,
  UpdateTodoPayload,
} from './todo'