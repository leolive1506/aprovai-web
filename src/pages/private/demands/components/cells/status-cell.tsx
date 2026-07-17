import { useState } from "react"
import { useUpdateDemandStatus } from "@/api/demands/hooks"
import type { Demand, DemandStatus } from "@/api/demands/types"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CreateResultDialog } from "@/components/create-result-dialog"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import type { Row } from "@tanstack/react-table"
import { DEMAND_STATUS_CONFIG, STATUS_OPTIONS } from "../demand-utils"

export function StatusCell({ row }: { row: Row<Demand> }) {
  const demand = row.original
  const config = DEMAND_STATUS_CONFIG[demand.status]
  const { mutate: updateStatus, isPending } = useUpdateDemandStatus()
  const [showCreateResult, setShowCreateResult] = useState(false)

  const hasResults = (demand.results && demand.results.length > 0) ?? false

  function handleStatusChange(status: DemandStatus) {
    if (status === 'RESOLVED' && !hasResults) {
      setShowCreateResult(true)
      return
    }
    updateStatus({ id: demand.id, status })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={isPending}>
          <button className="outline-none cursor-pointer group">
            <Badge
              variant="outline"
              className={cn(
                "text-xs font-medium px-2.5 py-0.5 transition-all group-hover:opacity-80 active:scale-95",
                config.className,
                isPending && "opacity-50 animate-pulse",
              )}
            >
              {config.label}
            </Badge>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-40">
          {STATUS_OPTIONS.map((opt) => (
            <DropdownMenuItem
              key={opt.value}
              disabled={demand.status === opt.value}
              onClick={() => handleStatusChange(opt.value)}
              className={cn(demand.status === opt.value && "bg-accent text-primary font-semibold")}
            >
              {opt.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {showCreateResult && (
        <CreateResultDialog
          demand={demand}
          open={showCreateResult}
          onOpenChange={setShowCreateResult}
          onCreated={() => {
            updateStatus(
              { id: demand.id, status: "RESOLVED" },
              {
                onSuccess: () => toast.success("Demanda finalizada!"),
                onError: () =>
                  toast.error("Resultado salvo, mas não foi possível finalizar. Atualize o status manualmente."),
              },
            )
          }}
        />
      )}
    </>
  )
}
