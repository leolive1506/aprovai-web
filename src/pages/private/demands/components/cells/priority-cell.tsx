import { useUpdateDemand } from "@/api/demands/hooks"
import type { Demand } from "@/api/demands/types"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import type { Row } from "@tanstack/react-table"
import { DemandPriority } from "../demand-priority"
import { PRIORITY_OPTIONS } from "../demand-utils"

export function PriorityCell({ row }: { row: Row<Demand> }) {
  const demand = row.original
  const priority = demand.priority ?? "LOW"
  const { mutate: updateDemand, isPending } = useUpdateDemand()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={isPending}>
        <button className="outline-none cursor-pointer">
          <DemandPriority variant={priority} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-40">
        {PRIORITY_OPTIONS.map((opt) => (
          <DropdownMenuItem
            key={opt.value}
            disabled={priority === opt.value}
            onClick={() => updateDemand({ id: demand.id, data: { priority: opt.value } })}
            className={cn(priority === opt.value && "bg-accent text-primary font-semibold")}
          >
            {opt.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
