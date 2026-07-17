import { useReportDemand } from "@/api/demands/hooks"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { getApiErrorMessage } from "@/lib/utils"

interface ReportDemandDialogProps {
  demandId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReportDemandDialog({ demandId, open, onOpenChange }: ReportDemandDialogProps) {
  const [reason, setReason] = useState("")
  const { mutate, isPending } = useReportDemand()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!reason.trim()) return

    mutate(
      { id: demandId, reason: reason.trim() },
      {
        onSuccess: () => {
          toast.success("Denúncia registrada com sucesso.")
          setReason("")
          onOpenChange(false)
        },
        onError: (err: unknown) => {
          toast.error(getApiErrorMessage(err, "Erro ao registrar denúncia. Tente novamente."))
        },
      },
    )
  }

  function handleOpenChange(value: boolean) {
    if (!isPending) {
      if (!value) setReason("")
      onOpenChange(value)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Denunciar demanda</DialogTitle>
          <DialogDescription>
            Descreva o motivo da denúncia. Nossa equipe irá analisar o conteúdo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-1">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="report-reason">Motivo da denúncia</Label>
            <Textarea
              id="report-reason"
              placeholder="Descreva o motivo pelo qual está denunciando esta demanda..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={5000}
              rows={4}
              required
              autoFocus
              disabled={isPending}
              className="resize-none"
            />
            <span className="text-xs text-muted-foreground text-right">
              {reason.length}/5000
            </span>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending || !reason.trim()} variant="destructive">
              {isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
