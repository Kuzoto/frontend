# Fix Premature Logout — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix premature logout by intercepting 403 responses (not just 401), storing `expiresAt` from auth responses, and proactively refreshing tokens via `setTimeout` before they expire.

**Architecture:** The `request()` interceptor in `api.ts` gains 403 handling. A module-level `setTimeout` in `api.ts` calls `refreshTokens()` ~1 min before the access token expires, chaining a new timer after each refresh. `expiresAt` is persisted in the Zustand auth store so the timer can resume after page reloads.

**Tech Stack:** TypeScript, Zustand (persist middleware), Vitest

---

### Task 1: Add `expiresAt` to types

**Files:**
- Modify: `src/types/index.ts:7-14` (AuthResponse)
- Modify: `src/types/index.ts:16-25` (AuthState)

**Step 1: Add `expiresAt` to `AuthResponse`**

In `src/types/index.ts`, add `expiresAt: number` to `AuthResponse`:

```ts
export interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  expiresAt: number
  name: string
  email: string
}
```

**Step 2: Add `expiresAt` to `AuthState` and update action signatures**

```ts
export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  accessToken: string | null
  refreshToken: string | null
  expiresAt: number | null
  login: (user: User, tokens: { accessToken: string; refreshToken: string; expiresAt: number }) => void
  logout: () => Promise<void>
  forceLogout: () => void
  setTokens: (tokens: { accessToken: string; refreshToken: string; expiresAt: number }) => void
}
```

**Step 3: Run build to see type errors (expected — store not yet updated)**

Run: `npm run build 2>&1 | head -30`
Expected: Type errors in `authStore.ts`, `LoginPage.tsx`, `SignupPage.tsx` (missing `expiresAt` in calls)

---

### Task 2: Update auth store to persist `expiresAt`

**Files:**
- Modify: `src/store/authStore.ts`
- Modify: `src/store/authStore.test.ts`

**Step 1: Write the failing test**

Add to `src/store/authStore.test.ts`:

```ts
  it('login stores expiresAt', () => {
    const user = { id: '1', name: 'Alice', email: 'alice@example.com' }
    useAuthStore.getState().login(user, { accessToken: 'a', refreshToken: 'r', expiresAt: 9999 })
    expect(useAuthStore.getState().expiresAt).toBe(9999)
  })

  it('forceLogout clears expiresAt', () => {
    useAuthStore.getState().forceLogout()
    expect(useAuthStore.getState().expiresAt).toBeNull()
  })

  it('setTokens updates expiresAt', () => {
    useAuthStore.getState().setTokens({ accessToken: 'new', refreshToken: 'new', expiresAt: 5555 })
    expect(useAuthStore.getState().expiresAt).toBe(5555)
  })
```

**Step 2: Run tests to verify they fail**

Run: `npm test -- src/store/authStore.test.ts 2>&1`
Expected: FAIL — type errors since store doesn't accept `expiresAt` yet

**Step 3: Update the store implementation**

Replace the full content of `src/store/authStore.ts`:

```ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, AuthState } from '@/types'
import { authApi } from '@/lib/api'

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      login: (user: User, tokens: { accessToken: string; refreshToken: string; expiresAt: number }) =>
        set({ user, isAuthenticated: true, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, expiresAt: tokens.expiresAt }),
      logout: async () => {
        const { refreshToken } = get()
        if (refreshToken) {
          await authApi.logout(refreshToken).catch(() => {})
        }
        set({ user: null, isAuthenticated: false, accessToken: null, refreshToken: null, expiresAt: null })
      },
      forceLogout: () =>
        set({ user: null, isAuthenticated: false, accessToken: null, refreshToken: null, expiresAt: null }),
      setTokens: (tokens: { accessToken: string; refreshToken: string; expiresAt: number }) =>
        set({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, expiresAt: tokens.expiresAt }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        expiresAt: state.expiresAt,
      }),
    }
  )
)
```

**Step 4: Update the `beforeEach` in `authStore.test.ts` to include `expiresAt`**

```ts
  beforeEach(() => {
    useAuthStore.setState({
      user: { id: '1', name: 'Alice', email: 'alice@example.com' },
      isAuthenticated: true,
      accessToken: 'tok',
      refreshToken: 'ref',
      expiresAt: 9999999999999,
    })
  })
```

**Step 5: Run tests to verify they pass**

Run: `npm test -- src/store/authStore.test.ts 2>&1`
Expected: PASS — all tests green

**Step 6: Commit**

```bash
git add src/types/index.ts src/store/authStore.ts src/store/authStore.test.ts
git commit -m "feat: add expiresAt to AuthResponse, AuthState, and auth store"
```

---

### Task 3: Intercept 403 in api.ts and add proactive refresh timer

**Files:**
- Modify: `src/lib/api.ts`
- Modify: `src/lib/api.test.ts`

**Step 1: Write failing tests for 403 interception**

Add these tests to `src/lib/api.test.ts` inside the `setOnUnauthorized` describe block:

```ts
  it('calls the handler when server returns 403 and there is no refresh token', async () => {
    const handler = vi.fn()
    setOnUnauthorized(handler)

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response('Forbidden', { status: 403, statusText: 'Forbidden' })
    ))

    await expect(api.get('/api/test')).rejects.toBeInstanceOf(ApiError)
    expect(handler).toHaveBeenCalledOnce()
  })

  it('attempts token refresh on 403 when refresh token exists', async () => {
    const handler = vi.fn()
    setOnUnauthorized(handler)

    vi.stubGlobal('localStorage', {
      getItem: vi.fn().mockReturnValue(
        JSON.stringify({ state: { accessToken: 'old', refreshToken: 'ref', expiresAt: 9999999999999 } })
      ),
      setItem: vi.fn(),
    })

    const refreshResponse = {
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
      tokenType: 'Bearer',
      expiresIn: 900,
      expiresAt: Date.now() + 900000,
      name: 'Test',
      email: 'test@test.com',
    }

    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(new Response('Forbidden', { status: 403 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(refreshResponse), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }))
    )

    const result = await api.get('/api/test')
    expect(result).toEqual({ ok: true })
    expect(handler).not.toHaveBeenCalled()
  })
```

**Step 2: Write failing test for `startRefreshTimer` / `stopRefreshTimer`**

Add a new describe block to `src/lib/api.test.ts`:

```ts
import { api, setOnUnauthorized, ApiError, startRefreshTimer, stopRefreshTimer } from './api'
```

Update the import at the top, then add:

```ts
describe('refresh timer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    stopRefreshTimer()
    vi.useRealTimers()
  })

  it('startRefreshTimer triggers refresh before expiry', async () => {
    const now = Date.now()
    const expiresAt = now + 900_000 // 15 min from now

    vi.stubGlobal('localStorage', {
      getItem: vi.fn().mockReturnValue(
        JSON.stringify({ state: { accessToken: 'a', refreshToken: 'r', expiresAt } })
      ),
      setItem: vi.fn(),
    })

    const refreshResponse = {
      accessToken: 'new-a',
      refreshToken: 'new-r',
      tokenType: 'Bearer',
      expiresIn: 900,
      expiresAt: now + 1_800_000,
      name: 'Test',
      email: 'test@test.com',
    }

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(JSON.stringify(refreshResponse), { status: 200 })
    ))

    startRefreshTimer(expiresAt)

    // Advance to 1 min before expiry (14 min = 840_000 ms)
    await vi.advanceTimersByTimeAsync(840_000)

    expect(fetch).toHaveBeenCalledOnce()
  })

  it('stopRefreshTimer prevents scheduled refresh', async () => {
    const expiresAt = Date.now() + 900_000

    vi.stubGlobal('fetch', vi.fn())

    startRefreshTimer(expiresAt)
    stopRefreshTimer()

    await vi.advanceTimersByTimeAsync(900_000)
    expect(fetch).not.toHaveBeenCalled()
  })
})
```

**Step 3: Run tests to verify they fail**

Run: `npm test -- src/lib/api.test.ts 2>&1`
Expected: FAIL — `startRefreshTimer` and `stopRefreshTimer` not exported, 403 not intercepted

**Step 4: Update `api.ts` — add 403 interception and refresh timer**

Changes to `src/lib/api.ts`:

a) Update `setAuthStoreTokens` to also save `expiresAt`:

```ts
function setAuthStoreTokens(accessToken: string, refreshToken: string, expiresAt: number) {
  const raw = localStorage.getItem('auth-storage')
  if (!raw) return
  try {
    const parsed = JSON.parse(raw)
    parsed.state.accessToken = accessToken
    parsed.state.refreshToken = refreshToken
    parsed.state.expiresAt = expiresAt
    localStorage.setItem('auth-storage', JSON.stringify(parsed))
  } catch {
    // ignore
  }
}
```

b) Update `refreshTokens()` to save `expiresAt` and restart timer:

```ts
async function refreshTokens(): Promise<AuthResponse> {
  const store = getAuthStore()
  const refreshToken = store?.refreshToken
  if (!refreshToken) throw new ApiError(401, 'No refresh token')

  const response = await fetch(`${BASE_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })

  if (!response.ok) {
    throw new ApiError(response.status, 'Token refresh failed')
  }

  const data = (await response.json()) as AuthResponse
  setAuthStoreTokens(data.accessToken, data.refreshToken, data.expiresAt)
  startRefreshTimer(data.expiresAt)
  return data
}
```

c) Change the interceptor condition on line 84 from `401` to `401 || 403`:

```ts
  if ((response.status === 401 || response.status === 403) && !skipAuth && store?.refreshToken) {
```

d) Change the `onUnauthorized` guard on line 127 from `401` to `401 || 403`:

```ts
    if ((response.status === 401 || response.status === 403) && !skipAuth) onUnauthorized?.()
```

e) Add refresh timer functions at the bottom (before the `export const api` block):

```ts
let refreshTimer: ReturnType<typeof setTimeout> | null = null

export function startRefreshTimer(expiresAt: number) {
  stopRefreshTimer()
  const delay = expiresAt - Date.now() - 60_000 // 1 min buffer
  if (delay <= 0) {
    // Token already expired or about to — refresh immediately
    refreshTokens().catch(() => onUnauthorized?.())
    return
  }
  refreshTimer = setTimeout(() => {
    refreshTimer = null
    refreshTokens().catch(() => onUnauthorized?.())
  }, delay)
}

export function stopRefreshTimer() {
  if (refreshTimer !== null) {
    clearTimeout(refreshTimer)
    refreshTimer = null
  }
}
```

**Step 5: Run tests to verify they pass**

Run: `npm test -- src/lib/api.test.ts 2>&1`
Expected: PASS

**Step 6: Commit**

```bash
git add src/lib/api.ts src/lib/api.test.ts
git commit -m "feat: intercept 403 for token refresh and add proactive refresh timer"
```

---

### Task 4: Update Login/Signup pages and main.tsx

**Files:**
- Modify: `src/pages/auth/LoginPage.tsx:47-53`
- Modify: `src/pages/auth/SignupPage.tsx:62-72`
- Modify: `src/main.tsx`

**Step 1: Update LoginPage to pass `expiresAt` and start timer**

In `src/pages/auth/LoginPage.tsx`, add import:

```ts
import { authApi, ApiError, startRefreshTimer } from '@/lib/api'
```

Then update the login call (lines 47-53):

```ts
      const response = await authApi.login(form)
      const user = {
        id: '',
        name: response.name,
        email: response.email,
      }
      login(user, { accessToken: response.accessToken, refreshToken: response.refreshToken, expiresAt: response.expiresAt })
      startRefreshTimer(response.expiresAt)
      navigate('/dashboard')
```

**Step 2: Update SignupPage identically**

In `src/pages/auth/SignupPage.tsx`, add import:

```ts
import { authApi, ApiError, startRefreshTimer } from '@/lib/api'
```

Then update the signup call (lines 62-72):

```ts
      const response = await authApi.signup({
        name: form.name,
        email: form.email,
        password: form.password,
      })
      const user = {
        id: '',
        name: response.name,
        email: response.email,
      }
      login(user, { accessToken: response.accessToken, refreshToken: response.refreshToken, expiresAt: response.expiresAt })
      startRefreshTimer(response.expiresAt)
      navigate('/dashboard')
```

**Step 3: Update `main.tsx` — resume timer on load, stop on logout**

Replace `src/main.tsx`:

```ts
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { registerSW } from 'virtual:pwa-register'
import { queryClient } from '@/lib/queryClient'
import { router } from '@/router'
import { setOnUnauthorized, startRefreshTimer, stopRefreshTimer } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import Toaster from '@/components/ui/toaster'
import './index.css'

registerSW({ immediate: true })

setOnUnauthorized(() => {
  stopRefreshTimer()
  useAuthStore.getState().forceLogout()
  router.navigate('/login')
})

// Resume refresh timer if user is already authenticated (page reload)
const authState = useAuthStore.getState()
if (authState.isAuthenticated && authState.expiresAt) {
  startRefreshTimer(authState.expiresAt)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster />
    </QueryClientProvider>
  </StrictMode>
)
```

**Step 4: Run full build to verify no type errors**

Run: `npm run build 2>&1`
Expected: Build succeeds with no errors

**Step 5: Run all tests**

Run: `npm test 2>&1`
Expected: All tests pass

**Step 6: Commit**

```bash
git add src/pages/auth/LoginPage.tsx src/pages/auth/SignupPage.tsx src/main.tsx
git commit -m "feat: pass expiresAt on login/signup, resume refresh timer on page load"
```

---

### Task 5: Stop refresh timer on explicit logout

**Files:**
- Modify: `src/store/authStore.ts`

**Step 1: Import `stopRefreshTimer` and call it in `logout`**

Update `src/store/authStore.ts`:

```ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, AuthState } from '@/types'
import { authApi, stopRefreshTimer } from '@/lib/api'
```

In the `logout` action, add `stopRefreshTimer()` before the API call:

```ts
      logout: async () => {
        stopRefreshTimer()
        const { refreshToken } = get()
        if (refreshToken) {
          await authApi.logout(refreshToken).catch(() => {})
        }
        set({ user: null, isAuthenticated: false, accessToken: null, refreshToken: null, expiresAt: null })
      },
```

**Step 2: Run tests**

Run: `npm test 2>&1`
Expected: All tests pass

**Step 3: Run build**

Run: `npm run build 2>&1`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/store/authStore.ts
git commit -m "feat: stop refresh timer on explicit logout"
```
