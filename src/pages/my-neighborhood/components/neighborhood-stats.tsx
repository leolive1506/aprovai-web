import { cn } from "@/lib/utils"
import type { NeighborhoodStats } from "@/api/neighborhood/types"
import { CheckCircle2, Clock, MapPin, TrendingUp } from "lucide-react"

interface NeighborhoodStatsProps {
  stats: NeighborhoodStats
}

interface StatCardProps {
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  label: string
  value: string | number
  sub?: string
}

function StatCard({ icon, iconBg, iconColor, label, value, sub }: StatCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:p-5">
      <div className={cn("size-9 rounded-xl flex items-center justify-center shrink-0", iconBg)}>
        <span className={iconColor}>{icon}</span>
      </div>
      <div className="flex flex-col gap-0.5">
        <p className="text-2xl font-bold tabular-nums text-foreground leading-none tracking-tight">
          {value}
        </p>
        <p className="text-xs text-muted-foreground leading-snug">{label}</p>
        {sub && <p className="text-2xs text-muted-foreground/60">{sub}</p>}
      </div>
    </div>
  )
}

export function NeighborhoodStatsGrid({ stats }: NeighborhoodStatsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <StatCard
        icon={<MapPin className="size-4.5" />}
        iconBg="bg-primary/10"
        iconColor="text-primary"
        label="Total de demandas"
        value={stats.total}
      />
      <StatCard
        icon={<Clock className="size-4.5" />}
        iconBg="bg-amber-50 dark:bg-amber-950/30"
        iconColor="text-amber-500"
        label="Aguardando atenção"
        value={stats.active}
      />
      <StatCard
        icon={<CheckCircle2 className="size-4.5" />}
        iconBg="bg-emerald-50 dark:bg-emerald-950/30"
        iconColor="text-emerald-600 dark:text-emerald-400"
        label="Resolvidas"
        value={stats.resolved}
      />
      <StatCard
        icon={<TrendingUp className="size-4.5" />}
        iconBg={
          stats.resolutionRate >= 70
            ? "bg-emerald-50 dark:bg-emerald-950/30"
            : "bg-muted/50"
        }
        iconColor={
          stats.resolutionRate >= 70
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-muted-foreground"
        }
        label="Taxa de resolução"
        value={`${stats.resolutionRate}%`}
      />
    </div>
  )
}
