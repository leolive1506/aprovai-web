import { Link } from "react-router-dom"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getFirstLettersFromNames } from "@/utils/get-first-letters-from-names"
import type { NeighborhoodCabinet } from "@/api/neighborhood/types"
import { cn } from "@/lib/utils"

interface NeighborhoodCabinetsProps {
  cabinets: NeighborhoodCabinet[]
}

export function NeighborhoodCabinets({ cabinets }: NeighborhoodCabinetsProps) {
  if (cabinets.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        Nenhum gabinete ativo neste bairro ainda.
      </p>
    )
  }

  return (
    <div className="flex flex-col divide-y divide-border/40">
      {cabinets.map((cabinet, i) => (
        <Link
          key={cabinet.id}
          to={`/${cabinet.slug}`}
          className="group flex items-center gap-3 py-3 hover:bg-muted/30 -mx-1 px-1 rounded-lg transition-colors"
        >
          <Avatar className="size-9 shrink-0">
            <AvatarImage src={cabinet.avatarUrl ?? undefined} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
              {getFirstLettersFromNames(cabinet.name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{cabinet.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <CheckCircle2 className="size-3 text-emerald-500 shrink-0" />
              <span className="text-xs text-muted-foreground">
                {cabinet.resolvedCount} resolv. de {cabinet.totalCount}
              </span>
            </div>
          </div>

          {i === 0 && (
            <span className="text-2xs font-semibold uppercase tracking-wider text-amber-600 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-full shrink-0">
              Mais ativo
            </span>
          )}

          <ArrowRight
            className={cn(
              "size-3.5 shrink-0 transition-colors",
              "text-muted-foreground/30 group-hover:text-muted-foreground",
            )}
          />
        </Link>
      ))}
    </div>
  )
}
