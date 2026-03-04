export interface GroceryLabel {
  id: string
  name: string
  createdAt: string
}

export interface GroceryItemLabel {
  id: string
  name: string
  createdAt: string
}

export interface CreateGroceryItemLabelPayload {
  name: string
}

export interface UpdateGroceryItemLabelPayload {
  name: string
}

export interface GroceryItem {
  id: string
  name: string
  quantity: string
  checked: boolean
  labels: GroceryItemLabel[]
  createdAt: string
  updatedAt: string
}

export interface GroceryList {
  id: string
  title: string
  archived: boolean
  items: GroceryItem[]
  labels: GroceryLabel[]
  createdAt: string
  updatedAt: string
}

export interface GroceryListSummary {
  id: string
  title: string
  archived: boolean
  labels: GroceryLabel[]
  itemCount: number
  checkedCount: number
  previewItems: GroceryItem[]
  createdAt: string
  updatedAt: string
}

export interface GroceryListsParams {
  archived?: boolean
  page?: number
  size?: number
}

export interface GroceryListsSearchParams {
  q?: string
  archived?: boolean
  page?: number
  size?: number
}

export interface CreateGroceryListPayload {
  title: string
  labelIds?: string[]
  items?: CreateGroceryItemPayload[]
}

export interface UpdateGroceryListPayload {
  title?: string
  labelIds?: string[]
}

export interface CreateGroceryItemPayload {
  name: string
  quantity?: string
  labelIds?: string[]
}

export interface UpdateGroceryItemPayload {
  name?: string
  quantity?: string
  labelIds?: string[]
}

export interface CreateGroceryLabelPayload {
  name: string
}

export interface UpdateGroceryLabelPayload {
  name: string
}
