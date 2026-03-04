# Grocery Manual Archive — Design

**Date:** 2026-03-04
**Status:** Approved

## Background

The backend removed auto-archive support. Archiving is now purely manual via `PATCH /api/grocery-lists/{id}/archive` (toggle). The frontend must replicate the "finished list → archive" UX without relying on the backend to trigger it automatically.

## Goals

1. Replace the clunky 3-dot dropdown in the toolbar with a clear Active/Archived pill toggle.
2. Auto-archive a list when the user checks the last item, with an Undo escape hatch.
3. Auto-unarchive a list when the user unchecks any item while viewing an archived list.

## Non-Goals

- No changes to the floating action bar (bulk archive still uses the existing `toggleArchive` endpoint).
- No changes to the list editor's Delete action.

## Design

### 1. Toast Store — add action support

`src/store/toastStore.ts`: Extend the `Toast` interface with an optional `action`:

```ts
action?: { label: string; onClick: () => void }
```

`addToast` signature gains a third optional parameter. The toast auto-dismiss timer stays at 5 s. The toast UI component renders a small button next to the message when `action` is present.

### 2. GroceryToolbar — pill toggle

Replace the `MoreVertical` dropdown with two adjacent buttons styled as a segmented pill:

```
[ Active ]  [ Archived ]
```

The active tab button uses a filled/primary style; the inactive one uses ghost/outline. No dropdown, no icon — just a clean toggle directly visible behind the search bar.

### 3. GroceryListEditor — handleToggleCheck

Replace inline `toggleCheck.mutate(...)` calls with a `handleToggleCheck(item)` wrapper:

**Auto-archive path** (active list, last unchecked item):
- Condition: `!list.archived && !item.checked && uncheckedItems.length === 1 && totalCount > 0`
- After `toggleCheck` succeeds → call `toggleArchive.mutate(list.id)`
- After archive succeeds → show toast: *"List done! Archived."* with `action: { label: 'Undo', onClick: () => toggleArchive.mutate(list.id) }`

**Auto-unarchive path** (archived list, user unchecks an item):
- Condition: `list.archived && item.checked`
- After `toggleCheck` succeeds → call `toggleArchive.mutate(list.id)`
- After unarchive succeeds → show plain toast: *"List unarchived"*

### 4. Cleanup

- Remove `prevArchivedRef` effect in `GroceryListEditor` (stale — was used to detect auto-archive from backend).
- Remove the built-in toast from `useToggleGroceryArchive` `onSuccess` — the editor now owns all archive-related toast messaging.

## Files

| File | Change |
|---|---|
| `src/store/toastStore.ts` | Add `action` field to `Toast`; extend `addToast` signature |
| Toast UI component (locate via grep) | Render action button when present |
| `src/components/groceries/GroceryToolbar.tsx` | Replace dropdown with pill toggle |
| `src/components/groceries/GroceryListEditor.tsx` | Add `handleToggleCheck`; remove `prevArchivedRef` effect |
| `src/hooks/useGroceries.ts` | Remove toast from `useToggleGroceryArchive` |
