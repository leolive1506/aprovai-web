import { PlansApi } from "@/api/plans"
import type { FeatureSlug } from "@/api/plans/features"
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "./use-auth"

export function useCabinetFeatures() {
  const { cabinet } = useAuth()

  const { data: plans, isLoading } = useQuery({
    queryKey: ["cabinet-plans", cabinet?.slug],
    queryFn: () => PlansApi.getCabinetPlans(cabinet!.slug),
    enabled: !!cabinet?.slug,
    staleTime: 60 * 1000,
  })

  function hasFeature(slug: FeatureSlug): boolean {
    if (!cabinet) return true
    return plans?.features.includes(slug) ?? false
  }

  return { hasFeature, plans, isLoading }
}
