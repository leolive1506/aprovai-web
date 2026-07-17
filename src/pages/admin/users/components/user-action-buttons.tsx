import { useAdminDisableUser, useAdminEnableUser } from "@/api/admin/hooks"
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Loader2, UserCheck, UserX } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

export function UserEnableButton({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false)
  const { mutate, isPending } = useAdminEnableUser()

  function handleConfirm() {
    mutate(userId, {
      onSuccess: () => { toast.success("Usuário reativado com sucesso."); setOpen(false) },
      onError: () => toast.error("Erro ao reativar usuário."),
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
        <UserCheck className="size-3" />
        Ativar
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reativar usuário?</AlertDialogTitle>
            <AlertDialogDescription>
              O usuário voltará a ter acesso à plataforma normalmente.
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

export function UserDisableButton({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false)
  const { mutate, isPending } = useAdminDisableUser()

  function handleConfirm() {
    mutate(userId, {
      onSuccess: () => { toast.success("Usuário desativado com sucesso."); setOpen(false) },
      onError: () => toast.error("Erro ao desativar usuário."),
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
        <UserX className="size-3" />
        Desativar
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desativar usuário?</AlertDialogTitle>
            <AlertDialogDescription>
              O usuário perderá o acesso à plataforma. Você poderá reativá-lo a qualquer momento.
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
