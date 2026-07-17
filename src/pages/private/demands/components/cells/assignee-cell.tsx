import type { Demand } from "@/api/demands/types"
import { cn } from "@/lib/utils"
import type { Row } from "@tanstack/react-table"
import { Building2, UserCheck } from "lucide-react"
import { useState } from "react"
import { AssignMemberDialog } from "../assign-member-dialog"

export function AssigneeCell({ row }: { row: Row<Demand> }) {
  const demand = row.original
  const [dialogOpen, setDialogOpen] = useState(false)

  const isUnlinked = !demand.cabinetId
  const hasAssignee = !!demand.assigneeMemberId

  return (
    <>
      <button
        onClick={() => setDialogOpen(true)}
        className={cn(
          "inline-flex items-center gap-1.5 transition-all",
          hasAssignee
            ? "text-xs text-muted-foreground hover:text-foreground"
            : cn(
                "px-2.5 py-1 rounded-full text-xs font-medium border",
                isUnlinked
                  ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                  : "border-dashed border-border text-muted-foreground hover:border-primary/40 hover:text-primary",
              ),
        )}
        title={hasAssignee ? "Reatribuir membro" : undefined}
      >
        {hasAssignee ? (
          <>
            <span className="size-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <UserCheck className="size-3 text-primary" />
            </span>
            Atribuído
          </>
        ) : isUnlinked ? (
          <>
            <Building2 className="size-3" />
            Vincular
          </>
        ) : (
          <>
            <UserCheck className="size-3" />
            Atribuir
          </>
        )}
      </button>
      <AssignMemberDialog demand={demand} open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  )
}
