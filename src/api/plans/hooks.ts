import { useMutation, useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { queryClient } from "../queryClient"
import { PlansApi } from "."
import type { AddOverrideRequest } from "./types"

export function useAdminListPlans() {
  return useQuery({
    queryKey: ["admin-plans"],
    queryFn: PlansApi.listPlans,
    staleTime: 5 * 60 * 1000,
  })
}

export function useAdminListFeatures() {
  return useQuery({
    queryKey: ["admin-features"],
    queryFn: PlansApi.listFeatures,
    staleTime: 10 * 60 * 1000,
  })
}

export function useAdminAddFeatureToPlan() {
  return useMutation({
    mutationFn: ({ planId, featureSlug, retroactive }: { planId: string; featureSlug: string; retroactive: boolean }) =>
      PlansApi.addFeatureToPlan(planId, featureSlug, retroactive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-plans"] })
      queryClient.invalidateQueries({ queryKey: ["admin-features"] })
      toast.success("Feature adicionada ao plano")
    },
    onError: () => toast.error("Erro ao adicionar feature"),
  })
}

export function useAdminRemoveFeatureFromPlan() {
  return useMutation({
    mutationFn: ({ planId, featureSlug }: { planId: string; featureSlug: string }) =>
      PlansApi.removeFeatureFromPlan(planId, featureSlug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-plans"] })
      queryClient.invalidateQueries({ queryKey: ["admin-features"] })
      toast.success("Feature removida do plano")
    },
    onError: () => toast.error("Erro ao remover feature"),
  })
}

export function useAdminCabinetSubscriptionsSummary() {
  return useQuery({
    queryKey: ["admin-cabinet-subscriptions-summary"],
    queryFn: PlansApi.getCabinetSubscriptionsSummary,
    staleTime: 5 * 60 * 1000,
  })
}

export function useAdminUpdatePlan() {
  return useMutation({
    mutationFn: ({
      planId,
      data,
    }: {
      planId: string
      data: { name?: string; priceInCents?: number; maxMembers?: number | null; maxDemands?: number | null; maxStorageBytes?: number | null }
    }) => PlansApi.updatePlan(planId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-plans"] })
      toast.success("Plano atualizado")
    },
    onError: () => toast.error("Erro ao atualizar plano"),
  })
}

export function useAdminSetPlanActive() {
  return useMutation({
    mutationFn: ({ planId, isActive }: { planId: string; isActive: boolean }) =>
      PlansApi.setPlanActive(planId, isActive),
    onSuccess: (_, { isActive }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-plans"] })
      toast.success(isActive ? "Plano ativado" : "Plano desativado")
    },
    onError: () => toast.error("Erro ao alterar status do plano"),
  })
}

export function useAdminCabinetSubscription(cabinetId: string | null) {
  return useQuery({
    queryKey: ["admin-cabinet-subscription", cabinetId],
    queryFn: () => PlansApi.getCabinetSubscription(cabinetId!),
    enabled: !!cabinetId,
  })
}

export function useAdminCabinetSubscriptionHistory(cabinetId: string | null) {
  return useQuery({
    queryKey: ["admin-cabinet-subscription-history", cabinetId],
    queryFn: () => PlansApi.getCabinetSubscriptionHistory(cabinetId!),
    enabled: !!cabinetId,
  })
}

export function useAdminUpdateCabinetSubscriptionLimits() {
  return useMutation({
    mutationFn: ({
      cabinetId,
      data,
    }: {
      cabinetId: string
      data: { priceInCents?: number | null; maxMembers?: number | null; maxDemands?: number | null; maxStorageBytes?: number | null }
    }) => PlansApi.updateCabinetSubscriptionLimits(cabinetId, data),
    onSuccess: (_, { cabinetId }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-cabinet-subscription", cabinetId] })
      queryClient.invalidateQueries({ queryKey: ["admin-cabinet-subscriptions-summary"] })
      toast.success("Limites atualizados com sucesso")
    },
    onError: () => toast.error("Erro ao atualizar limites"),
  })
}

export function useAdminUpsertCabinetSubscription() {
  return useMutation({
    mutationFn: ({ cabinetId, planId }: { cabinetId: string; planId: string }) =>
      PlansApi.upsertCabinetSubscription(cabinetId, planId),
    onSuccess: (_, { cabinetId }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-cabinet-subscription", cabinetId] })
      queryClient.invalidateQueries({ queryKey: ["admin-cabinet-subscription-history", cabinetId] })
      queryClient.invalidateQueries({ queryKey: ["admin-cabinet-subscriptions-summary"] })
      toast.success("Plano atualizado com sucesso")
    },
    onError: () => toast.error("Erro ao atualizar plano"),
  })
}

export function useAdminCabinetOverrides(cabinetId: string | null) {
  return useQuery({
    queryKey: ["admin-cabinet-overrides", cabinetId],
    queryFn: () => PlansApi.getCabinetOverrides(cabinetId!),
    enabled: !!cabinetId,
  })
}

export function useAdminAddCabinetOverride() {
  return useMutation({
    mutationFn: ({ cabinetId, data }: { cabinetId: string; data: AddOverrideRequest }) =>
      PlansApi.addCabinetOverride(cabinetId, data),
    onSuccess: (_, { cabinetId }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-cabinet-overrides", cabinetId] })
      toast.success("Override adicionado com sucesso")
    },
    onError: () => toast.error("Erro ao adicionar override"),
  })
}

export function useAdminRemoveCabinetOverride() {
  return useMutation({
    mutationFn: ({ cabinetId, featureSlug }: { cabinetId: string; featureSlug: string }) =>
      PlansApi.removeCabinetOverride(cabinetId, featureSlug),
    onSuccess: (_, { cabinetId }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-cabinet-overrides", cabinetId] })
      toast.success("Override removido")
    },
    onError: () => toast.error("Erro ao remover override"),
  })
}
