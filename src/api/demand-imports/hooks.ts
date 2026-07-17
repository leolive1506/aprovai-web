import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/utils";
import { DemandImportsApi } from ".";
import type { CreateDemandImportParams } from "./types";

export function useCreateDemandImport() {
  return useMutation({
    mutationFn: (params: CreateDemandImportParams) => DemandImportsApi.create(params),
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}

const ACTIVE_STATUSES = ["PENDING", "PROCESSING"];

export function useDemandImportStatus(slug: string | undefined, id: string | undefined) {
  return useQuery({
    queryKey: ["demand-import-status", slug, id],
    queryFn: () => DemandImportsApi.getStatus(slug!, id!),
    enabled: !!slug && !!id,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status && ACTIVE_STATUSES.includes(status) ? 2000 : false;
    },
  });
}

export function useDemandImportsList(slug: string | undefined, page = 1, limit = 10) {
  return useQuery({
    queryKey: ["demand-imports", slug, page, limit],
    queryFn: () => DemandImportsApi.list({ slug: slug!, page, limit }),
    enabled: !!slug,
  });
}
