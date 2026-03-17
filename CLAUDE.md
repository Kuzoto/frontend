# Personal Space — Frontend

Personal productivity web app with notes, groceries, todos, movies, and travel ideas. React SPA with JWT-based auth (access + refresh tokens) and PWA support.

## Tech Stack

| Layer | Technology |
|---|---|
| Build | Vite 7, TypeScript 5.9 |
| UI | React 19, Tailwind CSS v4, Radix UI primitives (shadcn/ui pattern) |
| Routing | React Router v7 |
| State | Zustand v5 (with localStorage persistence) |
| Rich text | TipTap (StarterKit + TaskList/TaskItem) |
| Data fetching | TanStack Query v5 (infinite queries for notes/groceries, standard for labels) |
| Icons | Lucide React |
| PWA | vite-plugin-pwa + Workbox |
| Unit tests | Vitest + React Testing Library |
| E2E tests | Playwright |

## Key Directories

```
src/
  components/ui/        Radix UI primitives styled with Tailwind (button, card, input, dialog, popover, badge, checkbox, etc.)
  components/layout/    Page shells: AuthLayout, AppLayout, TopNav, Sidebar
  components/shared/    Cross-cutting components: ProtectedRoute, ThemeToggle, FeatureCard, ErrorBoundary
  components/notes/     Notes feature: NoteCard, NoteEditor, NotesToolbar, LabelFilter, LabelManager, FloatingActionBar, EmptyState
  components/groceries/ Groceries feature: GroceryListCard, GroceryListEditor, GroceryToolbar, GroceryLabelFilter, GroceryLabelManager, etc.
  pages/                Feature pages grouped by route (auth/, dashboard/, profile/, settings/, notes/, groceries/)
  router/index.tsx      Single route config — two groups: public (AuthLayout) and protected (AppLayout)
  store/                Zustand stores: authStore.ts, themeStore.ts, toastStore.ts
  hooks/                Thin wrappers over stores + TanStack Query hooks: useAuth.ts, useTheme.ts, useNotes.ts, useGroceries.ts, useToast.ts
  lib/                  Shared infrastructure: api.ts (fetch wrapper), notesApi.ts, groceryApi.ts, queryClient.ts, utils.ts
  types/                Shared TypeScript interfaces: index.ts (User, AuthState, Note, NoteLabel, etc.), grocery.ts (GroceryList, GroceryItem, etc.)
e2e/                    Playwright tests (auth.spec.ts, dashboard.spec.ts, notes.spec.ts)
```

## Build & Test Commands

```bash
npm run dev          # Dev server at localhost:5173
npm run build        # tsc -b && vite build  (type-check + bundle)
npm run preview      # Serve the dist/ build locally
npm test             # Vitest (single run, src/**/*.test.{ts,tsx} only)
npm run test:watch   # Vitest in watch mode
npm run test:e2e     # Playwright (requires dev server running)
```

## TypeScript Constraints

The compiler is configured with `erasableSyntaxOnly` and `verbatimModuleSyntax` (`tsconfig.app.json`). This enforces two rules that will cause build failures if violated:

- **Type-only imports must use `import type`** — `src/store/authStore.ts:3` shows correct usage
- **No parameter property shorthand** (`public x: T` in constructors) — `src/lib/api.ts:5-13` shows the workaround

Path alias `@/` maps to `src/`. Always use it; no relative `../../` imports.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | No | Base URL for API calls. Defaults to `''` (same origin). See `src/lib/api.ts:3` |

## Additional Documentation

Check these files when working on relevant areas:

| File | When to read |
|---|---|
| `.claude/docs/architectural_patterns.md` | Adding state, components, forms, API calls, or tests |
