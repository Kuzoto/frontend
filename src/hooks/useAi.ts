import { useMutation } from '@tanstack/react-query'
import { aiApi } from '@/lib/aiApi'
import type { AiRecommendPayload } from '@/lib/aiApi'

export function useAiRecommend() {
  return useMutation({
    mutationFn: (payload: AiRecommendPayload) => aiApi.recommend(payload),
  })
}
