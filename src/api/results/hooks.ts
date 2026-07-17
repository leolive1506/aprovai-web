import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ResultsApi } from "."
import type { CreateResultRequest } from "./types"

export function useDeleteResult(demandId?: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => ResultsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["results", { demandId }] })
      queryClient.invalidateQueries({ queryKey: ["demands"] })
      queryClient.invalidateQueries({ queryKey: ["demands-infinite"] })
      queryClient.invalidateQueries({ queryKey: ["my-demands"] })
      queryClient.invalidateQueries({ queryKey: ["cabinet-usage"] })
    },
  })
}

export function useGetDemandResults(demandId: string | undefined) {
  return useQuery({
    queryKey: ["results", { demandId }],
    queryFn: () => ResultsApi.list({ demandId, limit: 20 }),
    enabled: !!demandId,
  })
}

export function useCreateResult() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateResultRequest) => ResultsApi.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["results", { demandId: variables.demandId }],
      })
      queryClient.invalidateQueries({ queryKey: ["cabinet-usage"] })
    },
  })
}

export function useUploadResultProtocol(demandId?: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      ResultsApi.uploadProtocol(id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["results", { demandId }] })
      queryClient.invalidateQueries({ queryKey: ["cabinet-usage"] })
    },
  })
}
