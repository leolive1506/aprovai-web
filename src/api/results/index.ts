import { apiClient } from ".."
import type {
  CreateResultRequest,
  ListResultsParams,
  PaginatedResults,
  Result,
} from "./types"

export const ResultsApi = {
  async create(data: CreateResultRequest): Promise<Result> {
    const formData = new FormData()
    formData.append("title", data.title)
    formData.append("description", data.description)
    formData.append("type", data.type)
    formData.append("cabinetSlug", data.cabinetSlug)
    if (data.demandId) formData.append("demandId", data.demandId)
    if (data.images) {
      for (const file of data.images) {
        formData.append("images", file)
      }
    }
    if (data.protocol) formData.append("protocol", data.protocol)
    const response = await apiClient.post<Result>("/results", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return response.data
  },

  async uploadProtocol(id: string, file: File): Promise<Result> {
    const formData = new FormData()
    formData.append("protocol", file)
    const response = await apiClient.post<Result>(`/results/${id}/protocol`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return response.data
  },

  async list(params: ListResultsParams): Promise<PaginatedResults> {
    const response = await apiClient.get<PaginatedResults>("/results", { params })
    return response.data
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/results/${id}`)
  },
}
