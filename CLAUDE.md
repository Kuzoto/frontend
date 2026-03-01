# Personal Space — Frontend

Personal productivity web app with notes, todos, movies, travel ideas, and groceries. React SPA with cookie-based auth and PWA support. Backend is not yet implemented; `src/lib/api.ts` contains stubs.

## Tech Stack

| Layer | Technology |
|---|---|
| Build | Vite 7, TypeScript 5.9 |
| UI | React 19, Tailwind CSS v4, Radix UI primitives (shadcn/ui pattern) |
| Routing | React Router v7 |
| State | Zustand v5 (with localStorage persistence) |
| Data fetching | TanStack Query v5 (configured but unused until backend exists) |
| Icons | Lucide React |
| PWA | vite-plugin-pwa + Workbox |
| Unit tests | Vitest + React Testing Library |
| E2E tests | Playwright |

## Key Directories

```
src/
  components/ui/        Radix UI primitives styled with Tailwind (button, card, input, etc.)
  components/layout/    Page shells: AuthLayout, AppLayout, TopNav, Sidebar
  components/shared/    Cross-cutting components: ProtectedRoute, ThemeToggle, FeatureCard
  pages/                Feature pages grouped by route (auth/, dashboard/, profile/, settings/)
  router/index.tsx      Single route config — two groups: public (AuthLayout) and protected (AppLayout)
  store/                Zustand stores: authStore.ts, themeStore.ts
  hooks/                Thin wrappers over stores: useAuth.ts, useTheme.ts
  lib/                  Shared infrastructure: api.ts (fetch wrapper + stubs), queryClient.ts, utils.ts
  types/index.ts        All shared TypeScript interfaces (User, AuthState, Theme, Feature)
e2e/                    Playwright tests (auth.spec.ts, dashboard.spec.ts)
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

- **Type-only imports must use `import type`** — `src/store/authStore.ts:1` shows correct usage
- **No parameter property shorthand** (`public x: T` in constructors) — `src/lib/api.ts:3-10` shows the workaround

Path alias `@/` maps to `src/`. Always use it; no relative `../../` imports.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | No | Base URL for API calls. Defaults to `''` (same origin). See `src/lib/api.ts:1` |

## Additional Documentation

Check these files when working on relevant areas:

| File | When to read |
|---|---|
| `.claude/docs/architectural_patterns.md` | Adding state, components, forms, API calls, or tests |
