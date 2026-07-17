import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CabinetsApi } from ".";
import type { Cabinet, CabinetSection } from "./types";
import { queryClient } from "../queryClient";

export function useGetCabinets() {
  return useQuery({
    queryKey: ["cabinets"],
    queryFn: CabinetsApi.list,
  });
}

export function useGetCabinetsPaginated(params: {
  page: number;
  limit: number;
  search?: string;
  hasDemands?: boolean;
}) {
  return useQuery({
    queryKey: ["cabinets", "paginated", params],
    queryFn: () => CabinetsApi.listPaginated(params),
  });
}

export function useGetCabinetBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ["cabinet", slug],
    queryFn: () => CabinetsApi.getBySlug(slug!),
    enabled: !!slug,
  });
}

export function useGetCabinetMembers(slug: string | undefined) {
  return useQuery({
    queryKey: ["cabinet-members", slug],
    queryFn: () => CabinetsApi.getMembers(slug!),
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
  });
}

export function useGetCabinetMetrics(slug: string | undefined) {
  return useQuery({
    queryKey: ["cabinet-metrics", slug],
    queryFn: () => CabinetsApi.getMetrics(slug!),
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
  });
}

export function useGetCabinetTrend(slug: string | undefined, days = 14) {
  return useQuery({
    queryKey: ["cabinet-trend", slug, days],
    queryFn: () => CabinetsApi.getTrend(slug!, days),
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
  });
}

export function useGetCabinetTrendDetailed(slug: string | undefined, days = 14) {
  return useQuery({
    queryKey: ["cabinet-trend-detailed", slug, days],
    queryFn: () => CabinetsApi.getTrendDetailed(slug!, days),
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateCabinet() {
  return useMutation({
    mutationFn: ({
      slug,
      data,
      file,
      bannerFile,
      logoFile,
      biographyPhotoFile,
    }: {
      slug: string;
      data: Partial<Cabinet>;
      file?: File;
      bannerFile?: File;
      logoFile?: File;
      biographyPhotoFile?: File;
    }) => CabinetsApi.update(slug, data, file, bannerFile, logoFile, biographyPhotoFile),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["cabinet", variables.slug] });
      queryClient.invalidateQueries({ queryKey: ["cabinets"] });
      queryClient.invalidateQueries({ queryKey: ["cabinet-usage"] });
    },
  });
}

export function useGetInvitationByToken(token: string | undefined) {
  return useQuery({
    queryKey: ["cabinet-invite-token", token],
    queryFn: () => CabinetsApi.getInvitationByToken(token!),
    enabled: !!token,
    retry: false,
  });
}

export function useAcceptInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (token: string) => CabinetsApi.acceptInvitation(token),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cabinets"] });
    },
  });
}

export function useListCabinetInvitations(slug: string | undefined) {
  return useQuery({
    queryKey: ["cabinet-invitations", slug],
    queryFn: () => CabinetsApi.listInvitations(slug!),
    enabled: !!slug,
    staleTime: 1000 * 30,
  });
}

export function useInviteMember(slug: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { email: string; role: "OWNER" | "STAFF" }) =>
      CabinetsApi.inviteMember(slug!, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cabinet-invitations", slug] });
    },
  });
}

export function useCancelInvitation(slug: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => CabinetsApi.cancelInvitation(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cabinet-invitations", slug] });
    },
  });
}

export function useRemoveMember(slug: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => CabinetsApi.removeMember(slug!, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cabinet-members", slug] });
    },
  });
}

export function useUpdateMemberRole(slug: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: "OWNER" | "STAFF" }) =>
      CabinetsApi.updateMemberRole(slug!, userId, role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cabinet-members", slug] });
    },
  });
}

export function useCabinetUsage(slug: string | undefined) {
  return useQuery({
    queryKey: ["cabinet-usage", slug],
    queryFn: () => CabinetsApi.getUsage(slug!),
    enabled: !!slug,
    staleTime: 30 * 1000,
  })
}

export function useGetCabinetSections(slug: string | undefined) {
  return useQuery({
    queryKey: ["cabinet-sections", slug],
    queryFn: () => CabinetsApi.getSections(slug!),
    enabled: !!slug,
  });
}

export function useUpdateCabinetSections() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, sections }: { slug: string; sections: CabinetSection[] }) =>
      CabinetsApi.updateSections(slug, sections),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["cabinet-sections", variables.slug] });
    },
  });
}

