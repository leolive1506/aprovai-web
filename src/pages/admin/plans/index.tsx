import { useAdminListFeatures, useAdminListPlans } from "@/api/plans/hooks"
import { usePageTitle } from "@/hooks/use-page-title"
import { Loader2, PackageIcon } from "lucide-react"
import { useEffect } from "react"
import { PlanCard } from "./components/plan-card"

export function AdminPlans() {
  const { setTitle } = usePageTitle()
  const { data: plans, isLoading } = useAdminListPlans()
  useAdminListFeatures() // prefetch

  useEffect(() => {
    setTitle({ title: "Planos", description: "Gerenciamento de planos e features" })
  }, [setTitle])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-0.5">
        <p className="text-sm text-muted-foreground">
          Gerencie as features disponíveis em cada plano. As alterações retroativas têm efeito imediato para todos os gabinetes do plano.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : !plans || plans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <div className="size-10 rounded-lg bg-muted flex items-center justify-center">
            <PackageIcon className="size-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Nenhum plano cadastrado</p>
            <p className="text-xs text-muted-foreground mt-1">
              Execute o seed do banco de dados para criar os planos iniciais.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      )}
    </div>
  )
}
