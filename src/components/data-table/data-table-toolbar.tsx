import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Table } from "@tanstack/react-table"
import { Search, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { DataTableFilterMultiple } from "./data-table-filter-multiple"
import { DataTableFilterSelect } from "./data-table-filter-select"
import { DataTableFiltersDropdown } from "./data-table-filters-dropdown"
import { DataTableViewOptions } from "./data-table-view-options"
import type { DataTableFilterField } from "./types"

const DEBOUNCE_MS = 300

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  search: string
  onSearchChange: (value: string) => void
  setParam: (key: string, value: string | null) => void
  resetFilters: () => void
  searchParams: URLSearchParams
  filterFields?: DataTableFilterField[]
  searchPlaceholder?: string
}

export function DataTableToolbar<TData>({
  table,
  search,
  onSearchChange,
  setParam,
  resetFilters,
  searchParams,
  filterFields = [],
  searchPlaceholder = "Search...",
}: DataTableToolbarProps<TData>) {
  const [localSearch, setLocalSearch] = useState(search)
  const [addedFilters, setAddedFilters] = useState<string[]>(() =>
    // initialise from URL so back-navigation restores toolbar filters
    filterFields.filter((f) => searchParams.get(f.id) !== null).map((f) => f.id)
  )
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setLocalSearch(search)
  }, [search])

  function handleSearchChange(value: string) {
    setLocalSearch(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      onSearchChange(value)
    }, DEBOUNCE_MS)
  }

  function handleAdd(fieldId: string) {
    setAddedFilters((prev) =>
      prev.includes(fieldId) ? prev : [...prev, fieldId]
    )
  }

  function handleRemove(fieldId: string) {
    setParam(fieldId, null)
    setAddedFilters((prev) => prev.filter((id) => id !== fieldId))
  }

  const visibleFilterIds = new Set(addedFilters)

  const availableFilterFields = filterFields.filter(
    (f) => !visibleFilterIds.has(f.id)
  )

  const visibleFilterFields = filterFields.filter((f) =>
    visibleFilterIds.has(f.id)
  )

  const activeFilterCount = filterFields.filter(
    (f) => searchParams.get(f.id) !== null
  ).length

  const hasActiveFilters = search !== "" || activeFilterCount > 0

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full max-w-xs min-w-0 flex-1 sm:min-w-48">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground/50" />
          <Input
            className="pl-8"
            value={localSearch}
            placeholder={searchPlaceholder}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        {availableFilterFields.length > 0 && (
          <DataTableFiltersDropdown
            onAdd={handleAdd}
            activeCount={activeFilterCount}
            filterFields={availableFilterFields}
          />
        )}

        {visibleFilterFields.map((field) => {
          if (field.type === "select") {
            return (
              <DataTableFilterSelect
                key={field.id}
                field={field}
                searchParams={searchParams}
                setParam={setParam}
                onRemove={() => handleRemove(field.id)}
              />
            )
          }
          if (field.type === "multiple") {
            return (
              <DataTableFilterMultiple
                key={field.id}
                field={field}
                setParam={setParam}
                searchParams={searchParams}
                onRemove={() => handleRemove(field.id)}
              />
            )
          }
          return null
        })}

        {hasActiveFilters && (
          <Button
            variant="ghost"
            className="gap-1 text-muted-foreground/70 hover:text-foreground"
            onClick={() => {
              resetFilters()
              setAddedFilters([])
            }}
          >
            <X data-icon="inline-start" className="size-3.5" />
            Remover filtros
          </Button>
        )}
      </div>

      <DataTableViewOptions table={table} />
    </div>
  )
}
