import type { FeatureSlug } from "@/api/plans/features"
import { useCabinetFeatures } from "@/hooks/use-cabinet-features"
import type { ReactNode } from "react"
import { UpgradePrompt } from "./upgrade-prompt"

interface Props {
  feature: FeatureSlug
  children: ReactNode
  fallback?: ReactNode
  upgradePrompt?: boolean
  upgradeClassName?: string
}

export function FeatureGate({
  feature,
  children,
  fallback = null,
  upgradePrompt: showUpgrade = false,
  upgradeClassName,
}: Props) {
  const { hasFeature, isLoading } = useCabinetFeatures()

  if (isLoading) return <>{children}</>

  if (!hasFeature(feature)) {
    if (showUpgrade) return <UpgradePrompt feature={feature} className={upgradeClassName} />
    return <>{fallback}</>
  }

  return <>{children}</>
}
