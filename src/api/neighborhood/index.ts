import { apiClient } from "@/api"
import type {
  CreateNeighborhoodPayload,
  NeighborhoodDashboard,
  UserNeighborhood,
} from "./types"

const BASE = "/users/me/neighborhoods"

export const NeighborhoodApi = {
  async list(): Promise<UserNeighborhood[]> {
    const { data } = await apiClient.get<UserNeighborhood[]>(BASE)
    return data
  },

  async add(payload: CreateNeighborhoodPayload): Promise<UserNeighborhood> {
    const { data } = await apiClient.post<UserNeighborhood>(BASE, payload)
    return data
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`${BASE}/${id}`)
  },

  async setPrimary(id: string): Promise<UserNeighborhood[]> {
    const { data } = await apiClient.patch<UserNeighborhood[]>(
      `${BASE}/${id}/primary`,
    )
    return data
  },

  async getDashboard(
    neighborhood: string,
    city: string,
    state: string,
  ): Promise<NeighborhoodDashboard> {
    const { data } = await apiClient.get<NeighborhoodDashboard>(
      "/demands/neighborhood",
      { params: { neighborhood, city, state } },
    )
    return data
  },
}
