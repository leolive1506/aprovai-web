import { DemandStatus } from "@/api/demands/types"
import { getDaysSince } from "@/utils/date"
import { cn } from "@/lib/utils"
import { Clock } from "lucide-react"

const TERMINAL_STATUSES = new Set<string>([
  DemandStatus.RESOLVED,
  DemandStatus.REJECTED,
  DemandStatus.CANCELED,
])

interface DemandStaleBadgeProps {
  status: DemandStatus
  updatedAt: string
  className?: string
}

export function DemandStaleBadge({ status, updatedAt, className }: DemandStaleBadgeProps) {
  if (TERMINAL_STATUSES.has(status)) return null

  const days = getDaysSince(updatedAt)

  if (days < 15) return null

  const isUrgent = days >= 30

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium leading-none h-5",
        isUrgent
          ? "border-red-200 bg-red-50 text-red-600 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400"
          : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400",
        className,
      )}
    >
      <Clock className="size-3 shrink-0" />
      Parada há {days}d
    </span>
  )
}
