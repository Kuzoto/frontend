# Grocery Manual Archive Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace backend auto-archive with frontend-driven archive/unarchive triggered by item check state, and replace the toolbar 3-dot dropdown with a simple Active/Archived pill toggle.

**Architecture:** Three isolated changes — (1) extend the toast store to carry an optional action button (needed for Undo), (2) swap the toolbar dropdown for a pill toggle, (3) add `handleToggleCheck` in the editor that calls `toggleArchive` when the last item is checked or when an archived list gets an item unchecked.

**Tech Stack:** React 19, Zustand v5, TanStack Query v5, Tailwind CSS v4, Vitest + RTL

---

## Task 1: Extend toast store and toaster UI for action buttons

The undo toast needs a clickable button. The current `Toast` type has no `action` field.

**Files:**
- Modify: `src/store/toastStore.ts`
- Modify: `src/components/ui/toaster.tsx`
- Create: `src/store/toastStore.test.ts`

---

**Step 1: Write the failing test**

Create `src/store/toastStore.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useToastStore } from './toastStore'

describe('toastStore', () => {
  beforeEach(() => {
    useToastStore.setState({ toasts: [] })
  })

  it('addToast stores a toast without action', () => {
    useToastStore.getState().addToast('Hello')
    const toasts = useToastStore.getState().toasts
    expect(toasts).toHaveLength(1)
    expect(toasts[0].message).toBe('Hello')
    expect(toasts[0].action).toBeUndefined()
  })

  it('addToast stores a toast with action', () => {
    const onClick = vi.fn()
    useToastStore.getState().addToast('Archived', 'default', { label: 'Undo', onClick })
    const toasts = useToastStore.getState().toasts
    expect(toasts[0].action?.label).toBe('Undo')
    expect(toasts[0].action?.onClick).toBe(onClick)
  })

  it('removeToast removes the toast by id', () => {
    useToastStore.getState().addToast('Msg')
    const id = useToastStore.getState().toasts[0].id
    useToastStore.getState().removeToast(id)
    expect(useToastStore.getState().toasts).toHaveLength(0)
  })
})
```

**Step 2: Run test to verify it fails**

```bash
npm test -- toastStore
```

Expected: FAIL — `addToast` does not accept a third argument yet.

---

**Step 3: Update `src/store/toastStore.ts`**

Replace the entire file contents:

```ts
import { create } from 'zustand'

export interface ToastAction {
  label: string
  onClick: () => void
}

export interface Toast {
  id: string
  message: string
  variant: 'default' | 'destructive'
  action?: ToastAction
}

interface ToastState {
  toasts: Toast[]
  addToast: (message: string, variant?: Toast['variant'], action?: ToastAction) => void
  removeToast: (id: string) => void
}

let nextId = 0

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  addToast: (message, variant = 'default', action) => {
    const id = String(++nextId)
    set((state) => ({ toasts: [...state.toasts, { id, message, variant, action }] }))
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
    }, 5000)
  },

  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}))
```

**Step 4: Update `src/components/ui/toaster.tsx`**

Replace the entire file contents to render the action button:

```tsx
import { X } from 'lucide-react'
import { useToastStore } from '@/store/toastStore'
import { cn } from '@/lib/utils'

export default function Toaster() {
  const toasts = useToastStore((s) => s.toasts)
  const removeToast = useToastStore((s) => s.removeToast)

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'flex items-center gap-2 rounded-lg border px-4 py-3 shadow-lg animate-in slide-in-from-bottom-2 fade-in',
            toast.variant === 'destructive'
              ? 'border-destructive/50 bg-destructive text-destructive-foreground'
              : 'border-border bg-background text-foreground'
          )}
        >
          <p className="text-sm flex-1">{toast.message}</p>
          {toast.action && (
            <button
              onClick={() => {
                toast.action!.onClick()
                removeToast(toast.id)
              }}
              className="shrink-0 text-xs font-medium underline underline-offset-2 hover:no-underline"
            >
              {toast.action.label}
            </button>
          )}
          <button
            onClick={() => removeToast(toast.id)}
            className="shrink-0 rounded-sm opacity-70 hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
```

**Step 5: Run tests to verify they pass**

```bash
npm test -- toastStore
```

Expected: all 3 tests PASS.

**Step 6: Build-check**

```bash
npm run build
```

Expected: no TypeScript errors.

**Step 7: Commit**

```bash
git add src/store/toastStore.ts src/components/ui/toaster.tsx src/store/toastStore.test.ts
git commit -m "feat: extend toast store and UI to support action buttons"
```

---

## Task 2: Replace GroceryToolbar 3-dot dropdown with Active/Archived pill toggle

The 3-dot dropdown in `GroceryToolbar` only has one option (switch view). Replace it with two clearly labelled pill buttons.

**Files:**
- Modify: `src/components/groceries/GroceryToolbar.tsx`
- Create: `src/components/groceries/GroceryToolbar.test.tsx`

---

**Step 1: Write the failing test**

Create `src/components/groceries/GroceryToolbar.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import GroceryToolbar from './GroceryToolbar'

const defaultProps = {
  searchQuery: '',
  onSearchChange: vi.fn(),
  activeTab: 'active' as const,
  onTabChange: vi.fn(),
}

describe('GroceryToolbar', () => {
  it('renders search input', () => {
    render(<GroceryToolbar {...defaultProps} />)
    expect(screen.getByPlaceholderText(/search lists/i)).toBeInTheDocument()
  })

  it('renders Active and Archived toggle buttons', () => {
    render(<GroceryToolbar {...defaultProps} />)
    expect(screen.getByRole('button', { name: /active/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /archived/i })).toBeInTheDocument()
  })

  it('calls onTabChange with "archived" when Archived button is clicked', async () => {
    const onTabChange = vi.fn()
    render(<GroceryToolbar {...defaultProps} onTabChange={onTabChange} />)
    await userEvent.setup().click(screen.getByRole('button', { name: /archived/i }))
    expect(onTabChange).toHaveBeenCalledWith('archived')
  })

  it('calls onTabChange with "active" when Active button is clicked on archived tab', async () => {
    const onTabChange = vi.fn()
    render(<GroceryToolbar {...defaultProps} activeTab="archived" onTabChange={onTabChange} />)
    await userEvent.setup().click(screen.getByRole('button', { name: /active/i }))
    expect(onTabChange).toHaveBeenCalledWith('active')
  })
})
```

**Step 2: Run test to verify it fails**

```bash
npm test -- GroceryToolbar
```

Expected: FAIL — no "Active" or "Archived" buttons found (currently a dropdown).

---

**Step 3: Rewrite `src/components/groceries/GroceryToolbar.tsx`**

```tsx
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface GroceryToolbarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  activeTab: 'active' | 'archived'
  onTabChange: (tab: 'active' | 'archived') => void
}

export default function GroceryToolbar({
  searchQuery,
  onSearchChange,
  activeTab,
  onTabChange,
}: GroceryToolbarProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search lists..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex rounded-md border overflow-hidden shrink-0">
        <Button
          variant={activeTab === 'active' ? 'default' : 'ghost'}
          size="sm"
          className={cn('rounded-none border-0 h-9 px-4', activeTab !== 'active' && 'text-muted-foreground')}
          onClick={() => onTabChange('active')}
        >
          Active
        </Button>
        <Button
          variant={activeTab === 'archived' ? 'default' : 'ghost'}
          size="sm"
          className={cn('rounded-none border-0 border-l h-9 px-4', activeTab !== 'archived' && 'text-muted-foreground')}
          onClick={() => onTabChange('archived')}
        >
          Archived
        </Button>
      </div>
    </div>
  )
}
```

**Step 4: Run tests to verify they pass**

```bash
npm test -- GroceryToolbar
```

Expected: all 4 tests PASS.

**Step 5: Build-check**

```bash
npm run build
```

Expected: no TypeScript errors. The `MoreVertical`, `Archive`, and `DropdownMenu*` imports are no longer used — the build will fail if they're left in. The new file does not import them, so this is clean.

**Step 6: Commit**

```bash
git add src/components/groceries/GroceryToolbar.tsx src/components/groceries/GroceryToolbar.test.tsx
git commit -m "feat: replace grocery toolbar dropdown with Active/Archived pill toggle"
```

---

## Task 3: Auto-archive/unarchive on item check in GroceryListEditor

When the last unchecked item is checked → archive immediately + show undo toast.
When an archived list has any item unchecked → unarchive silently + show plain toast.
Remove the stale `prevArchivedRef` effect and the built-in toast from `useToggleGroceryArchive`.

**Files:**
- Modify: `src/hooks/useGroceries.ts`
- Modify: `src/components/groceries/GroceryListEditor.tsx`

---

**Step 1: Remove the auto-toast from `useToggleGroceryArchive` in `src/hooks/useGroceries.ts`**

Find the `useToggleGroceryArchive` function (lines 131–143). Change `onSuccess` to only invalidate queries — no toast:

Old:
```ts
export function useToggleGroceryArchive() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => groceryListsApi.toggleArchive(id),
    onSuccess: (updatedList) => {
      queryClient.invalidateQueries({ queryKey: groceryListKeys.all })
      if (updatedList.archived) {
        useToastStore.getState().addToast('List archived — all items checked!')
      }
    },
    onError: showError,
  })
}
```

New:
```ts
export function useToggleGroceryArchive() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => groceryListsApi.toggleArchive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groceryListKeys.all })
    },
    onError: showError,
  })
}
```

**Step 2: Update `GroceryListEditor.tsx` — remove stale effect, add `handleToggleCheck`**

**2a.** Remove the `prevArchivedRef` effect. Delete these lines (approximately 72–88):

```ts
// Detect archive state changes after check/uncheck
const prevArchivedRef = useRef<boolean | undefined>(undefined)
useEffect(() => {
  if (!list || !open) {
    prevArchivedRef.current = undefined
    return
  }
  const prev = prevArchivedRef.current
  if (prev !== undefined && prev !== list.archived) {
    if (list.archived) {
      useToastStore.getState().addToast('List archived — all items checked!')
    } else {
      useToastStore.getState().addToast('List unarchived — unchecked items detected')
    }
  }
  prevArchivedRef.current = list.archived
}, [list, open])
```

Also remove `useRef` from the import at the top (line 1) if it's no longer used elsewhere. Check: `useRef` is used for `prevArchivedRef` only in this file — so remove it from the import:

Old import line 1:
```ts
import { useState, useEffect, useRef } from 'react'
```
New:
```ts
import { useState, useEffect } from 'react'
```

**2b.** Add `handleToggleCheck` function after the existing `handleArchive` function (around line 154):

```ts
function handleToggleCheck(item: GroceryItem) {
  if (!list) return

  const isLastUnchecked = !item.checked && uncheckedItems.length === 1 && totalCount > 0
  const shouldUnarchive = list.archived && item.checked

  toggleCheck.mutate(
    { listId: list.id, itemId: item.id },
    {
      onSuccess: () => {
        if (isLastUnchecked) {
          toggleArchive.mutate(list.id, {
            onSuccess: () => {
              useToastStore.getState().addToast(
                'List done! Archived.',
                'default',
                { label: 'Undo', onClick: () => toggleArchive.mutate(list.id) }
              )
            },
          })
        } else if (shouldUnarchive) {
          toggleArchive.mutate(list.id, {
            onSuccess: () => {
              useToastStore.getState().addToast('List unarchived')
            },
          })
        }
      },
    }
  )
}
```

Note: `GroceryItem` is already imported via `import type { GroceryLabel, CreateGroceryItemPayload } from '@/types'` — add `GroceryItem` to that import.

Old:
```ts
import type { GroceryLabel, CreateGroceryItemPayload } from '@/types'
```
New:
```ts
import type { GroceryLabel, GroceryItem, CreateGroceryItemPayload } from '@/types'
```

**2c.** Replace the two inline `toggleCheck.mutate(...)` calls in the JSX with `handleToggleCheck`:

Old (for uncheckedItems):
```tsx
onToggleCheck={() => toggleCheck.mutate({ listId: list!.id, itemId: item.id })}
```
New:
```tsx
onToggleCheck={() => handleToggleCheck(item)}
```

Apply this change to **both** the `uncheckedItems.map(...)` and `checkedItems.map(...)` render blocks — two occurrences total.

**2d.** Update `handleArchive` (the manual archive from the dropdown) to show its own toasts:

Old:
```ts
function handleArchive() {
  if (list) toggleArchive.mutate(list.id)
}
```
New:
```ts
function handleArchive() {
  if (!list) return
  const willArchive = !list.archived
  toggleArchive.mutate(list.id, {
    onSuccess: () => {
      useToastStore.getState().addToast(willArchive ? 'List archived' : 'List unarchived')
    },
  })
}
```

**Step 3: Build-check**

```bash
npm run build
```

Expected: clean build. Check for:
- `useRef` removed from imports (no unused import error)
- `GroceryItem` added to type imports
- `ToastAction` type compatibility with the `action` parameter

**Step 4: Manual smoke test**

1. Open a grocery list with 2+ items
2. Check all items one by one — on the last check the list should auto-archive and a "List done! Archived." toast with "Undo" button should appear
3. Click Undo — list should unarchive and reappear in Active tab
4. Switch to Archived tab — open an archived list — uncheck any item — list should auto-unarchive and move back to Active

**Step 5: Run all tests**

```bash
npm test
```

Expected: all existing tests pass, no regressions.

**Step 6: Commit**

```bash
git add src/hooks/useGroceries.ts src/components/groceries/GroceryListEditor.tsx
git commit -m "feat: auto-archive list on last item checked, auto-unarchive on item uncheck"
```
