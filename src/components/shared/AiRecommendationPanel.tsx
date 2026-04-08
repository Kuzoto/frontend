import { useState } from 'react'
import { Sparkles, Loader2, Check, X, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAiRecommend } from '@/hooks/useAi'

export type AiSuggestionNote = { type: 'note'; html: string }
export type AiSuggestionTodo = { type: 'todo'; items: string[] }
export type AiSuggestionGrocery = {
  type: 'grocery'
  items: { name: string; quantity?: string }[]
}
export type AiSuggestion = AiSuggestionNote | AiSuggestionTodo | AiSuggestionGrocery

interface AiRecommendationPanelProps {
  type: 'note' | 'todo' | 'grocery'
  title?: string
  currentContent?: string
  onApply: (suggestion: AiSuggestion) => void
  onDismiss: () => void
}

export default function AiRecommendationPanel({
  type,
  title,
  currentContent,
  onApply,
  onDismiss,
}: AiRecommendationPanelProps) {
  const [prompt, setPrompt] = useState('')
  const [suggestion, setSuggestion] = useState<AiSuggestion | null>(null)
  const [parseError, setParseError] = useState('')
  const [selectedItems, setSelectedItems] = useState<boolean[]>([])
  const recommend = useAiRecommend()

  function handleGetSuggestion() {
    setParseError('')
    setSuggestion(null)
    recommend.mutate(
      { type, context: prompt || undefined, currentContent, title },
      {
        onSuccess: (result) => {
          const raw = result.suggestion.trim()
          if (type === 'note') {
            setSuggestion({ type: 'note', html: raw })
          } else if (type === 'todo') {
            try {
              const items = JSON.parse(raw) as string[]
              setSuggestion({ type: 'todo', items })
              setSelectedItems(items.map(() => true))
            } catch {
              setParseError('Could not parse suggestion. Please try again.')
            }
          } else {
            try {
              const items = JSON.parse(raw) as { name: string; quantity?: string }[]
              setSuggestion({ type: 'grocery', items })
              setSelectedItems(items.map(() => true))
            } catch {
              setParseError('Could not parse suggestion. Please try again.')
            }
          }
        },
        onError: () => {
          setParseError('Failed to get suggestion. Please try again.')
        },
      }
    )
  }

  function handleApply() {
    if (!suggestion) return
    if (suggestion.type === 'note') {
      onApply(suggestion)
    } else if (suggestion.type === 'todo') {
      onApply({ type: 'todo', items: suggestion.items.filter((_, i) => selectedItems[i]) })
    } else {
      onApply({
        type: 'grocery',
        items: suggestion.items.filter((_, i) => selectedItems[i]),
      })
    }
  }

  function handleRetry() {
    setSuggestion(null)
    setSelectedItems([])
    setParseError('')
  }

  function toggleItem(index: number) {
    setSelectedItems((prev) => prev.map((v, i) => (i === index ? !v : v)))
  }

  const hasSelection =
    suggestion?.type === 'note' || selectedItems.some(Boolean)

  const placeholder =
    type === 'note'
      ? 'Describe what you want (e.g. "expand this", "make it more concise")...'
      : type === 'todo'
        ? 'Describe what you need (e.g. "plan a camping trip")...'
        : 'Describe what you need (e.g. "ingredients for a BBQ")...'

  return (
    <div className="border rounded-lg p-3 bg-accent/30 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm font-medium">
          <Sparkles className="h-3.5 w-3.5 text-purple-500" />
          AI Suggestion
        </div>
        <button
          onClick={onDismiss}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Dismiss</span>
        </button>
      </div>

      {/* Prompt input (shown when no suggestion yet) */}
      {!suggestion && (
        <div className="space-y-2">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={placeholder}
            rows={2}
            className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleGetSuggestion()
              }
            }}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">⌘Enter to submit</span>
            <Button size="sm" onClick={handleGetSuggestion} disabled={recommend.isPending}>
              {recommend.isPending ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                  Thinking...
                </>
              ) : (
                <>
                  <Sparkles className="h-3 w-3 mr-1.5" />
                  Suggest
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {parseError && <p className="text-xs text-destructive">{parseError}</p>}

      {/* Suggestion display */}
      {suggestion && (
        <div className="space-y-3">
          {suggestion.type === 'note' && (
            <div
              className="prose prose-sm max-w-none rounded-md border border-border bg-background px-3 py-2 text-sm max-h-48 overflow-y-auto"
              dangerouslySetInnerHTML={{ __html: suggestion.html }}
            />
          )}

          {(suggestion.type === 'todo' || suggestion.type === 'grocery') && (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {suggestion.items.map((item, i) => (
                <label
                  key={i}
                  className="flex items-center gap-2 text-sm cursor-pointer hover:bg-accent/50 px-1 py-0.5 rounded"
                >
                  <input
                    type="checkbox"
                    checked={selectedItems[i] ?? true}
                    onChange={() => toggleItem(i)}
                    className="h-3.5 w-3.5 shrink-0"
                  />
                  <span
                    className={cn(
                      'flex-1',
                      !selectedItems[i] && 'text-muted-foreground line-through'
                    )}
                  >
                    {typeof item === 'string' ? item : item.name}
                  </span>
                  {typeof item !== 'string' && item.quantity && (
                    <span className="text-xs text-muted-foreground shrink-0">
                      {item.quantity}
                    </span>
                  )}
                </label>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={handleRetry}>
              <RotateCcw className="h-3 w-3 mr-1.5" />
              Retry
            </Button>
            <Button size="sm" onClick={handleApply} disabled={!hasSelection}>
              <Check className="h-3 w-3 mr-1.5" />
              {suggestion.type === 'note' ? 'Apply' : 'Add Selected'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
