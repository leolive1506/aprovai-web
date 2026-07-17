import type { ReporterStatusBreakdown } from "@/api/demands/types"
import { DemandStatus } from "@/api/demands/types"
import { cn } from "@/lib/utils"

const STATUS_CONFIG: Record<string, { label: string; bar: string; dot: string }> = {
  [DemandStatus.SUBMITTED]:   { label: "Enviada",      bar: "bg-slate-300 dark:bg-slate-600",   dot: "bg-slate-400" },
  [DemandStatus.IN_ANALYSIS]: { label: "Em análise",   bar: "bg-blue-400 dark:bg-blue-500",     dot: "bg-blue-500" },
  [DemandStatus.IN_PROGRESS]: { label: "Em progresso", bar: "bg-amber-400 dark:bg-amber-500",   dot: "bg-amber-500" },
  [DemandStatus.RESOLVED]:    { label: "Resolvida",    bar: "bg-emerald-400 dark:bg-emerald-500", dot: "bg-emerald-500" },
  [DemandStatus.REJECTED]:    { label: "Rejeitada",    bar: "bg-red-400 dark:bg-red-500",       dot: "bg-red-500" },
  [DemandStatus.CANCELED]:    { label: "Cancelada",    bar: "bg-zinc-300 dark:bg-zinc-500",     dot: "bg-zinc-400" },
}

interface StatusBreakdownProps {
  data: ReporterStatusBreakdown[]
}

export function StatusBreakdown({ data }: StatusBreakdownProps) {
  const withCounts = data.filter((d) => d.count > 0)
  const total = data.reduce((s, d) => s + d.count, 0)

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-16">
        <p className="text-xs text-muted-foreground">Nenhuma demanda ainda</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex h-3 w-full rounded-full overflow-hidden gap-px">
        {withCounts.map((item) => {
          const cfg = STATUS_CONFIG[item.status]
          return (
            <div
              key={item.status}
              className={cn("h-full transition-all duration-500", cfg.bar)}
              style={{ width: `${item.percentage}%` }}
              title={`${cfg.label}: ${item.count}`}
            />
          )
        })}
      </div>

      <div className="flex flex-wrap gap-x-3 gap-y-1.5">
        {withCounts.map((item) => {
          const cfg = STATUS_CONFIG[item.status]
          return (
            <div key={item.status} className="flex items-center gap-1.5">
              <span className={cn("size-1.5 rounded-full shrink-0", cfg.dot)} />
              <span className="text-xs text-muted-foreground">
                {cfg.label}
                <span className="ml-1 font-semibold text-foreground tabular-nums">{item.count}</span>
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
