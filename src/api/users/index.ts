import { apiClient } from "..";
import { UserRole } from "./types";

const baseURL = "/users";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  phone?: string;
  isCabinetMember?: boolean;
  termsAcceptedAt?: string | Date;
  disabledAt?: string | null;
}

export const UsersApi = {
  list: async (params: { page: number; limit: number; search?: string; role?: UserRole; showInactive?: boolean }): Promise<{ items: User[]; total: number }> => {
    const response = await apiClient.get<{ items: User[]; total: number }>(baseURL, { params });
    return response.data;
  },

  getById: async (id: string): Promise<User> => {
    const response = await apiClient.get<User>(`${baseURL}/${id}`);
    return response.data;
  },

  updateProfile: async (id: string, data: Partial<User> & { removeAvatar?: boolean }, file?: File): Promise<User> => {
    const formData = new FormData();
    if (data.name) formData.append("name", data.name);
    if (data.phone) formData.append("phone", data.phone);
    if (data.termsAcceptedAt) {
      formData.append("termsAcceptedAt", typeof data.termsAcceptedAt === 'string' ? data.termsAcceptedAt : data.termsAcceptedAt.toISOString());
    }
    if (data.removeAvatar) formData.append("removeAvatar", "true");
    if (file) formData.append("avatar", file);

    const response = await apiClient.patch<User>(`${baseURL}/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};
