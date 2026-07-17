import { useAdminDisableCabinet, useAdminEnableCabinet } from "@/api/admin/hooks"
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Building2, BuildingIcon, Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

export function CabinetEnableButton({ cabinetId }: { cabinetId: string }) {
  const [open, setOpen] = useState(false)
  const { mutate, isPending } = useAdminEnableCabinet()

  function handleConfirm() {
    mutate(cabinetId, {
      onSuccess: () => { toast.success("Gabinete reativado com sucesso."); setOpen(false) },
      onError: () => toast.error("Erro ao reativar gabinete."),
    })
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-1 text-xs h-7 text-green-700 border-green-200 hover:bg-green-50 hover:text-green-800"
        onClick={() => setOpen(true)}
      >
        <Building2 className="size-3" />
        Ativar
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reativar gabinete?</AlertDialogTitle>
            <AlertDialogDescription>
              O gabinete voltará a estar visível e acessível na plataforma.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} disabled={isPending}>
              {isPending ? <Loader2 className="size-4 animate-spin" /> : "Reativar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export function CabinetDisableButton({ cabinetId }: { cabinetId: string }) {
  const [open, setOpen] = useState(false)
  const { mutate, isPending } = useAdminDisableCabinet()

  function handleConfirm() {
    mutate(cabinetId, {
      onSuccess: () => { toast.success("Gabinete desativado com sucesso."); setOpen(false) },
      onError: () => toast.error("Erro ao desativar gabinete."),
    })
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-1 text-xs h-7 text-red-700 border-red-200 hover:bg-red-50 hover:text-red-800"
        onClick={() => setOpen(true)}
      >
        <BuildingIcon className="size-3" />
        Desativar
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desativar gabinete?</AlertDialogTitle>
            <AlertDialogDescription>
              O gabinete ficará invisível na plataforma. Você poderá reativá-lo a qualquer momento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? <Loader2 className="size-4 animate-spin" /> : "Desativar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
