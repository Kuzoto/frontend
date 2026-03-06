# Noook — Personal Space Frontend

A personal productivity web app for managing notes, grocery lists, and more. Built as a React SPA with cookie/token-based auth and PWA support.

## Features

| Feature | Status |
|---|---|
| Notes | Live — create, edit, pin, archive, label, search, infinite scroll |
| Grocery Lists | Live — create, manage items, label, archive, search, infinite scroll |
| Todos | Coming soon |
| Movies | Coming soon |
| Travel Ideas | Coming soon |

## Tech Stack

| Layer | Technology |
|---|---|
| Build | Vite 7, TypeScript 5.9 |
| UI | React 19, Tailwind CSS v4, Radix UI primitives (shadcn/ui pattern) |
| Routing | React Router v7 |
| State | Zustand v5 (with localStorage persistence) |
| Rich text | TipTap (StarterKit + TaskList/TaskItem) |
| Data fetching | TanStack Query v5 (infinite queries for lists, standard for labels) |
| Icons | Lucide React |
| PWA | vite-plugin-pwa + Workbox |
| Unit tests | Vitest + React Testing Library |
| E2E tests | Playwright |

## Prerequisites

- Node.js 20+
- npm 10+
- A running backend API (see `VITE_API_URL` below)

## Setup

```bash
# Install dependencies
npm install

# Copy and configure environment (optional — defaults to same-origin)
echo "VITE_API_URL=http://localhost:8080" > .env.local

# Start the dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | No | Base URL for the backend API. Defaults to `''` (same origin). |

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with HMR at `localhost:5173` |
| `npm run build` | Type-check and bundle for production (`dist/`) |
| `npm run preview` | Serve the production build locally |
| `npm test` | Run unit tests with Vitest (single run) |
| `npm run test:watch` | Run unit tests in watch mode |
| `npm run test:e2e` | Run Playwright E2E tests (requires dev server running) |

## Authentication

Auth is JWT-based with refresh token support:

- **Signup** (`/`) — creates an account and logs in
- **Login** (`/login`) — email + password, returns access and refresh tokens
- **Token refresh** — automatic, proactive refresh 1 minute before expiry via a background timer; also triggered reactively on 401/403 responses
- **Logout** — invalidates the refresh token server-side and clears local state
- Tokens are stored in `localStorage` via the Zustand `authStore`; all API calls attach `Authorization: Bearer <token>`

## Theme

Light, dark, and system themes are supported. The preference is persisted in `localStorage` via the Zustand `themeStore`. Toggle is available from the top nav and the Settings page.

## PWA

The app registers a service worker (Workbox) for offline support and can be installed as a PWA on supported browsers.

## Project Structure

See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for a detailed breakdown of directories, pages, and components.
