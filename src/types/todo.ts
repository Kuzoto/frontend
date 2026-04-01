export interface Todo {
    id: string
    title: string
    completed: boolean
    archived: boolean
    createdAt: string
    updatedAt: string
  }
  
  export interface TodosListParams {
    archived?: boolean
    page?: number
    size?: number
  }
  
  export interface TodosSearchParams {
    q?: string
    archived?: boolean
    page?: number
    size?: number
  }
  
  export interface CreateTodoPayload {
    title: string
  }
  
  export interface UpdateTodoPayload {
    title?: string
    completed?: boolean
    archived?: boolean
  }