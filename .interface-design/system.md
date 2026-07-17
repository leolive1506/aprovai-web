# Interface Design System

## Direction & Feel

Civic accountability tool for Brazilian political cabinets. Institutional precision — not a startup app, not a social feed. Think court dockets, official protocols, public records. Serious, legible, trustworthy.

The signature: zero-padded monospace rank numbers (`01`, `02`, `03`) without any container — pure typographic weight, like document protocol numbering.

## Depth Strategy

**Borders-only.** No `shadow-sm`, no `hover:shadow-md`. Zero shadows on interactive cards.

Hover states use `hover:bg-muted/40` — background shift only.

## Border Radius

- Content cards: `rounded-lg`
- Small elements (badges, inputs): `rounded-md`
- Never `rounded-xl` or `rounded-2xl` on cards or list containers
- `rounded-full` only for avatars

## Surfaces

Single hue — only lightness shifts. No different hues between sidebar and content.
- Page: `bg-background`
- Cards: `bg-card` (same hue, slightly elevated)
- Inputs: slightly darker than surroundings (inset feel)
- List containers: single `border border-border rounded-lg` wrapper, internal `divide-y divide-border/60`

## Typography Hierarchy

- Page title: `text-lg font-semibold`
- Section label: `text-sm font-medium` or `text-sm font-semibold`
- Body: `text-sm` normal weight
- Secondary: `text-sm text-muted-foreground`
- Metadata / stats: `text-xs text-muted-foreground`
- Monospace data (ranks, counts): `font-mono tabular-nums`

No `uppercase tracking-widest` labels — that's the main AI tell.

## Spacing Base

4px unit. Consistent Tailwind scale — no arbitrary values.

## Component Patterns

### List container
```tsx
<div className="rounded-lg border border-border overflow-hidden divide-y divide-border/60">
  {items.map(item => <ListItem key={item.id} {...item} />)}
</div>
```

### Priority indicator
Left border, 2px: `border-l-2 border-l-red-500` (URGENT), `border-l-orange-400` (HIGH), `border-l-sky-400` (MEDIUM), `border-l-border` (LOW)

### Cabinet rank signature
```tsx
<span className="font-mono text-xs tabular-nums text-muted-foreground/40">
  {String(rank).padStart(2, "0")}
</span>
```
Rank 1 gets `border-l-2 border-l-primary` on the row — only visual differentiation.

### Action bar (Post/Card bottom)
```tsx
<div className="flex border-t border-border/40">
  <Button variant="ghost" className="flex-1 rounded-none h-9 text-xs ...">...</Button>
  <div className="w-px bg-border/60 self-stretch" />
  <Button variant="ghost" className="flex-1 rounded-none h-9 text-xs ...">...</Button>
</div>
```
No grid. Vertical dividers between buttons.

### Stats inline
Text-only, no icon containers:
```tsx
<span className="text-xs text-muted-foreground">
  {likeCount > 0 && <>{likeCount} apoios · </>}
  {commentsCount} comentários
</span>
```

### Empty state
```tsx
<div className="size-10 rounded-lg bg-muted flex items-center justify-center">
  <Icon className="size-4 text-muted-foreground" />
</div>
```
`rounded-lg` not `rounded-full`.

### KPI Card
`rounded-lg border border-border bg-card` — no shadows, no hover shadow.
Left stripe `w-0.75` absolute for semantic color.

## Navigation

CitizenHeader: `bg-background border-b border-border` — no shadow, theme-aware.
Nav active state: `bg-muted text-foreground` — neutral, not primary-colored.
Sidebar: same background as content, border separation only.
