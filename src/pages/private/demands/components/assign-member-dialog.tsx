import { useAssignDemand, useClaimDemand } from "@/api/demands/hooks"
import type { Demand } from "@/api/demands/types"
import { useGetCabinetMembers } from "@/api/cabinets/hooks"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { getFirstLettersFromNames } from "@/utils/get-first-letters-from-names"
import { useAuth } from "@/hooks/use-auth"
import { CheckCircle2, Loader2, ShieldAlert, UserCheck } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import type { CabinetMember } from "@/api/cabinets/types"

interface AssignMemberDialogProps {
  demand: Demand
  open: boolean
  onOpenChange: (open: boolean) => void
}

const ROLE_LABEL: Record<string, string> = {
  OWNER: "Responsável",
  STAFF: "Membro",
}

function MemberOption({
  member,
  selected,
  onSelect,
}: {
  member: CabinetMember
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border-2 text-left transition-all duration-150",
        selected
          ? "border-primary bg-primary/5"
          : "border-border bg-card hover:border-primary/30 hover:bg-muted/30",
      )}
    >
      <Avatar className="size-9 shrink-0">
        <AvatarImage src={member.userAvatarUrl ?? undefined} />
        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
          {getFirstLettersFromNames(member.userName)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{member.userName}</p>
        <p className="text-xs text-muted-foreground">{ROLE_LABEL[member.role] ?? member.role}</p>
      </div>

      <div className={cn(
        "size-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0",
        selected ? "border-primary bg-primary" : "border-border",
      )}>
        {selected && <CheckCircle2 className="size-3 text-white" />}
      </div>
    </button>
  )
}

export function AssignMemberDialog({ demand, open, onOpenChange }: AssignMemberDialogProps) {
  const { cabinet } = useAuth()
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(demand.assigneeMemberId ?? null)

  const { data: members = [], isLoading: isLoadingMembers } = useGetCabinetMembers(cabinet?.slug)
  const { mutate: claimDemand, isPending: isClaiming } = useClaimDemand()
  const { mutate: assignDemand, isPending: isAssigning } = useAssignDemand()

  const isUnlinked = !demand.cabinetId
  const isPending = isClaiming || isAssigning

  function handleClose() {
    setSelectedMemberId(null)
    onOpenChange(false)
  }

  function handleSubmit() {
    if (isUnlinked) {
      claimDemand(demand.id, {
        onSuccess: () => {
          toast.success("Demanda vinculada ao gabinete")
          if (selectedMemberId) {
            assignDemand(
              { id: demand.id, assigneeMemberId: selectedMemberId },
              {
                onSuccess: () => {
                  toast.success("Membro atribuído com sucesso")
                  handleClose()
                },
                onError: () => {
                  toast.error("Erro ao atribuir membro")
                  handleClose()
                },
              },
            )
          } else {
            handleClose()
          }
        },
        onError: () => {
          toast.error("Erro ao vincular demanda")
        },
      })
    } else {
      assignDemand(
        { id: demand.id, assigneeMemberId: selectedMemberId as string },
        {
          onSuccess: () => {
            toast.success("Membro atribuído com sucesso")
            handleClose()
          },
          onError: () => {
            toast.error("Erro ao atribuir membro")
          },
        },
      )
    }
  }

  const canSubmit = isUnlinked || selectedMemberId !== undefined

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="size-4 text-primary" />
            {isUnlinked ? "Vincular ao gabinete" : "Alterar responsável"}
          </DialogTitle>
          <DialogDescription>
            {isUnlinked
              ? "Esta demanda será vinculada ao seu gabinete. Você pode opcionalmente atribuir um membro."
              : "Selecione um membro do gabinete para ser responsável por esta demanda."}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border border-border bg-muted/40 px-4 py-3">
          <p className="text-2xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Demanda</p>
          <p className="text-sm font-semibold text-foreground line-clamp-2">{demand.title}</p>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-2xs font-semibold uppercase tracking-widest text-muted-foreground">
            {isUnlinked ? "Atribuir membro (opcional)" : "Responsável"}
          </p>

          {isLoadingMembers ? (
            <div className="flex justify-center py-8">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : members.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <ShieldAlert className="size-7 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Nenhum membro encontrado no gabinete.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
              {members.map((member) => (
                <MemberOption
                  key={member.id}
                  member={member}
                  selected={selectedMemberId === member.id}
                  onSelect={() =>
                    setSelectedMemberId(selectedMemberId === member.id ? null : member.id)
                  }
                />
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit || isPending}>
            {isPending && <Loader2 className="size-4 animate-spin" />}
            {isUnlinked ? "Vincular" : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
