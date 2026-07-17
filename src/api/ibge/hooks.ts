import { useQuery } from "@tanstack/react-query"
import { IbgeApi } from "."

export function useGetStates() {
  return useQuery({
    queryKey: ["ibge-states"],
    queryFn: () => IbgeApi.getState(),
  })
}

export function useGetCitiesFromState(stateId: string) {
  return useQuery({
    queryKey: ["ibge-cities", stateId],
    queryFn: () => IbgeApi.getCitiesFromState(stateId),
    enabled: !!stateId,
  })
}
