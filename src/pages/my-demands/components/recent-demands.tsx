import type { Demand } from "@/api/demands/types"
import { DemandStatusBadge } from "@/components/demand-status-badge"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { MapPin } from "lucide-react"
import { Link } from "react-router-dom"

interface RecentDemandsProps {
  demands: Demand[]
}

export function RecentDemands({ demands }: RecentDemandsProps) {
  if (demands.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
        <div className="size-12 rounded-full bg-muted flex items-center justify-center">
          <MapPin className="size-5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Nenhuma demanda registrada</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
            Suas demandas aparecerão aqui assim que você registrar alguma no feed.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col divide-y divide-border">
      {demands.map((demand, i) => (
        <Link
          key={demand.id}
          to={`/demand/${demand.id}`}
          className="flex items-start gap-3 px-4 py-3.5 hover:bg-muted/40 transition-colors animate-fade-slide-in"
          style={{ animationDelay: `${i * 40}ms` }}
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate leading-snug">
              {demand.title}
            </p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-2xs text-muted-foreground font-medium uppercase tracking-wider">
                {demand.category.name}
              </span>
              {demand.neighborhood && (
                <>
                  <span className="size-0.5 rounded-full bg-border" />
                  <span className="text-2xs text-muted-foreground flex items-center gap-0.5">
                    <MapPin className="size-2.5 shrink-0" />
                    {demand.neighborhood}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <DemandStatusBadge status={demand.status} />
            <span className="text-2xs text-muted-foreground tabular-nums">
              {formatDistanceToNow(new Date(demand.createdAt), { addSuffix: true, locale: ptBR })}
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
}
