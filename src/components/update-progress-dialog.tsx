import { useUpdateDemandProgress } from "@/api/demands/hooks"
import { DemandStatus, type DemandStatus as DemandStatusType } from "@/api/demands/types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { AlertCircle, ArrowRight, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

const STATUS_CONFIG: Record<DemandStatusType, { label: string; dot: string }> = {
  [DemandStatus.SUBMITTED]:   { label: "Enviada",        dot: "bg-slate-400" },
  [DemandStatus.IN_ANALYSIS]: { label: "Em análise",     dot: "bg-blue-500" },
  [DemandStatus.IN_PROGRESS]: { label: "Em progresso",   dot: "bg-amber-500" },
  [DemandStatus.RESOLVED]:    { label: "Finalizada",     dot: "bg-emerald-500" },
  [DemandStatus.REJECTED]:    { label: "Rejeitada",      dot: "bg-red-500" },
  [DemandStatus.CANCELED]:    { label: "Cancelada",      dot: "bg-zinc-400" },
}

const STATUSES_REQUIRING_NOTE: DemandStatusType[] = [
  DemandStatus.REJECTED,
  DemandStatus.CANCELED,
]

interface UpdateProgressDialogProps {
  demandId: string
  currentStatus: DemandStatusType
  defaultStatus?: DemandStatusType
  hasResults?: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
  onNeedsResults?: () => void
  onSuccess?: () => void
}

export function UpdateProgressDialog({
  demandId,
  currentStatus,
  defaultStatus,
  hasResults,
  open,
  onOpenChange,
  onNeedsResults,
  onSuccess,
}: UpdateProgressDialogProps) {
  const [selectedStatus, setSelectedStatus] = useState<DemandStatusType>(defaultStatus ?? currentStatus)
  const [note, setNote] = useState("")

  const { mutate, isPending } = useUpdateDemandProgress()

  useEffect(() => {
    if (open) {
      setSelectedStatus(defaultStatus ?? currentStatus)
      setNote("")
    }
  }, [open, currentStatus, defaultStatus])

  const requiresNote = STATUSES_REQUIRING_NOTE.includes(selectedStatus)
  const noteIsValid = !requiresNote || note.trim().length > 0
  const hasChanges = selectedStatus !== currentStatus || note.trim().length > 0
  const isResolvingWithoutResults = selectedStatus === DemandStatus.RESOLVED && hasResults !== true

  function handleClose() {
    if (isPending) return
    onOpenChange(false)
  }

  function handleSubmit() {
    if (isResolvingWithoutResults) {
      if (onNeedsResults) {
        onOpenChange(false)
        onNeedsResults()
      } else {
        toast.error("Registre pelo menos um resultado antes de finalizar a demanda")
      }
      return
    }
    if (!hasChanges) {
      handleClose()
      return
    }
    if (!noteIsValid) {
      toast.error("Informe o motivo para rejeitar ou cancelar a demanda")
      return
    }
    mutate(
      { id: demandId, status: selectedStatus, note: note.trim() || undefined },
      {
        onSuccess: () => {
          toast.success("Status atualizado")
          handleClose()
          onSuccess?.()
        },
        onError: () => {
          toast.error("Erro ao atualizar status")
        },
      },
    )
  }

  const submitLabel = isResolvingWithoutResults
    ? "Adicionar resultado"
    : hasChanges
    ? "Salvar"
    : "Fechar"

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">Atualizar status</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className={cn("size-1.5 rounded-full shrink-0", STATUS_CONFIG[currentStatus].dot)} />
            {STATUS_CONFIG[currentStatus].label}
          </span>
          <ArrowRight className="size-3 shrink-0" />
          <span className={cn(
            "flex items-center gap-1.5 font-medium transition-colors",
            selectedStatus !== currentStatus ? "text-foreground" : "text-muted-foreground"
          )}>
            <span className={cn("size-1.5 rounded-full shrink-0", STATUS_CONFIG[selectedStatus].dot)} />
            {STATUS_CONFIG[selectedStatus].label}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {Object.values(DemandStatus).map((status) => {
            const cfg = STATUS_CONFIG[status]
            const isSelected = selectedStatus === status
            const isCurrent = currentStatus === status
            return (
              <button
                key={status}
                type="button"
                onClick={() => setSelectedStatus(status)}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left transition-colors",
                  isSelected
                    ? "border-foreground/20 bg-muted"
                    : "border-border hover:bg-muted/40",
                )}
              >
                <span className={cn("size-1.5 rounded-full shrink-0", cfg.dot)} />
                <span className={cn(
                  "text-xs font-medium truncate flex-1",
                  isSelected ? "text-foreground" : "text-muted-foreground",
                )}>
                  {cfg.label}
                </span>
                {isCurrent && !isSelected && (
                  <span className="text-2xs text-muted-foreground/50 shrink-0">atual</span>
                )}
              </button>
            )
          })}
        </div>

        {isResolvingWithoutResults && (
          <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/20 px-3.5 py-3">
            <AlertCircle className="size-4 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
              É necessário registrar pelo menos um resultado antes de finalizar a demanda.
            </p>
          </div>
        )}

        {!isResolvingWithoutResults && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-medium text-muted-foreground">Nota</p>
              {requiresNote ? (
                <span className="text-xs text-destructive/70">(obrigatório)</span>
              ) : (
                <span className="text-xs text-muted-foreground/50">(opcional)</span>
              )}
            </div>
            <Textarea
              placeholder={
                requiresNote
                  ? "Descreva o motivo..."
                  : "Descreva o que foi feito ou decisões tomadas..."
              }
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={500}
              rows={3}
              className={cn(
                "resize-none text-sm",
                requiresNote && !note.trim() && "border-destructive/40 focus-visible:ring-destructive/20",
              )}
            />
            {note.length > 400 && (
              <p className="text-xs text-muted-foreground text-right tabular-nums">{note.length}/500</p>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending || (!isResolvingWithoutResults && hasChanges && !noteIsValid)}
          >
            {isPending && <Loader2 className="size-4 animate-spin" />}
            {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
