# Auth Redirect on Unauthorized — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Automatically force-logout and redirect to `/login` whenever the API receives an unrecoverable 401 response.

**Architecture:** Add a module-level callback (`onUnauthorized`) to `api.ts` registered via `setOnUnauthorized`. Register the handler in `main.tsx` using Zustand's `getState()` (outside React) and the router's `.navigate()`. Add a `forceLogout` action to the auth store that clears state without calling the API.

**Tech Stack:** React 19, Zustand v5, React Router v7, Vitest + React Testing Library

---

### Task 1: Add `forceLogout` to `AuthState` type and store

**Files:**
- Modify: `src/types/index.ts:16-24`
- Modify: `src/store/authStore.ts`
- Create: `src/store/authStore.test.ts`

**Step 1: Write the failing test**

Create `src/store/authStore.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from './authStore'

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: { id: '1', name: 'Alice', email: 'alice@example.com' },
      isAuthenticated: true,
      accessToken: 'tok',
      refreshToken: 'ref',
    })
  })

  it('forceLogout clears all auth state without calling logout API', () => {
    useAuthStore.getState().forceLogout()
    const { user, isAuthenticated, accessToken, refreshToken } = useAuthStore.getState()
    expect(user).toBeNull()
    expect(isAuthenticated).toBe(false)
    expect(accessToken).toBeNull()
    expect(refreshToken).toBeNull()
  })
})
```

**Step 2: Run test to verify it fails**

```bash
npm test -- authStore.test.ts
```

Expected: FAIL — `forceLogout is not a function`

**Step 3: Add `forceLogout` to `AuthState` in `src/types/index.ts`**

Add the line to the `AuthState` interface:

```ts
export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  accessToken: string | null
  refreshToken: string | null
  login: (user: User, tokens: { accessToken: string; refreshToken: string }) => void
  logout: () => Promise<void>
  forceLogout: () => void
  setTokens: (tokens: { accessToken: string; refreshToken: string }) => void
}
```

**Step 4: Add `forceLogout` action to `src/store/authStore.ts`**

Add after the `logout` action:

```ts
forceLogout: () =>
  set({ user: null, isAuthenticated: false, accessToken: null, refreshToken: null }),
```

**Step 5: Run test to verify it passes**

```bash
npm test -- authStore.test.ts
```

Expected: PASS

**Step 6: Commit**

```bash
git add src/types/index.ts src/store/authStore.ts src/store/authStore.test.ts
git commit -m "feat: add forceLogout action to auth store"
```

---

### Task 2: Add `setOnUnauthorized` callback to `api.ts`

**Files:**
- Modify: `src/lib/api.ts`
- Create: `src/lib/api.test.ts`

**Step 1: Write the failing tests**

Create `src/lib/api.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { api, setOnUnauthorized, ApiError } from './api'

// Silence localStorage reads — no auth tokens in tests
beforeEach(() => {
  vi.stubGlobal('localStorage', {
    getItem: vi.fn().mockReturnValue(null),
    setItem: vi.fn(),
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
  setOnUnauthorized(null)
})

describe('setOnUnauthorized', () => {
  it('calls the handler when server returns 401 and there is no refresh token', async () => {
    const handler = vi.fn()
    setOnUnauthorized(handler)

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response('Unauthorized', { status: 401, statusText: 'Unauthorized' })
    ))

    await expect(api.get('/api/test')).rejects.toBeInstanceOf(ApiError)
    expect(handler).toHaveBeenCalledOnce()
  })

  it('calls the handler when the token refresh also fails', async () => {
    const handler = vi.fn()
    setOnUnauthorized(handler)

    // Seed a fake refresh token so the refresh path is triggered
    vi.stubGlobal('localStorage', {
      getItem: vi.fn().mockReturnValue(
        JSON.stringify({ state: { accessToken: 'old', refreshToken: 'ref' } })
      ),
      setItem: vi.fn(),
    })

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response('Unauthorized', { status: 401, statusText: 'Unauthorized' })
    ))

    await expect(api.get('/api/test')).rejects.toBeInstanceOf(ApiError)
    expect(handler).toHaveBeenCalledOnce()
  })

  it('does not call the handler for non-401 errors', async () => {
    const handler = vi.fn()
    setOnUnauthorized(handler)

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response('Not Found', { status: 404, statusText: 'Not Found' })
    ))

    await expect(api.get('/api/test')).rejects.toBeInstanceOf(ApiError)
    expect(handler).not.toHaveBeenCalled()
  })

  it('does not call the handler when request succeeds', async () => {
    const handler = vi.fn()
    setOnUnauthorized(handler)

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    ))

    await api.get('/api/test')
    expect(handler).not.toHaveBeenCalled()
  })
})
```

**Step 2: Run tests to verify they fail**

```bash
npm test -- api.test.ts
```

Expected: FAIL — `setOnUnauthorized is not a function`

**Step 3: Implement `setOnUnauthorized` in `src/lib/api.ts`**

After the `let refreshPromise` line, add:

```ts
let onUnauthorized: (() => void) | null = null
export function setOnUnauthorized(fn: (() => void) | null) {
  onUnauthorized = fn
}
```

**Step 4: Call `onUnauthorized` in the two unrecoverable 401 paths**

*Path 1 — refresh attempt catch block (around line 105):*

```ts
    } catch {
      refreshPromise = null
      onUnauthorized?.()
      throw new ApiError(401, 'Session expired')
    }
```

*Path 2 — generic `!response.ok` block (around line 111). Add the call before the throw, guarded to non-skipAuth 401s:*

```ts
  if (!response.ok) {
    let message = response.statusText
    let errors: Record<string, string> | null = null
    try {
      const body = await response.json()
      message = body.message ?? JSON.stringify(body)
      errors = body.errors ?? null
    } catch {
      message = await response.text().catch(() => response.statusText)
    }
    if (response.status === 401 && !skipAuth) onUnauthorized?.()
    throw new ApiError(response.status, message, errors)
  }
```

**Step 5: Run tests to verify they pass**

```bash
npm test -- api.test.ts
```

Expected: PASS (all 4 tests)

**Step 6: Commit**

```bash
git add src/lib/api.ts src/lib/api.test.ts
git commit -m "feat: add setOnUnauthorized callback to api layer"
```

---

### Task 3: Register the handler in `main.tsx`

**Files:**
- Modify: `src/main.tsx`

There is no unit test for this wiring step — it is verified by manual smoke test below.

**Step 1: Add imports and register the handler in `src/main.tsx`**

Add two imports after the existing imports:

```ts
import { setOnUnauthorized } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
```

Register the handler before `createRoot(...)`:

```ts
setOnUnauthorized(() => {
  useAuthStore.getState().forceLogout()
  router.navigate('/login')
})
```

Final `src/main.tsx` should look like:

```ts
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { registerSW } from 'virtual:pwa-register'
import { queryClient } from '@/lib/queryClient'
import { router } from '@/router'
import { setOnUnauthorized } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import Toaster from '@/components/ui/toaster'
import './index.css'

registerSW({ immediate: true })

setOnUnauthorized(() => {
  useAuthStore.getState().forceLogout()
  router.navigate('/login')
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster />
    </QueryClientProvider>
  </StrictMode>
)
```

**Step 2: Run full test suite to check for regressions**

```bash
npm test
```

Expected: All existing tests pass, new tests pass

**Step 3: Build check**

```bash
npm run build
```

Expected: No TypeScript errors, build succeeds

**Step 4: Manual smoke test**

1. Start dev server: `npm run dev`
2. Log in to the app
3. Open DevTools → Network tab → right-click any API request → Block request URL
4. Navigate to any protected page (e.g. `/notes`)
5. Trigger an action that makes an API call
6. Verify: auth state is cleared, user is redirected to `/login`

**Step 5: Commit**

```bash
git add src/main.tsx
git commit -m "feat: register unauthorized handler — force logout and redirect on 401"
```
