import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { DemandsApi } from ".";
import { queryClient } from "../queryClient";
import { DemandStatus, type CreateDemandCommentProps, type CreateDemandProps, type Demand, type GetCabinetReportParams, type ListDemandCommentsParams, type ListDemandsByCabinetSlugParams, type ListDemandsParams } from "./types";

export function useGetCabinetDashboardSummary(slug?: string) {
  return useQuery({
    queryKey: ["cabinet-dashboard-summary", slug],
    queryFn: () => DemandsApi.getDashboardSummary(slug!),
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
  });
}

export function useGetHeatmap(params?: { city?: string; state?: string }) {
  return useQuery({
    queryKey: ["demands-heatmap", params],
    queryFn: () => DemandsApi.getHeatmap(params),
    staleTime: 1000 * 60 * 5,
    select: (data) => ({
      points: Array.isArray(data?.points) ? data.points : [],
      insight: data?.insight ?? null,
    }),
  });
}

export function useGetNeighborhoods() {
  return useQuery({
    queryKey: ["demands-neighborhoods"],
    queryFn: DemandsApi.getNeighborhoods,
    staleTime: 1000 * 60 * 10,
  });
}


export function useGetDemandById({ id }: { id: string }) {
  return useQuery({
    queryKey: ["demands", id],
    queryFn: () => DemandsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateDemand() {
  return useMutation({
    mutationFn: (data: CreateDemandProps) => DemandsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cabinet-usage"] })
    },
  });
}

export function useGetDemands(params: ListDemandsParams) {
  return useQuery({
    queryKey: ["demands", params],
    queryFn: () => DemandsApi.list(params),
    placeholderData: (previousData) => previousData,
    staleTime: 0,
  });
}

export function useGetDemandsByCabinetSlug(params: ListDemandsByCabinetSlugParams & { enabled?: boolean }) {
  const { enabled = true, ...queryParams } = params
  return useQuery({
    queryKey: ["demands", queryParams],
    queryFn: () => DemandsApi.listDemandsByCabinetSlug(queryParams),
    placeholderData: (previousData) => previousData,
    enabled: enabled && !!queryParams.slug,
  });
}

export function useInfiniteGetDemands(params: Omit<ListDemandsParams, "page">) {
  return useInfiniteQuery({
    queryKey: ["demands-infinite", params],
    queryFn: ({ pageParam }) => DemandsApi.list({ ...params, page: pageParam as number }),
    initialPageParam: 1,
    staleTime: 0,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.meta;
      return page < totalPages ? page + 1 : undefined;
    },
  });
}

export function useUpdateDemandStatus() {
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: DemandStatus }) =>
      DemandsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["demands"] });
    },
  });
}

export function useUpdateDemand() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Demand> }) =>
      DemandsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["demands"] });
    },
  });
}

export function useAddEvidences() {
  return useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      DemandsApi.addEvidences(id, formData),
  });
}

export function useGeneratePresignedUploadUrl() {
  return useMutation({
    mutationFn: ({ demandId, filename }: { demandId: string; filename: string }) =>
      DemandsApi.generatePresignedUploadUrl(demandId, filename),
  });
}

export function useUploadToR2() {
  return useMutation({
    mutationFn: ({ uploadUrl, file }: { uploadUrl: string; file: File }) =>
      DemandsApi.uploadToR2(uploadUrl, file),
  });
}

export function useLikeDemand() {
  return useMutation({
    mutationFn: (id: string) => DemandsApi.like(id),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["demands"] }),
        queryClient.invalidateQueries({ queryKey: ["demands", variables] }),
        queryClient.invalidateQueries({ queryKey: ["demands-infinite"] }),
      ])
    },
  });
}

export function useConfirmEvidenceUpload() {
  return useMutation({
    mutationFn: ({ demandId, storageKey, size }: { demandId: string; storageKey: string; size: number }) =>
      DemandsApi.confirmEvidenceUpload(demandId, storageKey, size),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["demands"] });
      queryClient.invalidateQueries({ queryKey: ["demands-infinite"] });
      queryClient.invalidateQueries({ queryKey: ["cabinet-usage"] });
    },
  });
}

export function useListDemandComments(params: ListDemandCommentsParams) {
  return useQuery({
    queryKey: ["comments", params],
    queryFn: () => DemandsApi.listDemandComments(params),
    enabled: !!params.demandId,
  });
}


export function useCreateDemandComment() {
  return useMutation({
    mutationFn: (data: CreateDemandCommentProps) => DemandsApi.createDemandComment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
  });
}

export function useClaimDemand() {
  return useMutation({
    mutationFn: (id: string) => DemandsApi.claim(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["demands"] });
      queryClient.invalidateQueries({ queryKey: ["demands-infinite"] });
    },
  });
}

export function useUnlinkDemand() {
  return useMutation({
    mutationFn: (id: string) => DemandsApi.unlink(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["demands"] });
      queryClient.invalidateQueries({ queryKey: ["demands-infinite"] });
    },
  });
}

export function useUpdateDemandProgress() {
  return useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: DemandStatus; note?: string }) =>
      DemandsApi.updateProgress(id, status, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["demands"] });
      queryClient.invalidateQueries({ queryKey: ["demands-infinite"] });
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
  });
}

export function useAssignDemand() {
  return useMutation({
    mutationFn: ({ id, assigneeMemberId }: { id: string; assigneeMemberId: string }) =>
      DemandsApi.assign(id, assigneeMemberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["demands"] });
      queryClient.invalidateQueries({ queryKey: ["demands-infinite"] });
    },
  });
}

export function useGetMyDemands(params: Omit<ListDemandsParams, "page"> & { enabled?: boolean } = {}) {
  const { enabled = true, ...queryParams } = params
  return useInfiniteQuery({
    queryKey: ["my-demands", queryParams],
    queryFn: ({ pageParam }) => DemandsApi.getMyDemands({ ...queryParams, page: pageParam as number }),
    initialPageParam: 1,
    enabled,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.meta;
      return page < totalPages ? page + 1 : undefined;
    },
  });
}

export function useGetCabinetReport(params: GetCabinetReportParams & { enabled?: boolean }) {
  const { enabled = true, ...queryParams } = params
  return useQuery({
    queryKey: ["cabinet-report", queryParams.slug, queryParams.startDate, queryParams.endDate],
    queryFn: () => DemandsApi.getCabinetReport(queryParams),
    enabled: enabled && !!queryParams.slug,
    staleTime: 1000 * 60 * 5,
  });
}

export function useReportDemand() {
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      DemandsApi.reportDemand(id, reason)
    });
}

export function useGetMyDemandsSummary(enabled = true) {
  return useQuery({
    queryKey: ["my-demands-summary"],
    queryFn: DemandsApi.getMyDemandsSummary,
    enabled,
    staleTime: 1000 * 60 * 2,
  });
}