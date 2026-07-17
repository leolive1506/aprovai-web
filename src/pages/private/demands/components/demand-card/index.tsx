import { DemandPriority as DemandPriorityType, type Demand } from "@/api/demands/types"
import { Gallery } from "@/components/gallery"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { getFirstLettersFromNames } from "@/utils/get-first-letters-from-names"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { MapPinIcon, MessageSquareIcon, User } from "lucide-react"

interface DemandCardProps {
  demand: Demand
}

const PRIORITY_BORDER: Record<DemandPriorityType, string> = {
  URGENT: "border-l-2 border-l-red-500",
  HIGH: "border-l-2 border-l-orange-400",
  MEDIUM: "border-l-2 border-l-sky-400",
  LOW: "border-l-2 border-l-border",
}

export function DemandCard({ demand }: DemandCardProps) {
  const relativeDate = demand.createdAt
    ? formatDistanceToNow(new Date(demand.createdAt), { addSuffix: true, locale: ptBR })
    : ""

  return (
    <article
      className={cn(
        "bg-card rounded-lg border border-border overflow-hidden",
        demand.priority && PRIORITY_BORDER[demand.priority],
      )}
    >
      <div className="flex items-start gap-3 px-4 pt-3 pb-2.5">
        <Avatar className="size-7 shrink-0 mt-0.5">
          <AvatarImage src={demand.reporter?.avatarUrl} />
          <AvatarFallback className="font-medium text-xs bg-muted text-muted-foreground">
            {demand.guestEmail ? <User className="size-3.5" /> : getFirstLettersFromNames(demand.reporter?.name ?? "")}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-medium text-foreground">
              {demand.reporter?.name || demand.guestEmail || "Anônimo"}
            </span>
            {demand.category?.name && (
              <>
                <span className="text-muted-foreground/30 text-xs">·</span>
                <span className="text-xs text-muted-foreground">{demand.category.name}</span>
              </>
            )}
            <span className="text-muted-foreground/30 text-xs">·</span>
            <span className="text-xs text-muted-foreground">{relativeDate}</span>
          </div>

          <h3 className="font-medium text-foreground text-sm leading-snug mt-1.5">{demand.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mt-0.5">{demand.description}</p>

          {demand.address && (
            <div className="flex items-center gap-1.5 text-muted-foreground mt-1.5">
              <MapPinIcon className="size-3 shrink-0" />
              <span className="text-xs">{demand.address}</span>
            </div>
          )}
        </div>
      </div>

      {demand.evidences && demand.evidences.length > 0 && <Gallery images={demand.evidences} />}

      <div className="border-t border-border/40 flex">
        <button className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors">
          <MessageSquareIcon className="size-3.5" />
          Comentar
        </button>
      </div>
    </article>
  )
}
