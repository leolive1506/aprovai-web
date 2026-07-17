import { apiClient } from ".."
import { UserRole } from "@/api/users/types"
import type { Demand } from "@/api/demands/types"
import type { Cabinet } from "@/api/cabinets/types"

export interface CreateCabinetWithOwnerRequest {
  ownerUserId: string
  name: string
  email?: string
  description?: string
  avatarUrl?: string
}

export interface CreateCabinetWithOwnerResponse {
  cabinet: {
    id: string
    name: string
    slug: string
    email: string | null
    description: string | null
    avatarUrl: string | null
  }
  ownerUser: {
    id: string
    name: string
    email: string
    role: string
    phone: string | null
  }
  ownerMember: {
    id: string
    role: string
  }
}

export interface AdminCabinetDetailsResponse {
  cabinet: CreateCabinetWithOwnerResponse["cabinet"]
  ownerUser: CreateCabinetWithOwnerResponse["ownerUser"] | null
  ownerMember: CreateCabinetWithOwnerResponse["ownerMember"] | null
}

export interface CreateAdminUserRequest {
  name: string
  email: string
  password: string
  role: UserRole
  avatarUrl?: string
}

export interface CreateAdminUserResponse {
  id: string
  name: string
  email: string
  role: UserRole
  avatarUrl: string | null
  phone: string | null
  isVerified: boolean
  hasSetPassword: boolean
  isCabinetMember: boolean
  termsAcceptedAt: string | null
  disabledAt: string | null
}

export interface UpdateAdminUserRequest {
  name: string
  email: string
  password?: string
  role: UserRole
  avatarUrl?: string
}

export interface ReportedDemandItem {
  demand: Demand
  reportsCount: number
  firstReportedAt: string
}

export interface ReportReasonItem {
  id: string
  reason: string
  status: "PENDING" | "RESOLVED" | "DISMISSED"
  createdAt: string
  user: { id: string; name: string; avatarUrl: string | null } | null
}

export interface PaginatedAdminResponse<T> {
  items: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export const AdminApi = {
  presignCabinetAvatarUpload: async (data: {
    filename: string
    mimetype: string
  }): Promise<{ uploadUrl: string; storageKey: string; avatarUrl: string }> => {
    const response = await apiClient.post<{
      uploadUrl: string
      storageKey: string
      avatarUrl: string
    }>("/admin/cabinets/avatar/presign", data)
    return response.data
  },

  presignUserAvatarUpload: async (data: {
    filename: string
    mimetype: string
  }): Promise<{ uploadUrl: string; storageKey: string; avatarUrl: string }> => {
    const response = await apiClient.post<{
      uploadUrl: string
      storageKey: string
      avatarUrl: string
    }>("/admin/users/avatar/presign", data)
    return response.data
  },

  uploadToR2: async (uploadUrl: string, file: File): Promise<void> => {
    await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type || "image/jpeg",
      },
    })
  },

  getCabinetDetails: async (id: string): Promise<AdminCabinetDetailsResponse> => {
    const response = await apiClient.get<AdminCabinetDetailsResponse>(
      `/admin/cabinets/${id}`,
    )
    return response.data
  },

  createCabinetWithOwner: async (
    data: CreateCabinetWithOwnerRequest,
  ): Promise<CreateCabinetWithOwnerResponse> => {
    const response = await apiClient.post<CreateCabinetWithOwnerResponse>(
      "/admin/cabinets",
      data,
    )
    return response.data
  },

  updateCabinet: async (
    id: string,
    data: CreateCabinetWithOwnerRequest,
  ): Promise<AdminCabinetDetailsResponse> => {
    const response = await apiClient.patch<AdminCabinetDetailsResponse>(
      `/admin/cabinets/${id}`,
      data,
    )
    return response.data
  },

  deleteCabinet: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/cabinets/${id}`)
  },

  createUser: async (data: CreateAdminUserRequest): Promise<CreateAdminUserResponse> => {
    const response = await apiClient.post<CreateAdminUserResponse>("/admin/users", data)
    return response.data
  },

  getUserDetails: async (id: string): Promise<CreateAdminUserResponse> => {
    const response = await apiClient.get<CreateAdminUserResponse>(`/admin/users/${id}`)
    return response.data
  },

  updateUser: async (id: string, data: UpdateAdminUserRequest): Promise<CreateAdminUserResponse> => {
    const response = await apiClient.patch<CreateAdminUserResponse>(`/admin/users/${id}`, data)
    return response.data
  },

  listReportedDemands: async (params: { page: number; limit: number }): Promise<PaginatedAdminResponse<ReportedDemandItem>> => {
    const response = await apiClient.get<PaginatedAdminResponse<ReportedDemandItem>>("/admin/reports", { params })
    return response.data
  },

  listReportReasons: async (demandId: string, params: { page: number; limit: number }): Promise<PaginatedAdminResponse<ReportReasonItem>> => {
    const response = await apiClient.get<PaginatedAdminResponse<ReportReasonItem>>(`/admin/reports/${demandId}/reasons`, { params })
    return response.data
  },

  dismissDemandReports: async (demandId: string): Promise<void> => {
    await apiClient.patch(`/admin/reports/${demandId}/dismiss`)
  },

  adminDeleteDemand: async (demandId: string): Promise<void> => {
    await apiClient.delete(`/admin/demands/${demandId}`)
  },

  disableUser: async (userId: string): Promise<void> => {
    await apiClient.patch(`/admin/users/${userId}/disable`)
  },

  enableUser: async (userId: string): Promise<void> => {
    await apiClient.patch(`/admin/users/${userId}/enable`)
  },

  listCabinetsPaginated: async (params: {
    page: number
    limit: number
    search?: string
    hasDemands?: boolean
    showInactive?: boolean
  }): Promise<{ items: Cabinet[]; total: number }> => {
    const response = await apiClient.get<{ items: Cabinet[]; total: number }>("/admin/cabinets", { params })
    return response.data
  },

  enableCabinet: async (id: string): Promise<void> => {
    await apiClient.patch(`/admin/cabinets/${id}/enable`)
  },
}
