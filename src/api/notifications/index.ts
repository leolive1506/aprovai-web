import { apiClient } from "..";

export type NotificationType = "INFO" | "SUCCESS" | "WARNING" | "ERROR";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  link: string | null;
  readAt: string | null;
  createdAt: string;
  userId: string;
}

export interface ListNotificationsParams {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

export interface ListNotificationsResponse {
  items: Notification[];
  total: number;
}

export const NotificationsApi = {
  list: async (params?: ListNotificationsParams): Promise<ListNotificationsResponse> => {
    const response = await apiClient.get("/notifications", { params });
    return response.data;
  },

  markAsRead: async (id: string): Promise<void> => {
    await apiClient.patch(`/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.patch("/notifications/read-all");
  },
};
