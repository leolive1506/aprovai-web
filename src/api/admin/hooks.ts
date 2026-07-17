import { useMutation, useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { queryClient } from "../queryClient"
import {
  AdminApi,
  type CreateAdminUserRequest,
  type CreateCabinetWithOwnerRequest,
  type UpdateAdminUserRequest,
} from "@/api/admin"

export function useAdminCreateCabinetWithOwner() {
  return useMutation({
    mutationFn: (data: CreateCabinetWithOwnerRequest) =>
      AdminApi.createCabinetWithOwner(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cabinets"] })
      toast.success("Gabinete criado com sucesso!")
    },
  })
}

export function useAdminUpdateCabinet() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateCabinetWithOwnerRequest }) =>
      AdminApi.updateCabinet(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cabinets"] })
      toast.success("Gabinete atualizado com sucesso!")
    },
  })
}

export function useAdminDeleteCabinet() {
  return useMutation({
    mutationFn: (id: string) => AdminApi.deleteCabinet(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cabinets"] })
      toast.success("Gabinete desativado com sucesso!")
    },
  })
}

export function useAdminCreateUser() {
  return useMutation({
    mutationFn: (data: CreateAdminUserRequest) => AdminApi.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      toast.success("Usuário criado com sucesso!")
    },
  })
}

export function useAdminUpdateUser() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAdminUserRequest }) =>
      AdminApi.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      toast.success("Usuário atualizado com sucesso!")
    },
  })
}

export function useAdminListReportedDemands(params: { page: number; limit: number }) {
  return useQuery({
    queryKey: ["admin-reported-demands", params],
    queryFn: () => AdminApi.listReportedDemands(params),
    placeholderData: (prev) => prev,
  })
}

export function useAdminListReportReasons(demandId: string | null, params: { page: number; limit: number }) {
  return useQuery({
    queryKey: ["admin-report-reasons", demandId, params],
    queryFn: () => AdminApi.listReportReasons(demandId!, params),
    enabled: !!demandId,
  })
}

export function useAdminDismissDemandReports() {
  return useMutation({
    mutationFn: (demandId: string) => AdminApi.dismissDemandReports(demandId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reported-demands"] })
      queryClient.invalidateQueries({ queryKey: ["admin-report-reasons"] })
      toast.success("Denúncias ignoradas. Novos reportes estão bloqueados.")
    },
  })
}

export function useAdminDeleteDemand() {
  return useMutation({
    mutationFn: (demandId: string) => AdminApi.adminDeleteDemand(demandId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reported-demands"] })
      toast.success("Demanda excluída com sucesso.")
    },
  })
}

export function useAdminDisableUser() {
  return useMutation({
    mutationFn: (userId: string) => AdminApi.disableUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })
}

export function useAdminEnableUser() {
  return useMutation({
    mutationFn: (userId: string) => AdminApi.enableUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })
}

export function useAdminGetCabinetsPaginated(params: {
  page: number
  limit: number
  search?: string
  hasDemands?: boolean
  showInactive?: boolean
}) {
  return useQuery({
    queryKey: ["admin-cabinets", params],
    queryFn: () => AdminApi.listCabinetsPaginated(params),
    placeholderData: (prev) => prev,
  })
}

export function useAdminDisableCabinet() {
  return useMutation({
    mutationFn: (id: string) => AdminApi.deleteCabinet(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-cabinets"] })
    },
  })
}

export function useAdminEnableCabinet() {
  return useMutation({
    mutationFn: (id: string) => AdminApi.enableCabinet(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-cabinets"] })
    },
  })
}
