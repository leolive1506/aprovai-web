export interface Category {
  id: string;
  name: string;
}

export interface ListCategoriesParams {
  page?: number;
  limit?: number;
  enabled?: boolean;
}
