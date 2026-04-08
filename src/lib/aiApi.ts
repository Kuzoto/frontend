import { api } from '@/lib/api'

export interface AiRecommendPayload {
  type: 'note' | 'todo' | 'grocery'
  context?: string
  currentContent?: string
  title?: string
}

export interface AiRecommendResult {
  suggestion: string
}

export const aiApi = {
  recommend: (data: AiRecommendPayload) =>
    api.post<AiRecommendResult>('/api/ai/recommend', data),
}
