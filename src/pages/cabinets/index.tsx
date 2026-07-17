import { useGetCabinets } from "@/api/cabinets/hooks"
import { Loading } from "@/components/loading"
import { Input } from "@/components/ui/input"
import { Search, Users } from "lucide-react"
import { useMemo, useState } from "react"
import { CabinetListItem } from "./components/cabinet-list-item"

export function Cabinets() {
  const [search, setSearch] = useState("")
  const { data: cabinets, isLoading } = useGetCabinets()

  const filtered = useMemo(() => {
    if (!search.trim()) return cabinets ?? []
    const q = search.toLowerCase()
    return (cabinets ?? []).filter(
      (c) => c.name.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q),
    )
  }, [cabinets, search])

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Gabinetes</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Classificados por pontuação e demandas resolvidas
          </p>
        </div>
        {!isLoading && cabinets && (
          <span className="text-sm text-muted-foreground tabular-nums">{cabinets.length} ativos</span>
        )}
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar gabinete..."
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loading className="text-primary size-5" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
          <div className="size-10 rounded-lg bg-muted flex items-center justify-center">
            <Users className="size-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              {search ? `Nenhum resultado para "${search}"` : "Nenhum gabinete encontrado"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Tente buscar por outro nome.</p>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden divide-y divide-border/60">
          {filtered.map((cabinet, i) => (
            <CabinetListItem key={cabinet.id} cabinet={cabinet} rank={i + 1} />
          ))}
        </div>
      )}
    </div>
  )
}
