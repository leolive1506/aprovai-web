import { useAdminAddFeatureToPlan, useAdminListFeatures } from "@/api/plans/hooks"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { useState } from "react"

interface Props {
  plan: Plan
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddPlanFeatureDialog({ plan, open, onOpenChange }: Props) {
  const [featureSlug, setFeatureSlug] = useState("")
  const [retroactive, setRetroactive] = useState(true)

  const { data: features = [], isLoading: loadingFeatures } = useAdminListFeatures()
  const { mutate: addFeature, isPending } = useAdminAddFeatureToPlan()

  const existingSlugs = new Set(plan.features.map((f) => f.featureSlug))
  const available = features.filter((f) => !existingSlugs.has(f.slug))

  function handleSubmit() {
    if (!featureSlug) return
    addFeature(
      { planId: plan.id, featureSlug, retroactive },
      {
        onSuccess: () => {
          setFeatureSlug("")
          setRetroactive(true)
          onOpenChange(false)
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Adicionar feature — {plan.name}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-1">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Feature</Label>
            {loadingFeatures ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin" />
                Carregando...
              </div>
            ) : available.length === 0 ? (
              <p className="text-sm text-muted-foreground">Todas as features já estão no plano.</p>
            ) : (
              <Select value={featureSlug} onValueChange={setFeatureSlug}>
                <SelectTrigger className="h-8 text-sm w-full">
                  <SelectValue placeholder="Selecione uma feature..." />
                </SelectTrigger>
                <SelectContent position="popper" className="w-[--radix-select-trigger-width]">
                  {available.map((f) => (
                    <SelectItem key={f.slug} value={f.slug}>
                      <span className="font-mono text-xs text-muted-foreground mr-2">{f.slug}</span>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Rollout</Label>
            <Select value={retroactive ? "retroactive" : "forward"} onValueChange={(v) => setRetroactive(v === "retroactive")}>
              <SelectTrigger className="h-8 text-sm w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" className="w-[--radix-select-trigger-width]">
                <SelectItem value="retroactive">
                  Retroativo — todos os gabinetes do plano recebem agora
                </SelectItem>
                <SelectItem value="forward">
                  Apenas novos — só gabinetes que assinarem a partir de hoje
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isPending || !featureSlug || available.length === 0}>
            {isPending && <Loader2 className="size-4 animate-spin" />}
            Adicionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
