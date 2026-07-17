import { useMutation, useQuery } from "@tanstack/react-query";
import { UsersApi, type User } from ".";
import { queryClient } from "../queryClient";
import type { UserRole } from "./types";

export function useGetUserById(id: string | undefined) {
  return useQuery({
    queryKey: ["user", id],
    queryFn: () => UsersApi.getById(id!),
    enabled: !!id,
  });
}

export function useUpdateUser() {
  return useMutation({
    mutationFn: ({ id, data, file }: { id: string; data: Partial<User> & { removeAvatar?: boolean }; file?: File }) =>
      UsersApi.updateProfile(id, data, file),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["user", variables.id] });
    },
  });
}

export function useGetUsersPaginated(params: {
  page: number
  limit: number
  search?: string
  role?: UserRole
  showInactive?: boolean
}) {
  return useQuery({
    queryKey: ["users", "paginated", params],
    queryFn: () => UsersApi.list(params),
  })
}
