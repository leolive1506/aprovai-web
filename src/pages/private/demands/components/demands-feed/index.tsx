import { useGetDemands } from "@/api/demands/hooks"
import { Separator } from "@/components/ui/separator"
import { PencilLineIcon } from "lucide-react"
import { useState } from "react"
import { DemandCard } from "../demand-card"
import { DemandsFilterV2, type DemandsFilterValue } from "../demands-filter-v2"
import { DialogDemandForm } from "../dialog-demand-form"


function EmptyState({ search }: { search: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="size-12 rounded-xl bg-muted flex items-center justify-center mb-3">
        <PencilLineIcon className="size-5 text-muted-foreground" />
      </div>
      <p className="text-sm font-semibold text-foreground">
        {search ? `Nenhum resultado para "${search}"` : "Nenhuma demanda encontrada"}
      </p>
      <p className="text-xs text-muted-foreground mt-1 max-w-56 leading-relaxed">
        Ajuste os filtros ou registre uma nova demanda.
      </p>
    </div>
  )
}

export function DemandsFeed() {
  const [filters, setFilters] = useState<DemandsFilterValue>({
    search: "",
    status: [],
    categories: [],
    priority: null,
    dateRange: undefined,
  })

  const { data, isLoading } = useGetDemands({
    search: filters.search.trim() || undefined,
    priority: filters.priority ?? undefined,
    statuses: filters.status.length > 0 ? filters.status : undefined,
    categories: filters.categories.length > 0 ? filters.categories : undefined,
    startDate: filters.dateRange?.from?.toISOString(),
    endDate: filters.dateRange?.to?.toISOString(),
    limit: 100,
  })

  const demands = data?.items ?? []

  return (
    <div className="max-w-4xl mx-auto md:flex items-start gap-6">
      <DemandsFilterV2 value={filters} onChange={setFilters} resultCount={demands.length} />

      <Separator className="my-4 md:hidden" />

      <div className="flex-1 flex flex-col gap-4 mt-4">
        <DialogDemandForm />

        {isLoading ? (
          <div className="flex justify-center py-24 text-sm text-muted-foreground">Carregando...</div>
        ) : demands.length === 0 ? (
          <EmptyState search={filters.search} />
        ) : (
          demands.map((demand) => (
            <DemandCard key={demand.id} demand={demand} />
          ))
        )}
      </div>
    </div>
  )
}
