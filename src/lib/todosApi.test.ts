// AI-assisted test generated with ChatGPT.
// Prompt used: "Generate Vitest tests for todoApi."

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { todoApi } from './todoApi'
import { api } from './api'

vi.mock('./api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('todoApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls list endpoint with query params', async () => {
    vi.mocked(api.get).mockResolvedValue({} as never)

    await todoApi.list({ archived: false, page: 0, size: 10 })

    expect(api.get).toHaveBeenCalledWith('/api/todos?archived=false&page=0&size=10')
  })

  it('calls search endpoint with query params', async () => {
    vi.mocked(api.get).mockResolvedValue({} as never)

    await todoApi.search({ q: 'milk', archived: false, page: 0, size: 10 })

    expect(api.get).toHaveBeenCalledWith('/api/todos/search?q=milk&archived=false&page=0&size=10')
  })

  it('calls create endpoint', async () => {
    vi.mocked(api.post).mockResolvedValue({} as never)

    await todoApi.create({ title: 'Buy milk' })

    expect(api.post).toHaveBeenCalledWith('/api/todos', { title: 'Buy milk' })
  })

  it('calls update endpoint', async () => {
    vi.mocked(api.put).mockResolvedValue({} as never)

    await todoApi.update('123', { title: 'Updated todo', completed: true })

    expect(api.put).toHaveBeenCalledWith('/api/todos/123', {
      title: 'Updated todo',
      completed: true,
    })
  })

  it('calls delete endpoint', async () => {
    vi.mocked(api.delete).mockResolvedValue(undefined as never)

    await todoApi.delete('123')

    expect(api.delete).toHaveBeenCalledWith('/api/todos/123')
  })

  it('calls toggleComplete endpoint', async () => {
    vi.mocked(api.patch).mockResolvedValue({} as never)

    await todoApi.toggleComplete('123')

    expect(api.patch).toHaveBeenCalledWith('/api/todos/123/complete')
  })

  it('calls toggleArchive endpoint', async () => {
    vi.mocked(api.patch).mockResolvedValue({} as never)

    await todoApi.toggleArchive('123')

    expect(api.patch).toHaveBeenCalledWith('/api/todos/123/archive')
  })
})