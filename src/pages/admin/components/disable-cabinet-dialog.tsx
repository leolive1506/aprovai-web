import type { Cabinet } from "@/api/cabinets/types"
import { useAdminDeleteCabinet } from "@/api/admin/hooks"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { getApiErrorMessage } from "@/lib/utils"
import { BanIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

export function DisableCabinetDialog({ cabinet }: { cabinet: Cabinet }) {
  const [open, setOpen] = useState(false)
  const { mutateAsync: deleteCabinet, isPending } = useAdminDeleteCabinet()

  const handleDisable = async () => {
    try {
      await deleteCabinet(cabinet.id)
      setOpen(false)
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Erro ao desativar gabinete."))
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !isPending && setOpen(next)}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 text-muted-foreground hover:text-foreground"
          aria-label="Desativar gabinete"
        >
          <BanIcon className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Desativar gabinete</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Tem certeza que deseja desativar o gabinete{" "}
          <span className="font-medium">{cabinet.name}</span>?
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDisable} disabled={isPending}>
            Desativar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

