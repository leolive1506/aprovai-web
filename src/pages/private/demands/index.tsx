import { PlanLimitBanner } from "@/components/plan-limit-banner"
import { useCabinetUsage } from "@/api/cabinets/hooks"
import { useCabinetFeatures } from "@/hooks/use-cabinet-features"
import { useAuth } from "@/hooks/use-auth"
import { usePageTitle } from "@/hooks/use-page-title"
import { useEffect } from "react"
import { DemandsTable } from "./components/demands-table"
import { formatBytes } from "@/lib/utils"

export function Demands() {
  const { setTitle } = usePageTitle()
  const { cabinet } = useAuth()
  const { plans } = useCabinetFeatures()

  const hasAnyLimit =
    (plans?.limits.maxDemands !== null && plans?.limits.maxDemands !== undefined) ||
    (plans?.limits.maxStorageBytes !== null && plans?.limits.maxStorageBytes !== undefined)

  const { data: usage } = useCabinetUsage(hasAnyLimit ? cabinet?.slug : undefined)

  useEffect(() => {
    setTitle({ title: "Demandas", description: "Visão geral das demandas" })
  }, [setTitle])

  const showDemandBanner =
    plans?.limits.maxDemands !== null && plans?.limits.maxDemands !== undefined && usage
  const showStorageBanner =
    plans?.limits.maxStorageBytes !== null && plans?.limits.maxStorageBytes !== undefined && usage

  return (
    <div className="flex flex-col gap-4">
      {(showDemandBanner || showStorageBanner) && (
        <div className="rounded-lg border border-border bg-card px-4 py-3 flex flex-col gap-3">
          {showDemandBanner && (
            <PlanLimitBanner
              current={usage.demandCount}
              max={plans.limits.maxDemands!}
              label="Demandas"
            />
          )}
          {showStorageBanner && (
            <PlanLimitBanner
              current={usage.storageUsedBytes}
              max={plans.limits.maxStorageBytes!}
              label="Armazenamento"
              formatValue={formatBytes}
            />
          )}
        </div>
      )}
      <DemandsTable />
    </div>
  )
}
