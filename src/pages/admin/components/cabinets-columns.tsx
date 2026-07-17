import type { Cabinet } from "@/api/cabinets/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { getFirstLettersFromNames } from "@/utils/get-first-letters-from-names"
import type { ColumnDef } from "@tanstack/react-table"
import { CabinetEditSheet } from "./cabinet-edit-sheet"
import { CabinetPlansSheet } from "./cabinet-plans-sheet"
import { CabinetEnableButton, CabinetDisableButton } from "./cabinet-action-buttons"

function formatPrice(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100)
}

export function createCabinetsColumns(
  subscriptionMap: Map<string, { planName: string; priceInCents: number }>,
): ColumnDef<Cabinet>[] {
  return [
    {
      accessorKey: "name",
      header: "Gabinete",
      cell: ({ row }) => {
        const c = row.original
        return (
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar className="size-7 shrink-0">
              <AvatarImage src={c.avatarUrl ?? undefined} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-2xs">
                {getFirstLettersFromNames(c.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-0.5 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-foreground truncate">{c.name}</span>
                {c.disabledAt && (
                  <Badge variant="secondary" className="text-2xs px-1.5 py-0 shrink-0">Inativo</Badge>
                )}
              </div>
              <span className="text-xs text-muted-foreground truncate">{c.slug}</span>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      size: 220,
      cell: ({ row }) => {
        const value = row.original.email
        if (!value) return <span className="text-xs text-muted-foreground/50">—</span>
        return <span className="text-sm text-muted-foreground">{value}</span>
      },
    },
    {
      id: "plan",
      header: "Plano",
      size: 160,
      cell: ({ row }) => {
        const sub = subscriptionMap.get(row.original.id)
        if (!sub) return <span className="text-xs text-muted-foreground/50">—</span>
        return (
          <div className="flex flex-col gap-0.5">
            <span className="text-sm text-foreground">{sub.planName}</span>
            <span className="text-xs text-muted-foreground font-mono">{formatPrice(sub.priceInCents)}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "score",
      header: "Score",
      size: 90,
      cell: ({ row }) => (
        <span className="font-mono text-sm tabular-nums text-muted-foreground">
          {row.original.score ?? 0}
        </span>
      ),
    },
    {
      accessorKey: "demand_count",
      header: "Demandas",
      size: 110,
      cell: ({ row }) => (
        <span className="font-mono text-sm tabular-nums text-muted-foreground">
          {row.original.demand_count ?? 0}
        </span>
      ),
    },
    {
      accessorKey: "in_progress_count",
      header: "Em Progresso",
      size: 140,
      cell: ({ row }) => (
        <span className="font-mono text-sm tabular-nums text-muted-foreground">
          {row.original.in_progress_count ?? 0}
        </span>
      ),
    },
    {
      accessorKey: "resolved_count",
      header: "Resolvidas",
      size: 120,
      cell: ({ row }) => (
        <span className="font-mono text-sm tabular-nums text-muted-foreground">
          {row.original.resolved_count ?? 0}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Ações",
      size: 180,
      cell: ({ row }) => {
        const c = row.original
        return (
          <div className="flex items-center justify-end gap-1.5">
            {c.disabledAt ? (
              <CabinetEnableButton cabinetId={c.id} />
            ) : (
              <>
                <CabinetDisableButton cabinetId={c.id} />
                <CabinetEditSheet cabinetId={c.id} />
                <CabinetPlansSheet cabinetId={c.id} cabinetName={c.name} />
              </>
            )}
          </div>
        )
      },
    },
  ]
}
