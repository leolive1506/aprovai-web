# Gabinete Digital — Frontend Design System

> Fonte única de verdade para padrões visuais, componentes e código do frontend.
> Stack: **React + Vite · Tailwind CSS v4 · shadcn/ui · TanStack Query**

---

## Índice

1. [Princípios](#princípios)
2. [Tokens de Design](#tokens-de-design)
3. [Cores](#cores)
4. [Tipografia](#tipografia)
5. [Espaçamento & Layout](#espaçamento--layout)
6. [Raios de Borda](#raios-de-borda)
7. [Sombras](#sombras)
8. [Componentes](#componentes)
9. [Sistema de Animação](#sistema-de-animação)
10. [Padrões de UI](#padrões-de-ui)
11. [Performance](#performance)
12. [Convenções de Código](#convenções-de-código)

---

## Princípios

### 1 — Clean First
Menos é mais. Cada elemento visual deve justificar sua existência. Dúvida? Remove.

### 2 — Semântico antes de Custom
Use sempre tokens (`text-foreground`, `bg-muted`) antes de valores arbitrários. Garante dark mode e coerência automaticamente.

### 3 — Velocidade Percebida
Feedback imediato para toda interação. Spinners só quando inevitável — prefira skeleton, optimistic UI e transições suaves.

### 4 — Consistência via Composição
Componentes simples compostos formam interfaces complexas. Nunca duplique lógica visual — extraia e reutilize.

---

## Tokens de Design

Todos os tokens vivem em `src/index.css` como CSS custom properties OKLCH e são consumidos via classes do Tailwind.

### Mapa de Tokens Semânticos

| Token CSS | Uso |
|-----------|-----|
| `--background` | Fundo principal da página |
| `--foreground` | Texto principal |
| `--card` | Fundo de cards e superfícies elevadas |
| `--card-foreground` | Texto sobre cards |
| `--primary` | Azul da marca — ações primárias |
| `--primary-foreground` | Texto sobre primário |
| `--secondary` | Superfície secundária neutra |
| `--muted` | Superfície de baixo contraste (fundo de inputs, hover states) |
| `--muted-foreground` | Texto secundário / labels / placeholders |
| `--accent` | Mesmo valor que muted — use para hover de items de menu |
| `--border` | Divisores, bordas de inputs e cards |
| `--input` | Borda específica de campos de formulário |
| `--ring` | Outline de foco (via `outline-ring/50` no base layer) |
| `--destructive` | Vermelho — erros e ações destrutivas |
| `--sidebar` | Fundo do sidebar |
| `--sidebar-foreground` | Texto do sidebar |
| `--radius` | Base radius = `0.3rem` |

---

## Cores

### Paleta Semântica

```
Light Mode
  Background:  #ffffff   (oklch 100%)
  Foreground:  #0f1117   (oklch 14.1%)
  Primary:     Azul  (oklch 58.91% chroma 0.20 hue 257.9)
  Border:      Cinza claro (oklch 92%)
  Muted:       Cinza suave (oklch 96.7%)

Dark Mode
  Background:  #0f1117   (oklch 14.1%)
  Foreground:  #fafafa   (oklch 98.5%)
  Card:        #1a1d27   (oklch 21%)
  Border:      white/10%
```

### Status de Demanda

Todos os status usam o padrão `border-{cor}-200 bg-{cor}-50 text-{cor}-{peso}` para manter consistência em light/dark e garantir contraste adequado. Definidos centralmente em `demand-utils.ts`.

| Status | Border | Background | Text | Dot (Kanban) |
|--------|--------|------------|------|--------------|
| `SUBMITTED` | `border-slate-200` | `bg-slate-50` | `text-slate-600` | `bg-slate-400` |
| `IN_ANALYSIS` | `border-blue-200` | `bg-blue-50` | `text-blue-600` | `bg-blue-500` |
| `IN_PROGRESS` | `border-amber-200` | `bg-amber-50` | `text-amber-700` | `bg-amber-500` |
| `RESOLVED` | `border-emerald-200` | `bg-emerald-50` | `text-emerald-700` | `bg-emerald-500` |
| `REJECTED` | `border-red-200` | `bg-red-50` | `text-red-600` | `bg-red-500` |
| `CANCELED` | `border-zinc-200` | `bg-zinc-50` | `text-zinc-500` | `bg-zinc-400` |

### Prioridade de Demanda

Definidas em `demand-priority.tsx` via CVA.

| Prioridade | Border | Background | Text | Detalhe |
|------------|--------|------------|------|---------|
| `URGENT` | `border-red-200` | `bg-red-50` | `text-red-600` | ícone `ZapIcon` pulsando |
| `HIGH` | `border-orange-200` | `bg-orange-50` | `text-orange-600` | — |
| `MEDIUM` | `border-blue-200` | `bg-blue-50` | `text-blue-600` | — |
| `LOW` | `border-zinc-200` | `bg-zinc-50` | `text-zinc-600` | — |

### Regras de Cor

```
✅ Use tokens semânticos sempre que possível
✅ Use cores de status/prioridade apenas para seu contexto específico
✅ Para textos secundários: text-muted-foreground
✅ Para bordas de separação: border-border ou border-border/60
✅ Para fundos de hover: hover:bg-muted
✅ Para superfícies sutis: bg-muted/20 a bg-muted/50

❌ Não use cores hardcoded (hex, rgb) em className — use index.css se necessário
❌ Não use a cor primária como background de superfícies inteiras
❌ Não misture paleta de status com paleta de prioridade
```

---

## Tipografia

### Fonte

**Geist Variable** — configurada como `--font-sans` e `--font-heading`.
Inter Variable disponível como fallback mas **não usar em novos componentes**.

```css
/* Aplicado globalmente em @layer base */
html { @apply font-sans antialiased; }
```

### Escala de Tamanhos

| Classe | Tamanho | Line Height | Uso |
|--------|---------|-------------|-----|
| `text-2xs` | 10px (0.625rem) | 1rem | Labels de meta, contadores, badges de quantidade |
| `text-xs` | 12px | — | Labels, meta-informação, legendas |
| `text-sm` | 14px | — | **Padrão** para corpo de texto em componentes |
| `text-base` | 16px | — | Títulos de seção (h1 de página) |
| `text-lg` | 18px | — | Raramente usado — títulos de modais grandes |
| `text-xl` | 20px | — | Números de destaque (contadores, métricas) |

> `text-2xs` é uma `@utility` customizada definida em `index.css`. Não use `text-[10px]`.

### Pesos

| Classe | Uso |
|--------|-----|
| `font-normal` | Corpo de texto corrido |
| `font-medium` | Labels com moderada ênfase, valores de campo |
| `font-semibold` | Títulos de card, itens de lista importantes |
| `font-bold` | Contadores/números de destaque, totais |

### Labels de Seção

O padrão para rótulos de seção e cabeçalhos de grupo é:
```
text-2xs font-semibold uppercase tracking-widest text-muted-foreground
```

---

## Espaçamento & Layout

### Escala de Gap em Cards e Componentes

| Contexto | Valor | Classe |
|----------|-------|--------|
| Espaço mínimo entre ícone e texto | 4px | `gap-1` |
| Espaço padrão entre ícone e texto | 6px | `gap-1.5` |
| Espaço entre elementos inline | 8px | `gap-2` |
| Espaço entre campos de formulário | 10px | `gap-2.5` |
| Espaço entre cards em lista | 16px | `gap-4` |
| Espaço entre seções de página | 16–24px | `gap-4` / `gap-6` |

### Padding de Componentes

| Componente | Padding Horizontal | Padding Vertical |
|------------|-------------------|-----------------|
| Card padrão | `px-4` | `py-3.5` |
| Card compacto | `px-3` | `py-2.5` |
| Header de grupo/seção | `px-4` | `py-2.5` |
| Badge / Pill | `px-2` a `px-2.5` | `py-0.5` |
| Kanban card | `p-3` | — |
| Dialog header | `px-5 pt-5 pb-4` | — |
| Dialog body | `px-5 py-4` | — |

### Alturas Fixas de Elementos Interativos

| Elemento | Altura |
|----------|--------|
| Button `size="default"` | `h-8` (32px) |
| Button `size="sm"` | `h-7` (28px) |
| Button `size="xs"` | `h-6` (24px) |
| Button `size="lg"` | `h-9` (36px) |
| Button `size="icon"` | `size-8` (32×32px) |
| Input padrão | `h-8` |
| Badge | `h-5` (20px) |
| Toolbar de filtros | `h-7` a `h-8` |

---

## Raios de Borda

Base: `--radius: 0.3rem`

| Variável | Valor calculado | Classe Tailwind | Uso |
|----------|----------------|-----------------|-----|
| `--radius-sm` | ~0.18rem | `rounded-sm` | Elementos muito pequenos |
| `--radius-md` | ~0.24rem | `rounded-md` | Inputs, tooltips |
| `--radius-lg` | 0.3rem | `rounded-lg` | **Padrão** — botões, badges |
| `--radius-xl` | ~0.42rem | `rounded-xl` | Cards, painéis |
| `--radius-2xl` | ~0.54rem | `rounded-2xl` | Modais, sheets |
| `--radius-3xl` | ~0.66rem | `rounded-3xl` | — |
| `--radius-4xl` | ~0.78rem | `rounded-4xl` | Badges pill (overflow hidden) |
| — | 9999px | `rounded-full` | Avatars, dots, pills |

### Aplicação Prática

```
rounded-lg   → botões, dropdowns, tooltips, inputs
rounded-xl   → cards, colunas kanban, painéis de seção
rounded-2xl  → modais, sheets, popovers
rounded-full → avatars, indicadores de status (dots), priority pills
```

---

## Sombras

| Classe | Uso |
|--------|-----|
| `shadow-sm` | Estado padrão de cards flutuantes e kanban cards |
| `shadow-md` | Hover de cards, dropdowns, tooltips |
| `shadow-lg` | Modais, sheets |
| `shadow-auth-card` | Exclusivo do card de auth (custom em index.css) |
| `shadow-auth-btn` | Exclusivo do botão de auth |

### Regras

```
✅ Cards interativos: shadow-sm padrão, shadow-md no hover
✅ Elementos de overlay (modals, popovers): shadow-lg
✅ Cards de lista plana: sem sombra — use border-border

❌ Não adicione sombra a elementos dentro de cards
❌ Não use sombras customizadas — use index.css se necessário
```

---

## Componentes

### Button

Localização: `src/components/ui/button.tsx`

#### Variantes

| Variante | Uso |
|----------|-----|
| `default` | Ação primária — submit de formulário, confirmação |
| `outline` | Ação secundária — cancelar, ver mais, filtros |
| `secondary` | Ação neutra de menor destaque |
| `ghost` | Ações em contexto (ícones de ação em tabelas, navs) |
| `destructive` | Ações irreversíveis — excluir, rejeitar |
| `link` | Navegação inline em texto |

#### Tamanhos

| Size | Quando usar |
|------|-------------|
| `default` | Ações principais em formulários e dialogs |
| `sm` | Ações secundárias em cards, toolbars, headers de seção |
| `xs` | Ações terciárias em espaços muito comprimidos |
| `lg` | CTAs principais em telas de marketing/auth |
| `icon` / `icon-sm` / `icon-xs` | Botões de ação com apenas ícone |

```tsx
// ✅ Correto
<Button variant="outline" size="sm" className="gap-1.5 h-7">
  <TrendingUp className="size-3.5" />
  Atualizar
</Button>

// ❌ Evitar — tamanho customizado via className quando existe size padrão
<Button className="h-8 px-3 text-xs">...</Button>
```

### Badge

Localização: `src/components/ui/badge.tsx`

| Variante | Uso |
|----------|-----|
| `default` | Tag primária com destaque |
| `secondary` | Tag neutra de categorização |
| `outline` | Status e labels com borda visível — **use para DemandStatusBadge** |
| `destructive` | Erros, alertas de alto impacto |
| `ghost` | Badge sutil sem borda |

> Para status de demanda, use `DemandStatusBadge` — nunca crie badges de status inline.

### DemandStatusBadge

Localização: `src/components/demand-status-badge.tsx`

```tsx
// ✅ Único jeito correto de exibir status
<DemandStatusBadge status={demand.status} />
```

Usa `DEMAND_STATUS_CONFIG` de `demand-utils.ts` — não adicione estilos de status inline em outros componentes.

### DemandPriority

Localização: `src/pages/private/demands/components/demand-priority.tsx`

```tsx
// ✅ Único jeito correto de exibir prioridade
<DemandPriority variant={demand.priority} />
```

URGENT tem ícone `ZapIcon` animado por padrão. Não recrie esse padrão em outros lugares.

### Avatar / UserAvatar

```tsx
// Avatar genérico com src externo
<Avatar className="size-8">
  <AvatarImage src={user.avatarUrl} />
  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
    {getFirstLettersFromNames(user.name)}
  </AvatarFallback>
</Avatar>

// Wrapper para usuário logado (usa getFirstLettersFromNames internamente)
<UserAvatar name={user.name} avatarUrl={user.avatarUrl} size="sm" />
```

Tamanhos de Avatar padronizados:

| Contexto | Classe |
|----------|--------|
| Kanban card, comments inline | `size-5` |
| Listas compactas | `size-7` |
| Header de card, row de tabela | `size-8` |
| Detail sheet, perfil | `size-10` |

### Card (shadcn)

```tsx
<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
    <CardDescription>Descrição</CardDescription>
  </CardHeader>
  <CardContent>...</CardContent>
  <CardFooter>...</CardFooter>
</Card>
```

> Use `size="sm"` para cards mais compactos em dashboards.

Para cards simples sem estrutura complexa, use `div` com as classes:
```
rounded-xl border border-border bg-card overflow-hidden
```

### Dialog

Estrutura padrão:
```tsx
<Dialog open={open} onOpenChange={onOpenChange}>
  <DialogContent className="sm:max-w-md">
    <DialogHeader>
      <DialogTitle className="text-base">Título</DialogTitle>
    </DialogHeader>
    {/* conteúdo */}
    <DialogFooter>
      <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
      <Button onClick={handleSubmit}>Confirmar</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

Larguras padronizadas: `sm:max-w-sm` (pequeno), `sm:max-w-md` (padrão), `sm:max-w-lg` (grande).

### Sheet

Para painéis laterais de detalhe:
```tsx
<Sheet open={open} onOpenChange={onOpenChange}>
  <SheetContent side="right" className="w-full sm:max-w-lg p-0 gap-0 flex flex-col">
    <SheetHeader className="px-5 pt-5 pb-4 border-b shrink-0">
      <SheetTitle>...</SheetTitle>
    </SheetHeader>
    <div className="flex-1 overflow-y-auto">
      <div className="px-5 py-4 flex flex-col gap-5">
        {/* seções */}
      </div>
    </div>
    {/* footer fixo se necessário */}
    <div className="px-5 py-4 border-t shrink-0">...</div>
  </SheetContent>
</Sheet>
```

### Dropdown Menu

```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="icon">
      <MoreHorizontalIcon className="size-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end" className="w-48">
    <DropdownMenuItem onClick={handleAction}>
      <PencilIcon className="size-3.5 text-zinc-400" />
      Editar
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem variant="destructive">
      <Trash2Icon className="size-3.5" />
      Excluir
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

Ícones dentro de DropdownMenuItem: `size-3.5 text-zinc-400`.
Larguras: `w-40` (pequeno), `w-48` (padrão), `w-56` (grande com descrições).

### Separador de Seção (SectionLabel)

Padrão recorrente para rótulos internos de seção:
```tsx
<p className="text-2xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
  Rótulo da Seção
</p>
```

### Loading

```tsx
// Spinner inline mínimo
<Loading />

// Spinner de página inteira
<div className="flex justify-center items-center py-32">
  <Loader2 className="size-6 text-muted-foreground animate-spin" />
</div>

// Skeleton para conteúdo
<Skeleton className="h-4 w-32 rounded" />
```

---

## Sistema de Animação

### Durações

| Uso | Duração | Easing |
|-----|---------|--------|
| Micro-interação (hover, active) | `150ms` | `ease` |
| Transições de estado (cor, opacidade) | `200ms` | `ease` |
| Entrada de elementos pequenos | `300ms` | `ease-out` |
| Entrada de cards / modais | `400–500ms` | `cubic-bezier(0.22, 1, 0.36, 1)` |

A curva `cubic-bezier(0.22, 1, 0.36, 1)` é o easing padrão do sistema — rápida aceleração, saída suave. É a mesma curva usada por Framer Motion `spring` e Linear.

### Keyframes Globais (index.css)

| Animação | Classe | Descrição |
|----------|--------|-----------|
| `feedIn` | `.feed-card` | Cards do feed entram com fadeIn + translateY(10px) |
| `cardEnter` | `.animate-card-enter` | Entrada de card com scale(0.97) + translateY(24px), 500ms |
| `fadeSlideIn` | `.animate-fade-slide-in` | Fade + translateY(12px), 400ms |

### Classes de Animação Tailwind em Uso

| Classe | Uso |
|--------|-----|
| `animate-spin` | Spinners (Loader2) |
| `animate-pulse` | Skeleton loaders, estados de loading em badges |
| `transition-all duration-150` | Micro-interações de hover |
| `transition-colors` | Mudanças de cor isoladas |
| `transition-shadow` | Elevação de cards no hover |
| `transition-opacity` | Fade de elementos |
| `active:scale-95` | Feedback de clique em botões ghost/pills |
| `active:translate-y-px` | Feedback de press em buttons (aplicado pelo Button component) |

### Padrões de Animação por Contexto

#### Entrada de Lista

Quando uma lista de cards é carregada, aplique `animation-delay` incremental:
```tsx
{items.map((item, i) => (
  <div
    key={item.id}
    className="animate-fade-slide-in"
    style={{ animationDelay: `${i * 40}ms` }}
  >
    <Card item={item} />
  </div>
))}
```

#### Hover em Cards Interativos

```
shadow-sm hover:shadow-md hover:border-border transition-all duration-150
```

#### Drag-and-Drop (Kanban)

Card sendo arrastado: `opacity-30 scale-95`
Coluna de destino: `border-primary/30 bg-primary/5 ring-2 ring-primary/15`

#### Estados de Loading em Mutações

```tsx
// Botão com loading
<Button disabled={isPending}>
  {isPending && <Loader2 className="size-4 animate-spin" />}
  Salvar
</Button>

// Badge com loading
className={cn("...", isPending && "opacity-50 animate-pulse")}
```

### Regras de Animação

```
✅ Use transições em mudanças de estado visíveis ao usuário
✅ Prefira CSS transitions sobre keyframes quando possível
✅ Use animation-delay para stagger de listas (40ms por item, máx 10 items)
✅ Sempre use a curva cubic-bezier(0.22, 1, 0.36, 1) para entradas
✅ Indique loading em toda mutação assíncrona

❌ Não anime elementos que não respondem a ação do usuário
❌ Não use animações longas (> 600ms) em interações frequentes
❌ Não adicione transition em border-radius ou transform simultâneos sem testar performance
❌ Não use animate-bounce — não combina com o aesthetic do sistema
```

---

## Padrões de UI

### Empty State

```tsx
<div className="flex flex-col items-center justify-center py-20 text-center gap-3">
  <div className="size-14 rounded-full bg-muted flex items-center justify-center">
    <ClipboardList className="size-6 text-muted-foreground" />
  </div>
  <div>
    <p className="text-sm font-semibold text-foreground">Título do estado vazio</p>
    <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
      Mensagem explicativa sobre quando algo aparecerá aqui.
    </p>
  </div>
</div>
```

### Grupo de Lista com Header

```tsx
<div className="rounded-xl border border-border bg-card overflow-hidden">
  <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-muted/20">
    <span className="size-2 rounded-full bg-blue-500" />
    <Icon className="size-3.5 text-muted-foreground" />
    <span className="text-xs font-semibold text-foreground">Título do Grupo</span>
    <span className="ml-auto inline-flex items-center justify-center size-5 rounded-full bg-muted text-muted-foreground text-2xs font-bold">
      {count}
    </span>
  </div>
  <div className="divide-y divide-border">
    {items.map(item => <Item key={item.id} {...item} />)}
  </div>
</div>
```

### Toggle de View (Lista/Kanban)

```tsx
<div className="flex items-center rounded-lg border border-border bg-muted/40 p-0.5">
  {["list", "kanban"].map((v) => (
    <button
      key={v}
      onClick={() => setView(v)}
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all",
        view === v
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      ...
    </button>
  ))}
</div>
```

### InfoItem (Detalhe de Campo)

```tsx
<div className="flex flex-col gap-1">
  <div className="flex items-center gap-1.5 text-muted-foreground">
    <Icon className="size-3.5" />
    <span className="text-2xs font-semibold uppercase tracking-widest">Label</span>
  </div>
  <span className="text-sm text-foreground">{value}</span>
</div>
```

### Toast / Feedback de Mutação

```tsx
mutate(data, {
  onSuccess: () => toast.success("Operação realizada com sucesso"),
  onError: () => toast.error("Erro ao realizar operação"),
})
```

Nunca use `alert()` ou feedback custom — use sempre `sonner`.

### Confirmação Destrutiva

Ações irreversíveis (excluir, rejeitar) devem sempre ter um Dialog de confirmação ou um `DropdownMenuItem` com `variant="destructive"` visível antes da mutação.

### Formulário Padrão

```tsx
// Schema em src/schemas/
const schema = z.object({ field: z.string().min(1) })
type FormData = z.infer<typeof schema>

// Componente
const form = useForm<FormData>({ resolver: zodResolver(schema) })

// Campos
<InputForm control={form.control} name="field" label="Label" placeholder="..." />
<SelectForm control={form.control} name="status" label="Status" options={options} />
```

---

## Performance

### Caching com TanStack Query

| Query | staleTime recomendado |
|-------|-----------------------|
| Dados de usuário/auth | Infinito (gerenciado pelo auth hook) |
| Dados de gabinete | 5 minutos |
| Membros do gabinete | 5 minutos |
| Demandas (listagem) | 0 (sempre fresco) — invalidado por mutations e WebSocket |
| Notificações | 0 — invalidado por WebSocket |
| Heatmap | 5 minutos |
| Bairros | 10 minutos |

### Query Keys — Convenção

```typescript
["demands"]              // todas as demandas (invalidação ampla)
["demands", params]      // listagem com filtros específicos
["demands", id]          // demanda individual
["demands-infinite", params]  // feed infinito
["comments", params]     // comentários de demanda
["notifications"]        // notificações do usuário
["my-demands", params]   // demandas do cidadão
```

**Regra:** mutations invalidam a chave pai `["demands"]` para garantir consistência em todas as views.

### WebSocket (Real-time)

O `SocketContext` (`src/contexts/socket-context.tsx`) invalida automaticamente:
- `["notifications"]` — em qualquer notificação recebida
- `["demands"]` — quando a notificação tem link `/demands/` ou `/comments/`

Nenhum componente precisa subscrever ao socket diretamente — use a invalidação automática do TanStack Query.

### Hooks Compartilhados (evite requests duplicados)

| Hook | Localização | Substitui |
|------|-------------|-----------|
| `useCurrentMember()` | `src/hooks/use-current-member.ts` | `useGetCabinetMembers` + `useMemo` |
| `useAuth()` | `src/hooks/use-auth.ts` | Acesso direto ao contexto de auth |
| `usePageTitle()` | `src/hooks/use-page-title.ts` | Manipulação direta do document.title |

### Regras de Performance

```
✅ Use placeholderData: (prev) => prev em listagens paginadas
✅ Compartilhe hooks que fazem requests — TanStack Query deduplicará automaticamente
✅ Use select nas queries para transformar dados sem re-renders desnecessários
✅ Prefira invalidateQueries a refetchQueries — deixe o stale-while-revalidate trabalhar
✅ Lazy load páginas via React Router (já configurado em routes/)

❌ Não faça o mesmo request em componentes diferentes — extraia para hook compartilhado
❌ Não use useEffect para derivar estado que pode ser useMemo
❌ Não invalide ["demands"] em queries GET — só em mutations
```

---

## Convenções de Código

### Estrutura de Componente

```tsx
// 1. Imports externos
import { useState } from "react"
import { useNavigate } from "react-router-dom"

// 2. Imports de API
import { useGetDemands } from "@/api/demands/hooks"
import type { Demand } from "@/api/demands/types"

// 3. Imports de componentes
import { Button } from "@/components/ui/button"
import { DemandStatusBadge } from "@/components/demand-status-badge"

// 4. Imports de utils/hooks
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"

// 5. Tipos locais e constantes
interface Props { demand: Demand }
const LIMIT = 50

// 6. Componente
export function MyComponent({ demand }: Props) {
  // hooks primeiro
  const { user } = useAuth()
  const [open, setOpen] = useState(false)

  // early returns
  if (!demand) return null

  // handlers
  function handleClick() { ... }

  // render
  return (...)
}
```

### Nomeclatura

| Tipo | Convenção | Exemplo |
|------|-----------|---------|
| Arquivos | kebab-case | `demand-status-badge.tsx` |
| Componentes | PascalCase | `DemandStatusBadge` |
| Hooks | camelCase com `use` | `useCurrentMember` |
| Constantes | UPPER_SNAKE_CASE | `DEMAND_STATUS_CONFIG` |
| Handlers | `handle` prefix | `handleSubmit`, `handleClose` |
| Props interface | PascalCase + `Props` | `DemandCardProps` |

### Exports

```tsx
// ✅ Sempre named exports
export function MyComponent() {}
export const myConfig = {}

// ❌ Nunca default export
export default function MyComponent() {}
```

### Classes Tailwind — Ordem

Seguir a ordem mental: dimensão → layout → espaço → visual → estado → responsivo.

```tsx
// ✅ Exemplo de ordem legível
className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground hover:bg-muted transition-colors"
```

Use `cn()` para condicionar classes — nunca ternários inline para strings longas:
```tsx
// ✅
className={cn(
  "base-classes",
  isActive && "active-classes",
  isDanger && "danger-classes",
)}

// ❌
className={`base-classes ${isActive ? "active-classes" : ""}`}
```

### Quando Criar um Novo Componente

Extraia um componente quando:
- O mesmo bloco JSX aparece em 2+ lugares
- Um bloco tem mais de ~50 linhas e tem responsabilidade clara
- Um bloco requer seu próprio estado local

Prefira componentes de função pura (sem estado) sempre que possível. Estado deve ficar no nível mais alto necessário — não em folhas da árvore.

### Comentários no Código

**Não escreva comentários.** Nomes de variáveis, funções e componentes devem ser auto-explicativos.

Exceção: lógica não-óbvia com constraint externo ou workaround documentado.

```tsx
// ❌ Comentário desnecessário
// Abre o dialog
function handleClick() { setOpen(true) }

// ✅ Nenhum comentário necessário — nome é suficiente
function handleOpenProgressDialog() { setProgressOpen(true) }
```

---

## Checklist antes de fazer PR

- [ ] Usa tokens semânticos (`text-foreground`, `bg-muted`) — não valores hardcoded
- [ ] Dark mode funciona — testado na classe `.dark`
- [ ] Nenhuma lógica de negócio duplicada do backend no frontend
- [ ] Requests compartilhados via hook (não duplicados entre componentes)
- [ ] Mutations invalidam as query keys corretas
- [ ] Estados de loading e erro cobertos
- [ ] Formulários usam `react-hook-form` + `zod`
- [ ] Nenhum `console.log` ou comentário em código
- [ ] Apenas `named exports`
- [ ] Tailwind classes em ordem lógica com `cn()`
- [ ] Transições adicionadas em elementos interativos visíveis
