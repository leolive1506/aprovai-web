import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { usePageTitle } from "@/hooks/use-page-title"
import { useListUserNeighborhoods } from "@/api/neighborhood/hooks"
import { NeighborhoodSetup } from "./components/neighborhood-setup"
import { NeighborhoodDashboard } from "./components/neighborhood-dashboard"

export function MyNeighborhood() {
  const { setTitle } = usePageTitle()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    setTitle({ title: "Meu Bairro", description: "Demandas e atividade na sua região" })
  }, [setTitle])

  const { data: neighborhoods, isLoading } = useListUserNeighborhoods()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!neighborhoods?.length) {
    return <NeighborhoodSetup />
  }

  return (
    <NeighborhoodDashboard
      neighborhoods={neighborhoods}
      selectedId={selectedId}
      onSelect={setSelectedId}
    />
  )
}
