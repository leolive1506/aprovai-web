import { apiClient } from "..";
import type { Cabinet, CabinetInvitation, CabinetInvitationDetails, CabinetMember, CabinetMetrics, CabinetSection, CabinetTrendDetailedPoint, CabinetTrendPoint } from "./types";
import type { CabinetUsage } from "@/api/plans/types";

const baseURL = "/cabinets";

export interface PaginatedCabinetsResponse {
  items: Cabinet[];
  total: number;
}

export const CabinetsApi = {
  me: async (): Promise<Cabinet | null> => {
    const response = await apiClient.get<Cabinet[]>(`${baseURL}/me`);
    return response.data[0] ?? null;
  },

  list: async (): Promise<Cabinet[]> => {
    const response = await apiClient.get(baseURL);
    const data = response.data;
    if (Array.isArray(data)) return data;
    if (data?.items && Array.isArray(data.items)) return data.items;
    return [];
  },

  listPaginated: async (params: {
    page: number;
    limit: number;
    search?: string;
    hasDemands?: boolean;
  }): Promise<PaginatedCabinetsResponse> => {
    const response = await apiClient.get<PaginatedCabinetsResponse>(baseURL, { params });
    return response.data;
  },

  getBySlug: async (slug: string): Promise<Cabinet> => {
    const response = await apiClient.get<Cabinet>(`${baseURL}/${slug}`);
    return response.data;
  },

  getMembers: async (slug: string): Promise<CabinetMember[]> => {
    const response = await apiClient.get<CabinetMember[]>(`/cabinets/${slug}/members`);
    return Array.isArray(response.data) ? response.data : [];
  },

  getMetrics: async (slug: string): Promise<CabinetMetrics> => {
    const response = await apiClient.get<CabinetMetrics>(`/demands/cabinet/${slug}/metrics`);
    return response.data;
  },

  getTrend: async (slug: string, days = 14): Promise<CabinetTrendPoint[]> => {
    const response = await apiClient.get<CabinetTrendPoint[]>(`/demands/cabinet/${slug}/trend`, {
      params: { days },
    });
    return response.data;
  },

  getTrendDetailed: async (slug: string, days = 14): Promise<CabinetTrendDetailedPoint[]> => {
    const response = await apiClient.get<CabinetTrendDetailedPoint[]>(
      `/demands/cabinet/${slug}/trend-detailed`,
      { params: { days } },
    );
    return response.data;
  },

  getInvitationByToken: async (token: string): Promise<CabinetInvitationDetails> => {
    const response = await apiClient.get<CabinetInvitationDetails>(
      `${baseURL}/invites/${token}`,
    );
    return response.data;
  },

  acceptInvitation: async (token: string): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>(
      `${baseURL}/invites/${token}/accept`,
    );
    return response.data;
  },

  inviteMember: async (
    slug: string,
    data: { email: string; role: "OWNER" | "STAFF" },
  ): Promise<{ message: string }> => {
    const response = await apiClient.post(`${baseURL}/${slug}/invites`, data);
    return response.data;
  },

  listInvitations: async (slug: string): Promise<CabinetInvitation[]> => {
    const response = await apiClient.get<CabinetInvitation[]>(`${baseURL}/${slug}/invites`);
    return Array.isArray(response.data) ? response.data : [];
  },

  cancelInvitation: async (id: string): Promise<void> => {
    await apiClient.delete(`${baseURL}/invites/${id}`);
  },

  removeMember: async (slug: string, userId: string): Promise<void> => {
    await apiClient.delete(`${baseURL}/${slug}/members/${userId}`);
  },

  updateMemberRole: async (
    slug: string,
    userId: string,
    role: "OWNER" | "STAFF",
  ): Promise<CabinetMember> => {
    const response = await apiClient.patch<CabinetMember>(
      `${baseURL}/${slug}/members/${userId}`,
      { role },
    );
    return response.data;
  },

  update: async (
    slug: string,
    data: Partial<Cabinet>,
    avatarFile?: File,
    bannerFile?: File,
    logoFile?: File,
    biographyPhotoFile?: File,
  ): Promise<Cabinet> => {
    const formData = new FormData();
    if (data.name) formData.append("name", data.name);
    if (data.description !== undefined) formData.append("description", data.description ?? "");
    if (data.email !== undefined) formData.append("email", data.email ?? "");
    if (data.accentColor !== undefined) formData.append("accentColor", data.accentColor ?? "");
    if (data.tagline !== undefined) formData.append("tagline", data.tagline ?? "");
    if (data.postDemandMessage !== undefined) formData.append("postDemandMessage", data.postDemandMessage ?? "");
    if (data.instagramUrl !== undefined) formData.append("instagramUrl", data.instagramUrl ?? "");
    if (data.facebookUrl !== undefined) formData.append("facebookUrl", data.facebookUrl ?? "");
    if (data.websiteUrl !== undefined) formData.append("websiteUrl", data.websiteUrl ?? "");
    if (data.twitterUrl !== undefined) formData.append("twitterUrl", data.twitterUrl ?? "");
    if (data.whatsappUrl !== undefined) formData.append("whatsappUrl", data.whatsappUrl ?? "");
    if (data.youtubeUrl !== undefined) formData.append("youtubeUrl", data.youtubeUrl ?? "");
    if (data.tiktokUrl !== undefined) formData.append("tiktokUrl", data.tiktokUrl ?? "");
    if (data.heroTitle !== undefined) formData.append("heroTitle", data.heroTitle ?? "");
    if (data.heroSubtitle !== undefined) formData.append("heroSubtitle", data.heroSubtitle ?? "");
    if (data.heroVideoUrl !== undefined) formData.append("heroVideoUrl", data.heroVideoUrl ?? "");
    if (data.biographyContent !== undefined) formData.append("biographyContent", data.biographyContent ?? "");
    if (avatarFile) formData.append("avatar", avatarFile);
    if (bannerFile) formData.append("banner", bannerFile);
    if (logoFile) formData.append("logo", logoFile);
    if (biographyPhotoFile) formData.append("biographyPhoto", biographyPhotoFile);

    const response = await apiClient.patch<Cabinet>(`${baseURL}/${slug}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  getUsage: async (slug: string): Promise<CabinetUsage> => {
    const response = await apiClient.get<CabinetUsage>(`/cabinets/${slug}/usage`);
    return response.data;
  },

  getSections: async (slug: string): Promise<CabinetSection[]> => {
    const response = await apiClient.get<CabinetSection[]>(`/cabinets/${slug}/sections`);
    return response.data;
  },

  updateSections: async (slug: string, sections: CabinetSection[]): Promise<CabinetSection[]> => {
    const response = await apiClient.put<CabinetSection[]>(`/cabinets/${slug}/sections`, { sections });
    return response.data;
  },

};
