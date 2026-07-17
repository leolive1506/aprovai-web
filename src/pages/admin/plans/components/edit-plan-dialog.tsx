import { useAdminUpdatePlan } from "@/api/plans/hooks"
import type { Plan } from "@/api/plans/types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Loader2, PencilIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface Props {
  plan: Plan
}

function toReais(cents: number) {
  return (cents / 100).toFixed(2).replace(".", ",")
}

function parseReais(value: string): number {
  return Math.round(parseFloat(value.replace(",", ".")) * 100)
}

export function EditPlanDialog({ plan }: Props) {
  const [open, setOpen] = useState(false)

  const [name, setName] = useState(plan.name)
  const [price, setPrice] = useState(toReais(plan.priceInCents))
  const [maxMembers, setMaxMembers] = useState(plan.maxMembers?.toString() ?? "")
  const [maxDemands, setMaxDemands] = useState(plan.maxDemands?.toString() ?? "")
  const [storageMbInput, setStorageMbInput] = useState(
    plan.maxStorageBytes !== null ? Math.round(plan.maxStorageBytes / 1024 ** 2).toString() : ""
  )

  useEffect(() => {
    if (open) {
      setName(plan.name)
      setPrice(toReais(plan.priceInCents))
      setMaxMembers(plan.maxMembers?.toString() ?? "")
      setMaxDemands(plan.maxDemands?.toString() ?? "")
      setStorageMbInput(
        plan.maxStorageBytes !== null ? Math.round(plan.maxStorageBytes / 1024 ** 2).toString() : ""
      )
    }
  }, [open, plan])

  const { mutate: updatePlan, isPending } = useAdminUpdatePlan()

  function handleSubmit() {
    const priceInCents = parseReais(price)
    if (!name.trim()) return toast.error("O nome do plano é obrigatório.")
    if (isNaN(priceInCents) || priceInCents <= 0) return toast.error("Informe um preço válido.")

    updatePlan(
      {
        planId: plan.id,
        data: {
          name: name.trim(),
          priceInCents,
          maxMembers: maxMembers === "" ? null : Number(maxMembers),
          maxDemands: maxDemands === "" ? null : Number(maxDemands),
          maxStorageBytes: storageMbInput === "" ? null : Number(storageMbInput) * 1024 ** 2,
        },
      },
      { onSuccess: () => setOpen(false) },
    )
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="size-7 text-muted-foreground hover:text-foreground"
        title="Editar plano"
        onClick={() => setOpen(true)}
      >
        <PencilIcon className="size-3.5" />
      </Button>

      <Dialog open={open} onOpenChange={(v) => !isPending && setOpen(v)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">Editar plano</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-1">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Nome</Label>
              <input
                className="h-8 rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Preço (R$)</Label>
              <input
                className="h-8 rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                placeholder="0,00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Membros máx.</Label>
                <input
                  className="h-8 rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  placeholder="Ilimitado"
                  type="number"
                  min={1}
                  value={maxMembers}
                  onChange={(e) => setMaxMembers(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Demandas máx.</Label>
                <input
                  className="h-8 rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  placeholder="Ilimitado"
                  type="number"
                  min={1}
                  value={maxDemands}
                  onChange={(e) => setMaxDemands(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Storage (MB)</Label>
                <input
                  className="h-8 rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  placeholder="Ilimitado"
                  type="number"
                  min={1}
                  value={storageMbInput}
                  onChange={(e) => setStorageMbInput(e.target.value)}
                />
              </div>
            </div>

            <p className="text-2xs text-muted-foreground">
              Deixe os campos de limite em branco para ilimitado.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isPending || !name.trim()}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
