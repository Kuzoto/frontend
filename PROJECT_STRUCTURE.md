# Project Structure

## Top-Level Layout

```
frontend/
  src/                  Application source code
  e2e/                  Playwright end-to-end tests
  public/               Static assets served as-is
  dist/                 Production build output (git-ignored)
  index.html            Vite entry HTML
  vite.config.ts        Vite + PWA plugin config
  tailwind.config.ts    Tailwind v4 config (minimal — colors defined in CSS)
  tsconfig.app.json     Strict TypeScript config (erasableSyntaxOnly, verbatimModuleSyntax)
  tsconfig.node.json    TypeScript config for Vite config file
  CLAUDE.md             AI assistant project instructions
```

## Source Tree

```
src/
  main.tsx              App entry — mounts React, wraps with QueryClientProvider + RouterProvider
  index.css             Global styles, Tailwind import, CSS variables (shadcn/ui theme tokens)
  types/
    index.ts            Shared TypeScript types (User, AuthState, Note, NoteLabel, etc.)
    grocery.ts          Grocery-specific types (GroceryList, GroceryItem, GroceryLabel, etc.)
  router/
    index.tsx           Route config — public (AuthLayout) and protected (AppLayout) groups
  store/
    authStore.ts        Zustand auth store — user, isAuthenticated, tokens, expiresAt (persisted)
    themeStore.ts       Zustand theme store — light/dark/system preference (persisted)
    toastStore.ts       Zustand toast notification queue
  hooks/
    useAuth.ts          Thin wrapper over authStore + logout action
    useTheme.ts         Thin wrapper over themeStore + DOM class toggle
    useNotes.ts         TanStack Query hooks for notes and labels (infinite queries, mutations)
    useGroceries.ts     TanStack Query hooks for grocery lists and labels
    useToast.ts         Hook to enqueue toast notifications
  lib/
    api.ts              Fetch wrapper with JWT injection, automatic token refresh, ApiError class
    notesApi.ts         Notes + labels REST API calls (used by useNotes hooks)
    groceryApi.ts       Grocery lists + labels REST API calls (used by useGroceries hooks)
    queryClient.ts      TanStack Query client configuration
    utils.ts            Utility helpers (cn — clsx + tailwind-merge)
  components/
    ui/                 Base UI primitives (shadcn/ui pattern, Radix UI under the hood)
    layout/             Page shells and navigation
    shared/             Cross-cutting components used across features
    notes/              Notes feature components
    groceries/          Groceries feature components
  pages/
    auth/               Public authentication pages
    dashboard/          Dashboard (home after login)
    notes/              Notes page
    groceries/          Groceries page
    profile/            User profile page
    settings/           App settings page
    NotFoundPage.tsx    404 catch-all page
e2e/
  auth.spec.ts          Playwright tests for signup/login/logout flows
  dashboard.spec.ts     Playwright tests for dashboard
  notes.spec.ts         Playwright tests for notes CRUD and interactions
```

---

## Routes

| Path | Page | Access |
|---|---|---|
| `/` | SignupPage | Public |
| `/login` | LoginPage | Public |
| `/dashboard` | DashboardPage | Protected |
| `/notes` | NotesPage | Protected |
| `/groceries` | GroceriesPage | Protected |
| `/profile` | ProfilePage | Protected |
| `/settings` | SettingsPage | Protected |
| `/*` | NotFoundPage | Any |

Protected routes are wrapped in `ProtectedRoute`, which redirects unauthenticated users to `/`.

---

## Pages

### SignupPage (`/`)
Landing and registration page shown to unauthenticated users. Contains a signup form (name, email, password) that calls `authApi.signup`. On success, stores tokens and user in `authStore` and redirects to `/dashboard`. Includes a link to the login page.

### LoginPage (`/login`)
Email + password login form. Calls `authApi.login`, updates `authStore`, and redirects to `/dashboard`. Includes a link to the signup page.

### DashboardPage (`/dashboard`)
Home screen after login. Displays a personalised welcome and a grid of feature cards linking to each section. Features marked `comingSoon` are rendered as disabled cards.

Current feature cards:
- Notes → `/notes`
- Groceries → `/groceries`
- Todos → coming soon
- Movies → coming soon
- Travel Ideas → coming soon

### NotesPage (`/notes`)
Full notes management interface.

- **Toolbar** — search bar (debounced, 300 ms) and Active / Archived tab switcher
- **Label filter** — filter notes by a single label; label manager to create/rename/delete labels
- **Note grid** — masonry columns (1 → 2 → 3 → 4 depending on viewport); pinned notes appear in a separate "Pinned" section above "Others"
- **Infinite scroll** — loads 20 notes per page via IntersectionObserver sentinel
- **Note editor dialog** — TipTap rich text editor, title field, pin toggle, label assignment; used for both create and edit
- **Bulk selection** — click a note in selection mode (triggered when any note is selected) to add it to the selection; floating action bar appears with Archive and Delete bulk actions
- **Floating add button** — fixed bottom-right FAB opens the note editor for a new note

### GroceriesPage (`/groceries`)
Grocery list management, structurally parallel to NotesPage.

- **Toolbar** — search (debounced) and Active / Archived tab switcher
- **Label filter** — filter lists by label; label manager for CRUD on grocery labels
- **List grid** — masonry columns; each card shows list title, item count, and labels
- **Infinite scroll** — 20 lists per page
- **List editor dialog** — create a new list with title, labels, and an initial set of items inline; edit an existing list's items (check off, add, remove)
- **Bulk selection** — floating action bar for bulk archive and delete

### ProfilePage (`/profile`)
Displays the authenticated user's name and email. Includes an inline edit form to update the display name (API call stubbed, pending backend).

### SettingsPage (`/settings`)
- **Appearance** — theme toggle (light / dark / system)
- **Account** — shows current email; email/password change noted as coming soon
- **Notifications** — placeholder, coming soon

### NotFoundPage (`*`)
Generic 404 page with a link back to the dashboard.

---

## Components

### `components/ui/` — Base Primitives

| File | Description |
|---|---|
| `button.tsx` | Button with variants (default, outline, ghost, destructive) and sizes |
| `card.tsx` | Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter |
| `input.tsx` | Styled `<input>` |
| `label.tsx` | Styled `<label>` |
| `badge.tsx` | Small pill for labels/tags |
| `checkbox.tsx` | Radix UI checkbox |
| `dialog.tsx` | Radix UI modal dialog (Dialog, DialogContent, DialogHeader, etc.) |
| `popover.tsx` | Radix UI popover |
| `separator.tsx` | Horizontal rule |
| `toggle.tsx` | Toggle button (active/inactive state) |
| `dropdown-menu.tsx` | Radix UI dropdown menu |
| `progress.tsx` | Progress bar |
| `toaster.tsx` | Toast notification renderer (reads from toastStore) |

### `components/layout/`

| File | Description |
|---|---|
| `AuthLayout.tsx` | Centred single-column shell for public pages (signup, login) |
| `AppLayout.tsx` | Full app shell — top nav + collapsible sidebar + main content area |
| `TopNav.tsx` | Top navigation bar with app name, user menu (profile, settings, logout), theme toggle |
| `Sidebar.tsx` | Left sidebar with navigation links (Dashboard, Notes, Groceries) |

### `components/shared/`

| File | Description |
|---|---|
| `ProtectedRoute.tsx` | Redirects to `/` if `isAuthenticated` is false |
| `ThemeToggle.tsx` | Three-way toggle button (light / dark / system) |
| `FeatureCard.tsx` | Dashboard feature card with icon, title, description, and optional "coming soon" badge |
| `ErrorBoundary.tsx` | React error boundary + `RouteErrorBoundary` for router `errorElement` |

### `components/notes/`

| File | Description |
|---|---|
| `NoteCard.tsx` | Masonry card displaying a note's title, content preview, labels, and pin state; supports selection mode |
| `NoteEditor.tsx` | Dialog with TipTap editor, title input, pin toggle, and label multi-select |
| `NotesToolbar.tsx` | Search input + Active/Archived tabs |
| `LabelFilter.tsx` | Horizontal pill row to filter notes by label |
| `LabelManager.tsx` | Popover UI to create, rename, and delete note labels |
| `FloatingActionBar.tsx` | Bottom-anchored bar shown during bulk selection (archive, delete, cancel) |
| `EmptyState.tsx` | Illustrated empty state with a CTA to create the first note |

### `components/groceries/`

| File | Description |
|---|---|
| `GroceryListCard.tsx` | Card showing list title, item count, completion progress, and labels |
| `GroceryListEditor.tsx` | Dialog to create or edit a grocery list and its items |
| `GroceryItemRow.tsx` | Single item row inside the editor (name, quantity, unit, check-off) |
| `GroceryItemInput.tsx` | Inline input for adding a new item to the list |
| `GroceryItemLabelManager.tsx` | Label assignment for individual grocery items |
| `GroceryToolbar.tsx` | Search input + Active/Archived tabs |
| `GroceryLabelFilter.tsx` | Pill filter row for grocery labels |
| `GroceryLabelManager.tsx` | Popover to create, rename, and delete grocery labels |
| `GroceryFloatingActionBar.tsx` | Bulk action bar for grocery list selection |
| `GroceryEmptyState.tsx` | Empty state with CTA to create the first grocery list |

---

## State Management

### authStore (`src/store/authStore.ts`)
Persisted to `localStorage` under the key `auth-storage`.

| Field | Type | Description |
|---|---|---|
| `user` | `User \| null` | Authenticated user object (id, name, email) |
| `isAuthenticated` | `boolean` | Whether the user is logged in |
| `accessToken` | `string \| null` | JWT access token |
| `refreshToken` | `string \| null` | JWT refresh token |
| `expiresAt` | `number \| null` | Access token expiry timestamp (ms) |

Actions: `login`, `logout`, `setTokens`.

### themeStore (`src/store/themeStore.ts`)
Persisted to `localStorage`. Holds `theme: 'light' | 'dark' | 'system'`. The `useTheme` hook applies the `.dark` class to `<html>` reactively.

### toastStore (`src/store/toastStore.ts`)
In-memory queue of toast notifications. `useToast` enqueues messages; `Toaster` renders them.

---

## API Layer

### `src/lib/api.ts`
Central fetch wrapper. All requests go through `request()` which:
1. Attaches `Authorization: Bearer <token>` from `authStore`
2. On 401/403, automatically attempts a token refresh (deduplicating concurrent refresh calls)
3. Retries the original request with the new token
4. Calls `onUnauthorized()` (triggers logout) if refresh fails
5. Throws `ApiError` (with `status` and optional field `errors`) on non-2xx responses

A proactive refresh timer (`startRefreshTimer`) fires 1 minute before the access token expires to avoid mid-request failures.

### `src/lib/notesApi.ts`
Functions wrapping `api.get/post/patch/delete` for:
- Notes: paginated list (infinite), create, update, delete, bulk delete, bulk archive, toggle pin
- Labels: list, create, update, delete

### `src/lib/groceryApi.ts`
Same pattern as `notesApi.ts` for grocery lists and grocery labels.

---

## Data Fetching Patterns

TanStack Query v5 is used for all server state.

- **Infinite queries** — `useNotesInfinite`, `useGroceryListsInfinite`: paginated data with `fetchNextPage` triggered by an IntersectionObserver sentinel at the bottom of the list.
- **Standard queries** — `useLabels`, `useGroceryLabels`: simple label lists.
- **Mutations** — `useCreateNote`, `useUpdateNote`, `useTogglePin`, `useBulkDeleteNotes`, `useBulkArchiveNotes` (and grocery equivalents): invalidate relevant queries on success.
- **Debounced search** — `useDebouncedValue` (300 ms) prevents a query per keystroke.

---

## Testing

### Unit Tests (Vitest + React Testing Library)
Located alongside source files as `*.test.ts` / `*.test.tsx`. Run with `npm test`.

Key test files:
- `src/store/authStore.test.ts` — auth state transitions
- `src/store/toastStore.test.ts` — toast queue behaviour
- `src/lib/api.test.ts` — fetch wrapper and token refresh logic
- `src/hooks/useNotes.test.ts` — notes query/mutation hooks
- `src/pages/auth/LoginPage.test.tsx` — login form interactions
- `src/pages/auth/SignupPage.test.tsx` — signup form interactions
- `src/pages/notes/NotesPage.test.tsx` — notes page rendering
- `src/components/notes/NoteCard.test.tsx` — card component
- `src/components/notes/NotesToolbar.test.tsx` — toolbar
- `src/components/notes/EmptyState.test.tsx` — empty state
- `src/components/groceries/GroceryToolbar.test.tsx` — grocery toolbar
- `src/components/layout/TopNav.test.tsx` — top navigation
- `src/components/shared/ThemeToggle.test.tsx` — theme toggle
- `src/pages/NotFoundPage.test.tsx` — 404 page

### E2E Tests (Playwright)
Located in `e2e/`. Require the dev server to be running (`npm run dev`) before executing `npm run test:e2e`.

- `auth.spec.ts` — full signup, login, and logout flows
- `dashboard.spec.ts` — dashboard rendering and navigation
- `notes.spec.ts` — note creation, editing, pinning, archiving, label filtering

---

## TypeScript Notes

The project uses a strict TypeScript configuration with two non-standard rules:

- **`verbatimModuleSyntax`** — type-only imports must use `import type`. Example: `import type { LucideIcon } from 'lucide-react'`
- **`erasableSyntaxOnly`** — constructor parameter property shorthand (`public x: T`) is forbidden. Declare fields explicitly.

Path alias `@/` maps to `src/`. Always use it instead of relative `../../` imports.
