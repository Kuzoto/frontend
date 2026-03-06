# Fix Premature Logout

## Problem

Users get logged out after ~15 minutes of inactivity. The backend uses short-lived access tokens (15 min) with refresh token rotation (7 day refresh tokens). The frontend has two issues:

1. **403 vs 401 mismatch** — Backend returns 403 for expired/invalid tokens, but `api.ts` only intercepts 401. The refresh interceptor never triggers.
2. **No proactive token refresh** — No timer-based refresh before token expiry. Users hit expired tokens on their next request.
3. **`expiresAt` not stored** — Backend sends `expiresAt` in auth responses but the frontend ignores it.

## Design

### 1. `api.ts` — Intercept 403 alongside 401

Change `response.status === 401` to `(response.status === 401 || response.status === 403)` in:
- The refresh interceptor (line 84)
- The generic error path that calls `onUnauthorized` (line 127)

### 2. `types/index.ts` — Add `expiresAt`

- `AuthResponse` gets `expiresAt: number` field
- `AuthState` gets `expiresAt: number | null` field, persisted to localStorage

### 3. `authStore.ts` — Store and persist `expiresAt`

- `login()` accepts `expiresAt` alongside tokens
- `setTokens()` also accepts `expiresAt`
- `forceLogout()`/`logout()` clear it to null

### 4. `api.ts` — Proactive refresh via setTimeout

- Export `startRefreshTimer(expiresAt)` — sets `setTimeout` for `expiresAt - Date.now() - 60_000` (1 min buffer)
- Export `stopRefreshTimer()` — clears the timeout
- After successful refresh, save new tokens + `expiresAt` to store, then call `startRefreshTimer` again
- Timer auto-chains: login -> timer -> refresh -> timer -> refresh -> ...

### 5. Login/Signup pages — Pass `expiresAt` and start timer

- Pass `response.expiresAt` to `login()` store action
- Call `startRefreshTimer(response.expiresAt)` after login

### 6. `main.tsx` — Resume timer on page load

- On app startup, if authenticated and `expiresAt` exists in store, call `startRefreshTimer(expiresAt)`
- This handles page refreshes mid-session
