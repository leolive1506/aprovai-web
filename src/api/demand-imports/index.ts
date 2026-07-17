import { apiClient } from "..";
import type { PaginatedResponse } from "@/api/demands/types";
import type { CreateDemandImportParams, DemandImportJob, ListDemandImportsParams } from "./types";

export const DemandImportsApi = {
  create: async ({ slug, visibility, file }: CreateDemandImportParams): Promise<DemandImportJob> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("visibility", visibility);

    const response = await apiClient.post<DemandImportJob>(
      `/cabinets/${slug}/demand-imports`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response.data;
  },

  getStatus: async (slug: string, id: string): Promise<DemandImportJob> => {
    const response = await apiClient.get<DemandImportJob>(`/cabinets/${slug}/demand-imports/${id}/status`);
    return response.data;
  },

  list: async ({ slug, page, limit }: ListDemandImportsParams): Promise<PaginatedResponse<DemandImportJob>> => {
    const response = await apiClient.get<PaginatedResponse<DemandImportJob>>(
      `/cabinets/${slug}/demand-imports`,
      { params: { page, limit } },
    );
    return response.data;
  },

  downloadTemplateUrl: (slug: string): string => {
    const base = (apiClient.defaults.baseURL ?? "").replace(/\/$/, "");
    return `${base}/cabinets/${slug}/demand-imports/template`;
  },
};
