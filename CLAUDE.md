# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

React SPA (Single Page Application) for the Gabinete platform — a civic engagement system where citizens report public demands and political/administrative Cabinets manage and resolve them. Supports authenticated users, guest/anonymous submissions, cabinet staff workflows, and platform-wide admin.

**Stack:** React 19, TypeScript, Vite, React Router v7, TanStack React Query, React Hook Form + Zod, Tailwind CSS, Base UI, Recharts, React Leaflet, Socket.io client

## Commands

```bash
pnpm dev        # Start dev server (Vite)
pnpm build      # Build for production
pnpm lint       # ESLint
pnpm preview    # Preview production build
```

Use `pnpm` as the package manager (not npm). The `@` alias resolves to `/src`.

## Coding Standards

**Components:**
- Always use `function` declarations, not arrow functions
- Named exports only (no default exports)
- File names: `kebab-case.tsx`; component names: `PascalCase`
- Styling: `className` prop + `cn()` utility — never inline styles
- For rare custom CSS, add to `index.css` and reference the class
- Support dark/light mode using Tailwind theme variables (`text-foreground`, `bg-background`, etc.)
- Never recreate UI primitives that already exist in `src/components/ui`; install missing shadcn components via the shadcn CLI

**Component layers:**
- `src/components/ui` — stateless/shadcn components (display + events only)
- `src/components/form` — wrappers that connect UI components to React Hook Form via `Controller` or `useFormContext`
- `src/components/layout` — layout wrappers

**Forms & validation:**
- Always validate with Zod schemas defined in `src/schemas/`
- Export the inferred TypeScript type from each schema
- Keep components declarative; move complex logic into domain hooks (`src/api/[domain]/hooks.ts`) or global hooks (`src/hooks/`)

**API module structure** (`src/api/[domain]/`):
- `index.ts` — domain object with Axios calls (e.g., `export const AuthApi = { login, ... }`)
- `types.ts` — TypeScript interfaces for the domain
- `hooks.ts` — TanStack Query hooks (useQuery / useMutation)

**Feedback & UX:**
- Use `toast` (sonner) for mutation feedback
- Use generic dialogs for complex interactions
- Use early returns to keep code flat and readable
- **Confirmation dialogs are mandatory for any irreversible or high-impact action** — this includes deleting any record, deactivating/activating entities, and any mutation that is hard or impossible to undo. Never fire these mutations directly from a button click. Always show a `Dialog` with a clear description of the consequence and a destructive confirm button first.

**General:**
- Do not introduce new libraries without explicit instruction
- When unsure, check existing files to maintain consistency

## Architecture

**File structure:**
```
src/
  api/           # Axios API modules — one folder per backend module
  components/    # Shared/reusable UI components
  contexts/      # React contexts (auth, socket, theme, page title)
  hooks/         # Custom hooks
  lib/           # Utilities and helpers
  pages/         # Page components mapped 1:1 to routes
  routes/        # Route definitions and guards
  schemas/       # Zod validation schemas
  types/         # TypeScript interfaces and enums
```

**Data fetching:** TanStack React Query for all server state; no Redux. API calls live in `src/api/` and are consumed via React Query hooks in pages/components.

**Forms:** React Hook Form + Zod schemas in `src/schemas/`.

**Routing:** React Router v7 with nested layouts. Route guards: `ProtectedRoute` (requires auth), `PrivateRoute` (requires cabinet member role), `PublicRoute` (blocks authenticated users).

## Pages & Routes

### Public (no auth required)
| Path | Page | Description |
|------|------|-------------|
| `/` or `/landing` | Landing | Hero, features, testimonials |
| `/login` | Login | Email/password login |
| `/sign-up` | SignUp | User registration |
| `/forgot-password` | ForgotPassword | Send reset email |
| `/reset-password` | ResetPassword | Complete password reset |
| `/verify-email` | VerifyEmail | Email verification |
| `/auth/callback` | AuthCallback | Google OAuth callback |
| `/confirm-password` | ConfirmPassword | Password change confirmation |
| `/termos-de-uso` | TermsOfUse | Static terms page |
| `/politica-de-privacidade` | PrivacyPolicy | Static privacy page |
| `/pesquisa/:token` | Survey | Post-resolution demand survey |
| `/cabinets/invites/:token` | AcceptInvitation | Accept cabinet member invitation |
| `/cabinet/:slug` | PublicCabinet | Public cabinet profile + anonymous demand reporting |

### Authenticated (CITIZEN, MEMBER, ADMIN)
| Path | Page | Description |
|------|------|-------------|
| `/feed` | Feed | Main feed of all demands with filters |
| `/map` | Map | Geographic map + heatmap of demands |
| `/demand-comments/:id` | DemandComments | Demand detail with comment thread |
| `/my-demands` | MyDemands | Citizen's own demands with statistics |
| `/my-neighborhood` | MyNeighborhood | Neighborhood dashboard — demands, categories, cabinets (CITIZEN only) |
| `/cabinets` | Cabinets | Browse all cabinets |
| `/profile` | Profile | User profile management |
| `/settings` | Settings | Cabinet branding, personal info, security |

### Cabinet Staff (MEMBER role — `/private/*`)
| Path | Page | Description |
|------|------|-------------|
| `/private/home` | Dashboard | Cabinet dashboard with metrics and analytics |
| `/private/demands` | Demands | Demand management table with advanced filtering |
| `/private/my-tasks` | MyTasks | Demands assigned to the current staff member |
| `/private/team` | Team | Team member management (invite, remove, change role) |
| `/private/reports` | Reports | Analytics reports, trend charts, category breakdown |

### Admin (`/admin/*`)
| Path | Page | Description |
|------|------|-------------|
| `/admin` | AdminDashboard | Platform-wide admin dashboard |
| `/admin/denuncias` | AdminReports | Review and moderate reported demands |
| `/admin/users` | AdminUsers | User management (enable/disable) |
| `/admin/reports` | AdminAnalytics | Platform-wide analytics |

## Key Components

**Feature components** (in `src/components/`):
- `DemandDetailSheet` — Slide-over panel showing full demand details
- `CreateResultDialog` — Modal for creating a resolution result; `type` is always `OTHER` internally (removed from UI)
- `UpdateProgressDialog` — Modal for updating demand status; requires ≥1 result before RESOLVED; `onNeedsResults` callback opens `CreateResultDialog`
- `NeighborhoodOnboardingModal` — Auto-shows for authenticated citizens with 0 saved neighborhoods; dismissible per session via `sessionStorage`
- `DemandStaleBadge` — Badge showing days without update (amber ≥15 days, red ≥30 days); hidden for terminal statuses
- `ClaimDemandFlow` — Multi-step flow for cabinet staff to claim an open demand
- `InviteMemberDialog` — Invite team member by email
- `ReportDemandDialog` — Citizen reporting/flagging a demand
- `AuthRequiredModal` — Prompts unauthenticated users to log in before acting
- `Gallery` — Image gallery for evidence files and result images
- `Post` — Demand card rendered in the feed
- `UserDropdown` — User menu with logout and profile navigation
- `DemandStatusBadge` — Status chip with color coding
- `TeamSwitcher` — Switch between cabinets in cabinet staff context

**UI primitives** (in `src/components/ui/`):
- `NeighborhoodSearchInput` — Google Places autocomplete filtered to `neighborhood/sublocality` types; accepts optional `locationBias` (GPS coords)
- `CitySelect` — City combobox fetched from IBGE API (`/localidades/estados/:uf/municipios`); disabled until state is selected; clears city on state change

**Layouts:**
- `Layout` — Main authenticated layout with sidebar navigation
- `SplashScreen` — Loading screen on app initialization

## Contexts & State

- `AuthContext` (`contexts/auth-context/`) — authenticated user, selected cabinet, login/logout, token storage in localStorage, auto-init on mount
- `SocketContext` (`contexts/socket-context.tsx`) — Socket.io connection for real-time demand/notification updates
- `PageTitleContext` (`contexts/page-title-context.tsx`) — Dynamic `<title>` management
- `ThemeProvider` (`contexts/theme-provider.tsx`) — Dark/light mode via next-themes

## Custom Hooks

- `useAuth()` — Current user profile and auth actions
- `useCurrentMember()` — Current user's role within the active cabinet (OWNER/STAFF)
- `useDebounce()` — Debounced value for search inputs
- `useMobile()` — Boolean for responsive breakpoint detection
- `usePageTitle()` — Set the current page title
- `useDataTable()` — Sorting, pagination, and filter state for data tables

## API Integration

**Client** (`src/api/index.ts`): Axios instance with:
- Bearer token injected from localStorage on every request
- Automatic access token refresh (60-second expiry buffer) with failed-request queue
- Custom `ApiError` class for typed error handling

**API modules** (one folder per backend domain):
- `auth/` — register, login, refresh, verify-email, forgot/reset/change password, Google OAuth
- `demands/` — CRUD, claim, assign, comments, likes, report, evidence upload (presigned), progress update, surveys, analytics
- `cabinets/` — CRUD, member management, invitations
- `users/` — profile, avatar upload
- `neighborhood/` — user neighborhood CRUD (`list`, `add`, `remove`, `setPrimary`) + `getDashboard` for the neighborhood feed
- `categories/` — list and manage demand categories
- `results/` — CRUD, image and protocol upload
- `notifications/` — list, mark read
- `admin/` — admin-only operations

## Validation Schemas (`src/schemas/`)

- `login` — email + password
- `register` — full registration form
- `forgot-password` — email only
- `reset-password` — new password + confirmation
- `cabinet-wizard` — multi-step cabinet creation
- `demand` — demand create/edit
- `admin-user` — admin user creation

## Types & Enums (`src/types/`)

**Enums:**
- `UserRole`: `ADMIN | MEMBER | CITIZEN`
- `CabinetRole`: `OWNER | STAFF`
- `DemandStatus`: `SUBMITTED | IN_ANALYSIS | IN_PROGRESS | RESOLVED | REJECTED | CANCELED`
- `DemandPriority`: `LOW | MEDIUM | HIGH | URGENT`
- `ResultType`: `INFRASTRUCTURE | SOCIAL | LEGISLATIVE | OTHER`
- `NotificationType`: `INFO | SUCCESS | WARNING | ERROR`

**Key interfaces:**
- `Demand` — title, description, status, priority, location (lat/long, address, city, state), reporterId or guestEmail, cabinetId, categoryId, evidence list, likes, comments
- `Cabinet` — name, slug, email, branding (avatar, banner, logo, primaryColor, secondaryColor), social links, score, stats
- `User` — id, name, email, role, avatar, location fields
- `Evidence` — storageKey, url, mimeType, size
- `DemandComment` — comment body, author, isCabinetResponse flag
- `CabinetDashboardSummary` — total/open/resolved demand counts, resolution rate, response time
- `CabinetReport` — full analytics report with trend data, category breakdown, heatmap points
- `MyDemandsSummary` — citizen statistics: total submitted, resolved, in-progress

## Key Domain Rules

**Guest Flow:** The public cabinet page (`/cabinet/:slug`) allows demand submission without login. The form captures `guestEmail`. If the guest later registers with the same email, the API links their past demands.

**File Uploads:** Evidence and result images go directly to S3 via presigned URLs. The API returns a presigned URL; the client PUTs the file directly to S3, then calls the confirm endpoint.

**Real-time:** Socket.io connection is established after login. Listens for demand status changes and new notifications.

**Dark Mode:** Managed by `ThemeProvider`. Components use Tailwind `dark:` variants. Toggle via `ThemeToggle` component.

**Neighborhood flow:** `/my-neighborhood` is citizen-only (`ProtectedRoute allowedRoles={[CITIZEN]}`). `NeighborhoodOnboardingModal` in `Layout` auto-opens for authenticated citizens without any saved neighborhood. Manual input requires selecting state first, then city via `CitySelect` (IBGE API). Neighborhood name always comes from Google Places autocomplete (`NeighborhoodSearchInput`) — never free text. City mismatch between selected neighborhood and registered city shows an inline conflict card and blocks saving.

**Result → demand status:** Deleting the last result of a RESOLVED demand automatically reverts it to IN_PROGRESS (handled server-side via EventEmitter; no client-side action needed).

**Password validation:** Registration requires min 8 characters (schema `src/validation-schemas/register.ts`). Do not lower this — backend DTO enforces the same minimum.

**Cabinet Context:** Cabinet staff pages (`/private/*`) require the user to have an active cabinet selected in `AuthContext`. `useCurrentMember()` returns the user's role in that cabinet.
