import { Link } from "react-router-dom"
import { ArrowRight, ClipboardList } from "lucide-react"
import { DemandStatusBadge } from "@/components/demand-status-badge"
import { formatDateToNow } from "@/utils/format-date-to-now"
import { cn } from "@/lib/utils"
import type { Demand } from "@/api/demands/types"

interface NeighborhoodDemandsProps {
  demands: Demand[]
}

export function NeighborhoodDemands({ demands }: NeighborhoodDemandsProps) {
  if (demands.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center gap-2.5">
        <div className="size-10 rounded-full bg-muted flex items-center justify-center">
          <ClipboardList className="size-4 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">Nenhuma demanda ainda</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Seja o primeiro a registrar um problema no seu bairro.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col divide-y divide-border/40">
      {demands.map((demand) => (
        <Link
          key={demand.id}
          to={`/demand/${demand.id}`}
          className={cn(
            "group flex items-center gap-3 py-3.5",
            "hover:bg-muted/30 -mx-1 px-1 rounded-lg transition-colors",
          )}
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground line-clamp-1 leading-snug">
              {demand.title}
            </p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <DemandStatusBadge status={demand.status} />
              {demand.category && (
                <span className="text-xs text-muted-foreground">{demand.category.name}</span>
              )}
              <span className="text-xs text-muted-foreground">
                {formatDateToNow(demand.createdAt)}
              </span>
            </div>
          </div>
          <ArrowRight className="size-3.5 shrink-0 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
        </Link>
      ))}
    </div>
  )
}
