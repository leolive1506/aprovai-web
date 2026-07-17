import type { Cabinet } from "@/api/cabinets/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { getFirstLettersFromNames } from "@/utils/get-first-letters-from-names"
import { Link } from "react-router-dom"

interface CabinetListItemProps {
  cabinet: Cabinet
  rank: number
}

export function CabinetListItem({ cabinet, rank }: CabinetListItemProps) {
  const isFirst = rank === 1

  return (
    <Link
      to={`/${cabinet.slug}`}
      className={cn(
        "group flex items-center gap-4 px-5 py-4 hover:bg-muted/40 transition-colors",
        isFirst && "border-l-2 border-l-primary",
      )}
    >
      <span className="w-6 shrink-0 text-right font-mono text-xs tabular-nums text-muted-foreground/40 leading-none">
        {String(rank).padStart(2, "0")}
      </span>

      <Avatar className="size-8 shrink-0">
        <AvatarImage src={cabinet.avatarUrl ?? undefined} />
        <AvatarFallback className="bg-muted text-muted-foreground text-xs font-medium">
          {getFirstLettersFromNames(cabinet.name)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm text-foreground group-hover:text-primary transition-colors truncate",
            isFirst ? "font-semibold" : "font-medium",
          )}
        >
          {cabinet.name}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">
          {cabinet.demand_count} {cabinet.demand_count === 1 ? "demanda" : "demandas"}
          {" · "}
          {cabinet.resolved_count} {cabinet.resolved_count === 1 ? "resolvida" : "resolvidas"}
        </p>
      </div>

      <span
        className={cn(
          "shrink-0 text-sm font-semibold tabular-nums",
          cabinet.score > 0 ? "text-foreground" : "text-muted-foreground/30",
        )}
      >
        {cabinet.score} pts
      </span>
    </Link>
  )
}
