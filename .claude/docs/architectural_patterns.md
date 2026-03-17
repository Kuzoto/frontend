# Architectural Patterns

Patterns observed across multiple files. Follow these when adding new code.

---

## 1. Zustand Store with Persistence

Both stores share the same shape: `create<Interface>()(persist((set) => ({ ...state, ...actions }), { name: 'storage-key' }))`.

- `src/store/authStore.ts:6-40` — auth state (`user`, `isAuthenticated`, `login`, `logout`, `forceLogout`, `setTokens`)
- `src/store/themeStore.ts:5-15` — theme state (`theme`, `setTheme`)

The `partialize` option on authStore (`authStore.ts:31-37`) limits what gets written to localStorage — use this when a store has derived or ephemeral state that shouldn't persist.

Actions are defined inline in `set` callbacks, not as separate functions. The `logout` action (`authStore.ts:16-22`) demonstrates calling an async side effect (API) inside an action before calling `set`.

---

## 2. Hook Wrapper Over Store

Stores are never imported directly in components. Each store has a corresponding thin hook in `src/hooks/` that destructures and re-exports the slice components need.

- `src/hooks/useAuth.ts` wraps `useAuthStore`
- `src/hooks/useTheme.ts` wraps `useThemeStore` and adds DOM side effects

This indirection means the store implementation can change without touching every consumer. It also makes mocking straightforward in tests — mock the hook, not the store.

---

## 3. Form State: Local useState + try/catch/finally

All forms manage their own state locally, not via a form library. The pattern is consistent across:

- `src/pages/auth/LoginPage.tsx:15-55`
- `src/pages/auth/SignupPage.tsx:25-54`
- `src/pages/profile/ProfilePage.tsx`

Shape: one `useState` object for field values, a separate `error` string state, a `fieldErrors` object state, a `loading` boolean, a single `handleChange` that spreads by `e.target.name`, a `validate` function for client-side validation, and a `handleSubmit` with `try/catch/finally` that sets `loading` and clears errors. The submit button is disabled and its text changes while `loading` is true.

---

## 4. Constant Arrays Mapped to Components

Feature lists and navigation items are defined as typed constant arrays at module scope, then `.map()`-ed to JSX. This separates data from rendering logic.

- `src/pages/dashboard/DashboardPage.tsx:17-35` — `FEATURES` array → `FeatureCard`
- `src/pages/auth/SignupPage.tsx:11-16` — `FEATURES` string array → `<li>` bullets
- `src/components/layout/Sidebar.tsx:15-22` — `NAV_ITEMS` array → `NavLink`
- `src/components/shared/ThemeToggle.tsx:6-12` — `OPTIONS` array → `Button`

---

## 5. Radix Primitive Wrapping

The `src/components/ui/` components are thin styled wrappers over Radix UI primitives. Each file follows the same structure: import the Radix primitive, `forwardRef` to forward the ref to the underlying element, compose Tailwind classes with `cn()`, and set `displayName` to match the Radix primitive's displayName.

- `src/components/ui/label.tsx:8-16`
- `src/components/ui/separator.tsx:8-21`
- `src/components/ui/toggle.tsx:27-35`
- `src/components/ui/dropdown-menu.tsx` throughout

When adding a new ui component, match this structure exactly. `forwardRef` is required because Radix passes refs for focus management and accessibility.

---

## 6. CVA Variants for Component Styling

Polymorphic style variants are declared with `class-variance-authority` (`cva`) and the resulting `VariantProps` type is added to the component's props interface.

- `src/components/ui/button.tsx:6-31` — `buttonVariants` with `variant` and `size`
- `src/components/ui/toggle.tsx:6-23` — `toggleVariants` with `variant` and `size`
- `src/components/ui/label.tsx:7` — `labelVariants` with no sub-variants

The base classes (always applied) go in `cva`'s first argument. Variants go in the `variants` object. `defaultVariants` defines the fallback. External callers pass `className` which is merged last via `cn()`.

---

## 7. `cn()` for Conditional Class Composition

Every component that accepts a `className` prop merges it using `cn()` from `src/lib/utils.ts`. The function composes `clsx` (conditional logic) with `tailwind-merge` (conflict resolution).

Used in: every file in `src/components/ui/`, `src/components/layout/Sidebar.tsx:43-52`, `src/components/shared/ThemeToggle.tsx`.

Call signature: `cn('static classes', condition && 'conditional classes', className)`. The caller's `className` always goes last so it wins over defaults.

---

## 8. `asChild` Polymorphism via Radix Slot

When a component should render as a different element (e.g., a `Button` that is actually an `<a>` or `Link`), pass `asChild` and wrap the target element as a child.

- `src/components/layout/TopNav.tsx:53-54` — `DropdownMenuTrigger asChild` wrapping `Button`
- `src/components/ui/dropdown-menu.tsx` — `DropdownMenuItem asChild` wrapping child elements

The Slot primitive (`@radix-ui/react-slot`) in `src/components/ui/button.tsx:41` merges props onto the child element instead of rendering a `<button>`. Do not add extra wrappers inside `asChild` — the immediate child receives all merged props.

---

## 9. Protected Route via Wrapper Component

The authenticated route tree is guarded by a single wrapper component rather than per-route checks.

- Guard component: `src/components/shared/ProtectedRoute.tsx`
- Applied at: `src/router/index.tsx:25-28` — wraps `AppLayout` which is the parent of all authenticated routes

The guard reads `isAuthenticated` from `useAuth()` and uses React Router's `<Navigate replace>` for the redirect. The `replace` flag prevents the protected URL from being added to history, so the back button does not return to a flashing protected page.

---

## 10. Dual-Layout Routing

The router defines two parallel route trees, each with its own layout component, rather than one root layout with conditional rendering.

- `src/router/index.tsx:16-22` — public routes under `AuthLayout` (centered card, no sidebar)
- `src/router/index.tsx:24-38` — protected routes under `AppLayout` (nav + sidebar)

`AuthLayout` (`src/components/layout/AuthLayout.tsx`) centers its `<Outlet>` vertically. `AppLayout` (`src/components/layout/AppLayout.tsx`) renders the full nav+sidebar shell. Adding a new public page means adding a child to the first group; a new authenticated page goes in the second.

---

## 11. NavLink Active Styling

Navigation links that need to reflect the active route use `NavLink` (not `Link`). The `className` prop receives a function `({ isActive }) => ...` which returns the appropriate Tailwind string via `cn()`.

- `src/components/layout/Sidebar.tsx:83-99`

The active state applies `bg-primary text-primary-foreground`; inactive applies `text-muted-foreground hover:bg-accent hover:text-accent-foreground`. Coming-soon items are rendered as disabled `<div>` elements instead of `NavLink`. Do not use `Link` for navigation items that need active highlighting.

---

## 12. Test: Mock the Hook, Wrap with MemoryRouter

All component tests follow the same setup:
1. `vi.mock('@/hooks/useAuth')` (or whichever hook the component uses)
2. Cast the mock: `const mock = hookFn as ReturnType<typeof vi.fn>`
3. Call `mock.mockReturnValue({ ... })` with required shape
4. Wrap the component in `<MemoryRouter>` if it contains `Link` or `NavLink`
5. Mock `useNavigate` separately when the component calls `navigate()`

- `src/components/layout/TopNav.test.tsx:1-17`
- `src/pages/auth/LoginPage.test.tsx:1-20`
- `src/pages/auth/SignupPage.test.tsx:1-20`
- `src/components/shared/ThemeToggle.test.tsx:1-15`

Use accessibility queries (`getByRole`, `getByLabelText`, `getByText`) — never query by class name or test ID unless there is no accessible alternative. Call `vi.clearAllMocks()` in `beforeEach`.

---

## 13. TanStack Query Key Factories

Query keys are centralized as factory objects to ensure consistent cache invalidation.

- `src/hooks/useNotes.ts:21-27` — `noteKeys` and `labelKeys` factories

Shape: `all` → `lists()` → `list(params)` and `details()` → `detail(id)`. Each level extends the parent array so `invalidateQueries({ queryKey: noteKeys.lists() })` invalidates all list variations.

---

## 14. Infinite Scroll with Intersection Observer

Paginated lists use `useInfiniteQuery` from TanStack Query combined with an `IntersectionObserver` on a sentinel `<div>` at the bottom of the list.

- `src/hooks/useNotes.ts:61-64` — `useNotesInfinite` with `getNextPageParam`
- `src/pages/notes/NotesPage.tsx:63-70` — sentinel ref + observer setup

The observer has `rootMargin: '200px'` for pre-fetching before the user reaches the bottom. Pages are flattened with `data.pages.flatMap(p => p.content)`.

---

## 15. CSS Masonry with `columns`

Card grids use CSS `columns` (not CSS Grid or Masonry) for a Pinterest-style layout. Cards use `break-inside-avoid` to prevent splitting across columns.

- `src/pages/notes/NotesPage.tsx` — `columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4`
- `src/components/notes/NoteCard.tsx` — `break-inside-avoid mb-4` on each card

---

## 16. Optimistic/Invalidation Pattern for Mutations

Mutations call `queryClient.invalidateQueries()` in `onSuccess` to refetch stale data. For bulk operations, `Promise.all` is used to run multiple mutations in parallel.

- `src/hooks/useNotes.ts:97-210` — all note/label mutations follow this pattern
- Bulk mutations: `useBulkDeleteNotes`, `useBulkArchiveNotes`
