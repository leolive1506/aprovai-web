import type { ReportedDemandItem } from "@/api/admin"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDateToNow } from "@/utils/format-date-to-now"
import type { ColumnDef } from "@tanstack/react-table"
import { ArrowRight, FlagIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface ReportsColumnsOptions {
  onViewDetail: (item: ReportedDemandItem) => void
}

export function buildReportsColumns({ onViewDetail }: ReportsColumnsOptions): ColumnDef<ReportedDemandItem>[] {
  return [
    {
      accessorKey: "demand.title",
      header: "Demanda",
      cell: ({ row }) => {
        const item = row.original
        return (
          <div className="flex flex-col gap-0.5 min-w-0 max-w-sm">
            <span className="text-sm font-semibold text-foreground truncate">{item.demand.title}</span>
            {item.demand.reporter && (
              <span className="text-xs text-muted-foreground truncate">{item.demand.reporter.name}</span>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "reportsCount",
      header: "Denúncias",
      size: 120,
      cell: ({ row }) => {
        const count = row.original.reportsCount
        return (
          <div className="flex items-center gap-1.5">
            <FlagIcon className={cn("size-3.5", count >= 5 ? "text-destructive" : "text-muted-foreground")} />
            <Badge
              variant={count >= 5 ? "destructive" : count >= 2 ? "default" : "secondary"}
              className="text-xs font-bold tabular-nums"
            >
              {count}
            </Badge>
          </div>
        )
      },
    },
    {
      accessorKey: "demand.category.name",
      header: "Categoria",
      size: 160,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.demand.category?.name ?? "—"}
        </span>
      ),
    },
    {
      accessorKey: "firstReportedAt",
      header: "Primeira denúncia",
      size: 160,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatDateToNow(row.original.firstReportedAt)}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      size: 80,
      cell: ({ row }) => (
        <div className="flex items-center justify-end">
          <Button
            size="sm"
            variant="ghost"
            className="gap-1.5 text-xs text-primary hover:text-primary"
            onClick={() => onViewDetail(row.original)}
          >
            Ver <ArrowRight className="size-3" />
          </Button>
        </div>
      ),
    },
  ]
}
