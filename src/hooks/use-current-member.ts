import { useGetCabinetMembers } from "@/api/cabinets/hooks"
import { useAuth } from "@/hooks/use-auth"
import { useMemo } from "react"

export function useCurrentMember() {
  const { cabinet, user } = useAuth()
  const { data: members = [], isLoading } = useGetCabinetMembers(cabinet?.slug)
  const currentMember = useMemo(
    () => members.find((m) => m.userId === user?.id) ?? null,
    [members, user?.id],
  )
  return { currentMember, isLoading }
}
