import { useMutation, useQuery } from "@tanstack/react-query";
import { NotificationsApi, type ListNotificationsParams } from ".";
import { queryClient } from "../queryClient";

const NOTIFICATIONS_KEY = "notifications";

export function useNotifications(params?: ListNotificationsParams) {
  return useQuery({
    queryKey: [NOTIFICATIONS_KEY, params],
    queryFn: () => NotificationsApi.list(params),
  });
}

export function useMarkAsRead() {
  return useMutation({
    mutationFn: (id: string) => NotificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY] });
    },
  });
}

export function useMarkAllAsRead() {
  return useMutation({
    mutationFn: () => NotificationsApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY] });
    },
  });
}
