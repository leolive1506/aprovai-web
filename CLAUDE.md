# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

React SPA for **AprovIA** — an approval management platform. Users log in (or via Google OAuth), manage demands/approvals, teams, and reports. Includes a platform-wide admin area.

> User-facing text must always say **"AprovIA"** (never "Aprovai" / "AprovAI").

**Stack:** React 19, TypeScript, Vite, React Router v7, TanStack React Query, React Hook Form + Zod, Tailwind CSS v4, shadcn/ui, Recharts, Socket.io client

## Commands

```bash
pnpm dev        # Start dev server (Vite)
pnpm build      # Build for production
pnpm lint       # ESLint
pnpm preview    # Preview production build
```

Use `pnpm` (not npm). The `@` alias resolves to `/src`.

## Architecture

```
src/
  api/           # Axios API modules — one folder per backend domain
  assets/        # Static assets (logo: aprovai.svg)
  components/    # Shared/reusable components
    ui/          # stateless/shadcn primitives (display + events only)
    form/        # wrappers connecting UI to React Hook Form (Controller/useFormContext)
    layout/      # layout wrappers (sidebar Layout, SplashScreen)
  contexts/      # React contexts (auth, socket, theme, page title)
  hooks/         # Custom hooks (useAuth, useDebounce, useMobile, usePageTitle...)
  lib/           # Utilities (cn, helpers)
  pages/         # Page components mapped 1:1 to routes
  routes/        # Route definitions and guards (app-router.tsx)
  validation-schemas/  # Zod schemas
  types/         # TypeScript interfaces and enums
```

**Routes** (see `src/routes/app-router.tsx` — single source of truth):
- Public: `/login`, `/sign-up`, `/forgot-password`, `/reset-password`, `/verify-email`, `/auth/callback`, `/confirm-password`, `/invites/:token`, `/termos-de-uso`, `/politica-de-privacidade`
- Authenticated (inside `Layout`): `/settings`, `/profile/:userId`
- MEMBER: `/home`, `/demands`, `/minhas-tarefas`, `/equipe`, `/relatorios`
- ADMIN: `/admin`, `/admin/users`, `/admin/plans`

**Data fetching:** TanStack React Query for all server state; no Redux. Axios calls live in `src/api/[domain]/index.ts` (domain object, e.g. `AuthApi`), types in `types.ts`, React Query hooks in `hooks.ts`.

**API client** (`src/api/index.ts`): Bearer token from localStorage, automatic refresh (60s expiry buffer) with failed-request queue, typed `ApiError`.

**Auth:** `AuthContext` — user, login/logout, token in localStorage, auto-init on mount. Route guard: `ProtectedRoute allowedRoles={[...]}`. `UserRole`: `ADMIN | MEMBER | CITIZEN`.

**Real-time:** `SocketContext` connects after login and invalidates React Query keys on events — components never subscribe to the socket directly.

## Coding Standards

**Components:**
- `function` declarations, never arrow functions for components
- Named exports only — no default exports
- Files: `kebab-case.tsx`; components: `PascalCase`; hooks: `useCamelCase`; constants: `UPPER_SNAKE_CASE`; handlers: `handle*`
- Extract a component when the same JSX appears in 2+ places, or a block passes ~50 lines with clear responsibility
- Never recreate primitives that exist in `src/components/ui`; install missing shadcn components via the shadcn CLI
- No code comments (exception: non-obvious external constraints/workarounds). No `console.log`.

**Styling:**
- Tailwind only, via `className` + `cn()` — never inline styles and **never add custom classes to `index.css`** (the only CSS that lives there are theme tokens, fonts and keyframes that Tailwind can't express)
- Use semantic tokens (`text-foreground`, `bg-card`, `border-border`) so dark mode works automatically; never hardcode hex/rgb in `className`
- Class order: dimension → layout → space → visual → state → responsive
- Conditional classes via `cn(base, cond && "...")` — no template-string ternaries

**Forms & validation:**
- React Hook Form + Zod schemas in `src/validation-schemas/`; export the inferred type from each schema
- Registration password minimum is 8 chars (`register.ts`) — do not lower; the backend DTO enforces the same
- Keep components declarative; complex logic goes to domain hooks (`src/api/[domain]/hooks.ts`) or `src/hooks/`

**Feedback & UX:**
- `toast` (sonner) for mutation feedback — never `alert()`
- Loading state on every async mutation (`Loader2` spinner in button, `disabled` while pending)
- **Confirmation dialogs are mandatory for irreversible/high-impact actions** (delete, deactivate, etc.). Never fire these from a raw button click — always a `Dialog` describing the consequence with a destructive confirm button
- Early returns to keep code flat

**General:**
- Do not introduce new libraries without explicit instruction
- When unsure, check existing files to maintain consistency

## Design System

### Brand Palette

Extracted from the logo (`src/assets/aprovai.svg`) and exposed as Tailwind tokens in `index.css` (`@theme inline`). Always use the preset — never the raw hex:

| Token | Value | Tailwind usage | Role |
|-------|-------|----------------|------|
| `brand` | `#7409F4` | `bg-brand`, `text-brand`, `from-brand` | Logo purple (static, same in dark mode) |
| `brand-deep` | `oklch(0.5 0.235 292)` | `to-brand-deep` | Darker purple — gradient end |
| `success` | `#08DA81` | `text-success`, `bg-success/10` | Logo green — positive states |
| `ink` | `#191C1E` | `text-ink` | Logo near-black |
| `primary` | purple (theme-aware) | `bg-primary`, `text-primary` | Brand purple that adapts to dark mode — default for actions |

Prefer `primary` for interactive elements (it lightens in dark mode); use `brand`/`brand-deep` for fixed brand moments like gradients.

**Primary button gradient** (login/sign-up pattern):
```
bg-linear-to-b from-primary to-brand-deep text-white hover:brightness-110 cursor-pointer
```

### Semantic Tokens

CSS custom properties in `index.css`, consumed via Tailwind classes:

| Token | Use |
|-------|-----|
| `background` / `foreground` | Page background / main text |
| `card` / `card-foreground` | Elevated surfaces |
| `primary` / `primary-foreground` | Primary actions |
| `muted` / `muted-foreground` | Low-contrast surface / secondary text, labels, placeholders |
| `accent` | Menu item hover (same value as muted) |
| `border` / `input` | Dividers and field borders |
| `ring` | Focus outline |
| `destructive` | Errors and destructive actions |
| `sidebar*` | Sidebar surface/text |

### Typography

Font: **Geist Variable** (`font-sans`, applied globally). `font-brand` (Montserrat) only for logo/brand contexts.

| Class | Use |
|-------|-----|
| `text-2xs` | Meta labels, counters (custom `@utility` — don't use `text-[10px]`) |
| `text-xs` | Labels, meta, captions |
| `text-sm` | **Default** body text in components |
| `text-base` | Page section titles |
| `text-xl` | Highlighted numbers/metrics |

Weights: `font-medium` (labels/values), `font-semibold` (card titles), `font-bold` (highlight numbers).

Section label pattern: `text-2xs font-semibold uppercase tracking-widest text-muted-foreground`

### Radius & Shadows

Base `--radius: 0.3rem`. Practical mapping: `rounded-lg` buttons/inputs/dropdowns · `rounded-xl` cards/panels · `rounded-2xl` modals/sheets · `rounded-full` avatars/dots/pills. (Auth screens use `rounded-xl` on inputs/buttons at `h-11`.)

Shadows: `shadow-xs`/`shadow-sm` resting cards, `shadow-md` hover/dropdowns, `shadow-lg` modals. Flat list cards: no shadow, `border-border`. No custom shadows.

### Animation

- Micro-interactions 150ms, state transitions 200ms, element entry 300–500ms with `cubic-bezier(0.22, 1, 0.36, 1)`
- List stagger: `animationDelay: i * 40ms` (max ~10 items)
- Interactive cards: `shadow-sm hover:shadow-md transition-all duration-150`
- Never `animate-bounce`; no animations > 600ms on frequent interactions

### UI Patterns

- **Empty state:** centered icon in `size-14 rounded-full bg-muted` circle + title `text-sm font-semibold` + hint `text-xs text-muted-foreground`
- **Dialog widths:** `sm:max-w-sm` / `sm:max-w-md` (default) / `sm:max-w-lg`
- **Dropdown item icons:** `size-3.5 text-zinc-400`; destructive items use `variant="destructive"`
- **Buttons:** use the `Button` component variants/sizes — don't rebuild sizes via className when a `size` exists

## Performance Rules

- Query keys: `["domain"]` broad → `["domain", params]` filtered → `["domain", id]` single. Mutations invalidate the parent key.
- `placeholderData: (prev) => prev` on paginated lists; prefer `invalidateQueries` over `refetchQueries`
- Never duplicate the same request across components — extract a shared hook (React Query dedupes)
- No `useEffect` for derived state — use `useMemo`
- Pages are lazy-loaded via React Router (see `app-router.tsx`)

## Pre-PR Checklist

- [ ] Semantic tokens used — no hardcoded colors, nothing added to index.css
- [ ] Dark mode works (`.dark`)
- [ ] Forms use react-hook-form + zod
- [ ] Mutations invalidate correct query keys; loading/error states covered
- [ ] Named exports only; no comments/console.log
- [ ] User-facing text says "AprovIA"
