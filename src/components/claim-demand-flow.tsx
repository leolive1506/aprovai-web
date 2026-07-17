import { useAssignDemand, useClaimDemand } from "@/api/demands/hooks"
import type { Demand } from "@/api/demands/types"
import { useGetCabinetMembers } from "@/api/cabinets/hooks"
import type { CabinetMember } from "@/api/cabinets/types"
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
import { cn, getApiErrorMessage } from "@/lib/utils"
import { getFirstLettersFromNames } from "@/utils/get-first-letters-from-names"
import { useAuth } from "@/hooks/use-auth"
import { Building2, CheckCircle2, Loader2, ShieldAlert, UserCheck } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface ClaimDemandFlowProps {
  demand: Demand
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Step = "confirm" | "assign"

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

export function ClaimDemandFlow({ demand, open, onOpenChange }: ClaimDemandFlowProps) {
  const { cabinet } = useAuth()
  const [step, setStep] = useState<Step>("confirm")
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)
  const [claimedId, setClaimedId] = useState<string | null>(null)

  const { data: members = [], isLoading: isLoadingMembers } = useGetCabinetMembers(cabinet?.slug)
  const { mutate: claimDemand, isPending: isClaiming } = useClaimDemand()
  const { mutate: assignDemand, isPending: isAssigning } = useAssignDemand()

  function resetAndClose() {
    setStep("confirm")
    setSelectedMemberId(null)
    setClaimedId(null)
    onOpenChange(false)
  }

  function handleDialogOpenChange(next: boolean) {
    if (next) {
      onOpenChange(true)
      return
    }
    if (isClaiming || isAssigning) return
    if (step === "assign") {
      toast.success("Demanda vinculada ao gabinete!")
    }
    resetAndClose()
  }

  function handleClaim() {
    claimDemand(demand.id, {
      onSuccess: () => {
        setClaimedId(demand.id)
        setStep("assign")
      },
      onError: (err: unknown) => {
        toast.error(getApiErrorMessage(err, "Erro ao vincular demanda ao gabinete"))
      },
    })
  }

  function handleAssign() {
    if (!selectedMemberId) return
    assignDemand(
      { id: claimedId ?? demand.id, assigneeMemberId: selectedMemberId },
      {
        onSuccess: () => {
          toast.success("Demanda vinculada e responsável atribuído com sucesso!")
          resetAndClose()
        },
        onError: () => {
          toast.error("Erro ao atribuir responsável. Tente novamente ou pule esta etapa.")
        },
      },
    )
  }

  function handleSkip() {
    toast.success("Demanda vinculada ao gabinete!")
    resetAndClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="sm:max-w-md">
        {step === "confirm" ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building2 className="size-4 text-primary" />
                Vincular ao gabinete
              </DialogTitle>
              <DialogDescription>
                Esta demanda será atrelada ao seu gabinete e aparecerá no painel de gestão.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-3">
              <div className="rounded-xl border border-border bg-muted/40 px-4 py-3">
                <p className="text-2xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Demanda</p>
                <p className="text-sm font-semibold text-foreground line-clamp-2">{demand.title}</p>
                {demand.category && (
                  <p className="text-xs text-muted-foreground mt-0.5">{demand.category.name}</p>
                )}
              </div>

              {cabinet && (
                <div className="rounded-xl border border-border bg-muted/40 px-4 py-3 flex items-center gap-3">
                  <Avatar className="size-9 shrink-0">
                    <AvatarImage src={cabinet.avatarUrl ?? undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                      {getFirstLettersFromNames(cabinet.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-2xs font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">Seu gabinete</p>
                    <p className="text-sm font-semibold text-foreground truncate">{cabinet.name}</p>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={resetAndClose} disabled={isClaiming}>
                Cancelar
              </Button>
              <Button onClick={handleClaim} disabled={isClaiming}>
                {isClaiming && <Loader2 className="size-4 animate-spin" />}
                Vincular
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserCheck className="size-4 text-primary" />
                Atribuir responsável
              </DialogTitle>
              <DialogDescription>
                Demanda vinculada. Selecione um membro para ser responsável, ou pule esta etapa.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-2">
              <p className="text-2xs font-semibold uppercase tracking-widest text-muted-foreground">
                Membros do gabinete
              </p>

              {isLoadingMembers ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="size-5 animate-spin text-muted-foreground" />
                </div>
              ) : members.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-center">
                  <ShieldAlert className="size-7 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">Nenhum membro encontrado.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2 max-h-56 overflow-y-auto">
                  {members.map((member) => (
                    <MemberOption
                      key={member.id}
                      member={member}
                      selected={selectedMemberId === member.id}
                      onSelect={() => setSelectedMemberId(selectedMemberId === member.id ? null : member.id)}
                    />
                  ))}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleSkip} disabled={isAssigning}>
                Pular
              </Button>
              <Button onClick={handleAssign} disabled={!selectedMemberId || isAssigning}>
                {isAssigning && <Loader2 className="size-4 animate-spin" />}
                Atribuir
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
