import { useAdminRemoveFeatureFromPlan, useAdminSetPlanActive } from "@/api/plans/hooks"
import type { Plan } from "@/api/plans/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn, formatBytes } from "@/lib/utils"
import { Loader2, PlusIcon, PowerIcon, Trash2Icon } from "lucide-react"
import { useState } from "react"
import { AddPlanFeatureDialog } from "./add-plan-feature-dialog"
import { EditPlanDialog } from "./edit-plan-dialog"

const TIER_COLORS: Record<string, string> = {
  ESSENCIAL: "bg-slate-500",
  PROFISSIONAL: "bg-blue-500",
  CAPITAL: "bg-violet-600",
}

function formatPrice(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100)
}

function formatLimit(value: number | null, unit: string) {
  return value === null ? "Ilimitado" : `${value} ${unit}`
}


interface RemoveFeatureDialogProps {
  planName: string
  featureName: string
  onConfirm: () => void
  isPending: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
}

function RemoveFeatureDialog({
  planName,
  featureName,
  onConfirm,
  isPending,
  open,
  onOpenChange,
}: RemoveFeatureDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !isPending && onOpenChange(v)}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base">Remover feature do plano</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Remover <span className="font-medium text-foreground">{featureName}</span> do plano{" "}
          <span className="font-medium text-foreground">{planName}</span>?
          {" "}Gabinetes com rollout retroativo perderão acesso imediatamente.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isPending}>
            {isPending && <Loader2 className="size-4 animate-spin" />}
            Remover
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface Props {
  plan: Plan
}

export function PlanCard({ plan }: Props) {
  const [addOpen, setAddOpen] = useState(false)
  const [removeTarget, setRemoveTarget] = useState<{ featureSlug: string; featureName: string } | null>(null)
  const [deactivateOpen, setDeactivateOpen] = useState(false)
  const [activateOpen, setActivateOpen] = useState(false)

  const { mutate: removeFeature, isPending: removing } = useAdminRemoveFeatureFromPlan()
  const { mutate: setPlanActive, isPending: togglingActive } = useAdminSetPlanActive()

  function handleConfirmRemove() {
    if (!removeTarget) return
    removeFeature(
      { planId: plan.id, featureSlug: removeTarget.featureSlug },
      { onSuccess: () => setRemoveTarget(null) },
    )
  }

  function handlePowerClick() {
    if (plan.isActive) {
      setDeactivateOpen(true)
    } else {
      setActivateOpen(true)
    }
  }

  function handleConfirmDeactivate() {
    setPlanActive(
      { planId: plan.id, isActive: false },
      { onSuccess: () => setDeactivateOpen(false) },
    )
  }

  function handleConfirmActivate() {
    setPlanActive(
      { planId: plan.id, isActive: true },
      { onSuccess: () => setActivateOpen(false) },
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <span className={cn("w-0.75 self-stretch rounded-full shrink-0", TIER_COLORS[plan.tier] ?? "bg-border")} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{plan.name}</p>
          <p className="text-xs text-muted-foreground font-mono">{plan.tier} · {formatPrice(plan.priceInCents)}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {!plan.isActive && (
            <Badge variant="outline" className="text-2xs border-amber-200 bg-amber-50 text-amber-700">
              Inativo
            </Badge>
          )}
          <EditPlanDialog plan={plan} />
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "size-7",
              plan.isActive
                ? "text-muted-foreground hover:text-destructive"
                : "text-emerald-600 hover:text-emerald-700",
            )}
            disabled={togglingActive}
            title={plan.isActive ? "Desativar plano" : "Ativar plano"}
            onClick={handlePowerClick}
          >
            {togglingActive ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <PowerIcon className="size-3.5" />
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
        {[
          { label: "Membros", value: formatLimit(plan.maxMembers, "max") },
          { label: "Demandas/mês", value: formatLimit(plan.maxDemands, "max") },
          { label: "Armazenamento", value: plan.maxStorageBytes === null ? "Ilimitado" : formatBytes(plan.maxStorageBytes) },
        ].map(({ label, value }) => (
          <div key={label} className="px-3 py-2.5 flex flex-col gap-0.5">
            <span className="text-2xs text-muted-foreground">{label}</span>
            <span className="text-sm font-medium text-foreground">{value}</span>
          </div>
        ))}
      </div>

      <div className="px-4 py-3 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Features</span>
          <Button
            variant="ghost"
            size="xs"
            className="h-6 gap-1 text-xs"
            onClick={() => setAddOpen(true)}
          >
            <PlusIcon className="size-3" />
            Adicionar
          </Button>
        </div>

        {plan.features.length === 0 ? (
          <p className="text-xs text-muted-foreground/60 py-1">Nenhuma feature neste plano.</p>
        ) : (
          <div className="rounded-md border border-border overflow-hidden divide-y divide-border/60">
            {plan.features.map((pf) => (
              <div key={pf.featureSlug} className="flex items-center gap-2 px-3 py-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{pf.feature.name}</p>
                  <p className="text-2xs font-mono text-muted-foreground">{pf.featureSlug}</p>
                </div>
                {pf.effectiveFrom ? (
                  <span className="text-2xs text-amber-600 shrink-0">
                    A partir de {new Date(pf.effectiveFrom).toLocaleDateString("pt-BR")}
                  </span>
                ) : (
                  <span className="text-2xs text-emerald-600 shrink-0">Retroativo</span>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6 text-muted-foreground hover:text-destructive shrink-0"
                  onClick={() =>
                    setRemoveTarget({ featureSlug: pf.featureSlug, featureName: pf.feature.name })
                  }
                >
                  <Trash2Icon className="size-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddPlanFeatureDialog plan={plan} open={addOpen} onOpenChange={setAddOpen} />

      <RemoveFeatureDialog
        planName={plan.name}
        featureName={removeTarget?.featureName ?? ""}
        open={!!removeTarget}
        onOpenChange={(v) => !v && setRemoveTarget(null)}
        onConfirm={handleConfirmRemove}
        isPending={removing}
      />

      <Dialog open={activateOpen} onOpenChange={(v) => !togglingActive && setActivateOpen(v)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">Ativar plano</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Ativar <span className="font-medium text-foreground">{plan.name}</span>? O plano voltará
            a aparecer como opção para novos gabinetes.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActivateOpen(false)} disabled={togglingActive}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmActivate} disabled={togglingActive}>
              {togglingActive && <Loader2 className="size-4 animate-spin" />}
              Ativar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deactivateOpen} onOpenChange={(v) => !togglingActive && setDeactivateOpen(v)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">Desativar plano</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Desativar <span className="font-medium text-foreground">{plan.name}</span>? O plano não
            aparecerá mais como opção para novos gabinetes, mas assinaturas existentes permanecem
            ativas.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeactivateOpen(false)} disabled={togglingActive}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirmDeactivate} disabled={togglingActive}>
              {togglingActive && <Loader2 className="size-4 animate-spin" />}
              Desativar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
