import { apiClient } from "..";
import type { Category, ListCategoriesParams } from "./types";
import type { PaginatedResponse } from "@/api/demands/types";

const baseURL = "/categories";

export const CategoriesApi = {
  getCategories: async (
    params?: ListCategoriesParams
  ): Promise<PaginatedResponse<Category>> => {
    const response = await apiClient.get<PaginatedResponse<Category>>(baseURL, {
      params: {
        page: params?.page ?? 1,
        limit: params?.limit ?? 10,
      },
    });
    return response.data;
  },
};
