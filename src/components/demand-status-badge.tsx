import { cn } from "@/lib/utils"
import { type DemandStatus } from "@/api/demands/types"
import { DEMAND_STATUS_CONFIG } from "@/pages/private/demands/components/demand-utils"

interface DemandStatusBadgeProps {
  status: DemandStatus
  className?: string
}

export function DemandStatusBadge({ status, className }: DemandStatusBadgeProps) {
  const config = DEMAND_STATUS_CONFIG[status]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium leading-none h-5",
        config.className,
        className,
      )}
    >
      {config.dotClassName && (
        <span className={cn("size-1.5 rounded-full shrink-0", config.dotClassName)} />
      )}
      {config.label}
    </span>
  )
}
