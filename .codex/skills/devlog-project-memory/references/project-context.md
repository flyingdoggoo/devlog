# DevLog Project Context Memory

## 1) Repository Layout

- Root: `backend/`, `frontend/`
- Backend: NestJS + Prisma + PostgreSQL
- Frontend: React + Vite + Tailwind + Redux Toolkit (auth-first, mixed local state for pages)

## 2) Frontend Snapshot

### Core app files

- Store: `frontend/src/app/store.ts`
- Routes: `frontend/src/routes/index.tsx`
- Global styles: `frontend/src/index.css`
- API client: `frontend/src/services/api.ts`

### Current routing split (guest-first)

- Public routes:
  - `/` and `/home` -> dashboard feed
  - `/search` -> unified search page
  - `/posts/:id` -> post detail page
  - `/login`, `/register` -> auth page (mode by pathname)
- Auth-required routes:
  - `/posts/create` -> create post page
  - `/profile/me` -> personal profile page
  - `/profile/:username` -> profile page (still behind auth)
  - `/settings` -> settings placeholder page

### Important pages

- Dashboard: `frontend/src/pages/home/HomePage.tsx`
  - Real post feed with pagination/infinite loading
  - Card shows author, tag, excerpt/content, likes/comments
- Post detail: `frontend/src/pages/post/PostDetailPage.tsx`
  - Pulls post by id + comments
  - Reading progress + discussion section
- Profile: `frontend/src/pages/profile/ProfilePage.tsx`
  - Template-style profile UI integrated into React
- Settings: `frontend/src/pages/settings/SettingsPage.tsx`

### Shared header user menu

- Component: `frontend/src/components/AvatarMenu.tsx`
- Trigger: click avatar (top-right)
- Menu items: `Dashboard`, `Settings`, `Create Post`, `Log out`

### Auth and user state

- Slice: `frontend/src/features/auth/auth.slice.ts`
- Thunks: `frontend/src/features/auth/auth.thunks.ts`
- Service: `frontend/src/services/auth.service.ts`
- Contract note: backend success responses use `{ ok, data }`; frontend unwraps `data`.
- Login/register redirect behavior:
  - `AuthGuard` now preserves `from` in router state when redirecting to `/login`.
  - Login/register success redirects back to `from` (fallback `/`).
  - `register` thunk performs register then login to establish session cookies.

### FE style language

- Primary visual style: monochrome neutral, high contrast headings, clean cards.
- Fonts used: Space Grotesk (headlines), Inter (body), Material Symbols icon font.
- Existing design favors soft borders, rounded-xl cards, subtle neutral hover states.
- New interaction layer (Apr 2026): colorful micro-interactions via shared classes in `frontend/src/index.css` (`route-transition`, `interactive-card`, `tap-feedback`, `like-button`, `icon-badge*`).
- Key pages (`HomePage`, `SearchPage`, `PostDetailPage`) now use mixed Lucide icons + accent hover/click states for clearer affordances.
- `ProfilePage` is now synced with the same interaction language and Lucide accent icons; `Create Post` buttons follow border-blue/white style.
- Logout UX: Avatar menu now redirects to home (`/`) after logout instead of `/login`.

## 3) Backend Snapshot

### Core stack

- NestJS modules in `backend/src`
- Prisma schema in `backend/prisma/schema.prisma`
- Global response wrapper: `ok + data` via success interceptor
- Global exception shape: `{ ok: false, message, path, timestamp }`

### Main modules in use

- `authentication` (cookie-based session/JWT)
- `users`
- `posts`
- `comments`
- `tags`
- `likes`
- `follows`

### Auth/session behavior

- Login/refresh use HttpOnly cookies (`Authentication`, `RefreshToken`, `SessionId`)
- Logout endpoint exists: `POST /auth/logout`
- Google strategy available and stores profile picture (`avatarUrl`) when possible

### Post and comments data

- Post list endpoint supports pagination (`page`, `limit`)
- Post response includes author/tags/counts and comment preview in feed path
- Comment list endpoint returns threaded data and includes comment author metadata

## 4) UI/UX + Engineering Conventions

- Preserve existing monochrome visual language unless user requests redesign.
- Reuse existing components/utilities before creating new abstractions.
- Keep route and API naming consistent with current patterns.
- Prefer lightweight local page state unless cross-page coordination is needed.
- For avatar rendering, always include graceful fallback initials when image fails.

## 5) API Contract Conventions

- Successful responses: `{ ok: true, data: ... }`
- Client services should normalize shape at the service boundary when needed.
- Avoid leaking backend-specific nested shapes directly into page-level rendering code.

## 6) Operational Notes

- Frontend build may fail on Vite in restricted environments (`spawn EPERM`), but `npx tsc -b` is used for reliable type checks.
- Backend build command: `npm run build` (inside `backend`).
- Frontend typecheck command: `npx tsc -b` (inside `frontend`).
- Render deployment baseline now exists:
  - Root `render.yaml` provisions API web service, static frontend, and Key Value (Postgres now external via Neon).
  - Frontend API client supports `VITE_API_BASE_URL` for cross-domain production calls while retaining local `/api` proxy fallback.
  - Prisma datasource now uses `DATABASE_URL` + `DIRECT_URL` (`directUrl`) to support Neon pooled runtime connections plus direct migration connections.
  - Deploy notes live in `docs/deploy-render.md`.

## 7) Keep This Memory Fresh

When shipping major changes, update this file with:

1. New routes/pages/components
2. API contract changes
3. Auth/session behavior changes
4. New shared UI patterns
5. Feature flags, known caveats, and migration notes
