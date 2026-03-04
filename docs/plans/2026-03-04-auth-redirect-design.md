# Auth Redirect on Unauthorized — Design

**Date:** 2026-03-04

## Problem

When a request fails with 401 and the token refresh also fails (or no refresh token exists), the API layer throws `ApiError(401, 'Session expired')` but leaves auth state intact and does not redirect. The user stays on the protected page with broken state.

## Goal

Automatically force-logout and redirect to `/login` whenever the server returns an unrecoverable 401.

## Approach: Module-level callback in `api.ts`

Chosen over DOM events (indirect, harder to trace) and TanStack Query global error handler (incomplete coverage).

## Changes

### `src/lib/api.ts`

Add a module-level callback and setter:

```ts
let onUnauthorized: (() => void) | null = null
export function setOnUnauthorized(fn: () => void) { onUnauthorized = fn }
```

Call `onUnauthorized?.()` before throwing in both unrecoverable 401 paths:
1. The catch block after refresh fails (inside `response.status === 401 && !skipAuth` guard)
2. The generic `!response.ok` block when `status === 401`

### `src/store/authStore.ts`

Add `forceLogout` action — clears local state only, no API call:

```ts
forceLogout: () => set({ user: null, isAuthenticated: false, accessToken: null, refreshToken: null })
```

This avoids a second failing API call when the server has already rejected us.

### `src/main.tsx`

Register the handler once at app startup:

```ts
setOnUnauthorized(() => {
  useAuthStore.getState().forceLogout()
  router.navigate('/login')
})
```

## Edge Cases

- **Already on `/login`** — `navigate('/login')` is harmless
- **Concurrent 401s** — `forceLogout()` is idempotent; multiple `navigate('/login')` calls are safe
- **skipAuth requests** (signup/login/refresh) — the refresh-failure catch is inside the `!skipAuth` guard, so it is already excluded; the generic error path will also call `onUnauthorized` on 401 — these endpoints should not return 401 in normal flow, but if they do it is safe to redirect
