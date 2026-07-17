import { apiClient } from ".."
import type {
  AddOverrideRequest,
  CabinetEntitlements,
  CabinetOverride,
  CabinetSubscription,
  FeatureItem,
  Plan,
} from "./types"

export const PlansApi = {
  getCabinetPlans: async (slug: string): Promise<CabinetEntitlements> => {
    const res = await apiClient.get<CabinetEntitlements>(`/cabinets/${slug}/plans`)
    return res.data
  },

  listPlans: async (): Promise<Plan[]> => {
    const res = await apiClient.get<Plan[]>("/admin/plans")
    return res.data
  },

  listFeatures: async (): Promise<FeatureItem[]> => {
    const res = await apiClient.get<FeatureItem[]>("/admin/features")
    return res.data
  },

  addFeatureToPlan: async (planId: string, featureSlug: string, retroactive: boolean): Promise<void> => {
    await apiClient.post(`/admin/plans/${planId}/features`, { featureSlug, retroactive })
  },

  removeFeatureFromPlan: async (planId: string, featureSlug: string): Promise<void> => {
    await apiClient.delete(`/admin/plans/${planId}/features/${featureSlug}`)
  },

  updatePlan: async (
    planId: string,
    data: { name?: string; priceInCents?: number; maxMembers?: number | null; maxDemands?: number | null; maxStorageBytes?: number | null },
  ): Promise<void> => {
    await apiClient.patch(`/admin/plans/${planId}`, data)
  },

  setPlanActive: async (planId: string, isActive: boolean): Promise<void> => {
    await apiClient.patch(`/admin/plans/${planId}/active`, { isActive })
  },

  getCabinetSubscriptionsSummary: async (): Promise<Array<{ cabinetId: string; planName: string; planTier: string; status: string; priceInCents: number }>> => {
    const res = await apiClient.get("/admin/plans/subscriptions-summary")
    return res.data
  },

  getCabinetSubscription: async (cabinetId: string): Promise<CabinetSubscription | null> => {
    const res = await apiClient.get<CabinetSubscription | null>(`/admin/cabinets/${cabinetId}/subscription`)
    return res.data
  },

  getCabinetSubscriptionHistory: async (cabinetId: string): Promise<CabinetSubscription[]> => {
    const res = await apiClient.get<CabinetSubscription[]>(`/admin/cabinets/${cabinetId}/subscriptions`)
    return res.data
  },

  updateCabinetSubscriptionLimits: async (
    cabinetId: string,
    data: { priceInCents?: number | null; maxMembers?: number | null; maxDemands?: number | null; maxStorageBytes?: number | null },
  ): Promise<CabinetSubscription> => {
    const res = await apiClient.patch<CabinetSubscription>(`/admin/cabinets/${cabinetId}/subscription/limits`, data)
    return res.data
  },

  upsertCabinetSubscription: async (cabinetId: string, planId: string): Promise<CabinetSubscription> => {
    const res = await apiClient.patch<CabinetSubscription>(`/admin/cabinets/${cabinetId}/subscription`, { planId })
    return res.data
  },

  getCabinetOverrides: async (cabinetId: string): Promise<CabinetOverride[]> => {
    const res = await apiClient.get<CabinetOverride[]>(`/admin/cabinets/${cabinetId}/overrides`)
    return res.data
  },

  addCabinetOverride: async (cabinetId: string, data: AddOverrideRequest): Promise<CabinetOverride[]> => {
    const res = await apiClient.post<CabinetOverride[]>(`/admin/cabinets/${cabinetId}/overrides`, data)
    return res.data
  },

  removeCabinetOverride: async (cabinetId: string, featureSlug: string): Promise<void> => {
    await apiClient.delete(`/admin/cabinets/${cabinetId}/overrides/${featureSlug}`)
  },
}
