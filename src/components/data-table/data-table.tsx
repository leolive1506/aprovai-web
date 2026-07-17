import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type { Column, Table as TanstackTable } from "@tanstack/react-table"
import { flexRender } from "@tanstack/react-table"
import { useEffect, useRef, useState } from "react"
import { DataTableColumnHeader } from "./data-table-column-header"
import { DataTableEmpty } from "./data-table-empty"
import { DataTablePagination } from "./data-table-pagination"
import { DataTableToolbar } from "./data-table-toolbar"
import type { DataTableFilterField } from "./types"

interface DataTableProps<TData> {
  table: TanstackTable<TData>
  filterFields?: DataTableFilterField[]
  search: string
  onSearchChange: (value: string) => void
  setParam: (key: string, value: string | null) => void
  resetFilters: () => void
  searchParams: URLSearchParams
  isLoading?: boolean
  searchPlaceholder?: string
}

function getPinnedStyles<TData>(
  column: Column<TData, unknown>,
  isOverflowing: boolean
): React.CSSProperties {
  const pinned = column.getIsPinned()
  if (!pinned || !isOverflowing) return {}
  return {
    position: "sticky",
    right: pinned === "right" ? column.getAfter("right") : undefined,
    left: pinned === "left" ? column.getStart("left") : undefined,
    zIndex: 1,
  }
}

export function DataTable<TData>({
  table,
  filterFields,
  search,
  onSearchChange,
  setParam,
  resetFilters,
  searchParams,
  isLoading = false,
  searchPlaceholder,
}: DataTableProps<TData>) {
  const rows = table.getRowModel().rows
  const columns = table.getAllColumns()
  const colSpan = columns.length

  const wrapperRef = useRef<HTMLDivElement>(null)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const initialPinningRef = useRef(table.getState().columnPinning)

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    const tableContainer = wrapper.querySelector<HTMLElement>(
      '[data-slot="table-container"]'
    )
    if (!tableContainer) return

    const update = () => {
      const overflow = tableContainer.scrollWidth > tableContainer.clientWidth
      setIsOverflowing(overflow)
      table.setColumnPinning(overflow ? initialPinningRef.current : {})
    }

    const observer = new ResizeObserver(update)
    observer.observe(tableContainer)
    return () => observer.disconnect()
  }, [table])

  return (
    <div className="flex flex-col gap-4">
      <DataTableToolbar
        table={table}
        search={search}
        onSearchChange={onSearchChange}
        setParam={setParam}
        resetFilters={resetFilters}
        searchParams={searchParams}
        filterFields={filterFields}
        searchPlaceholder={searchPlaceholder}
      />
      <div
        ref={wrapperRef}
        className="overflow-hidden rounded-lg border"
      >
        <Table className="w-full caption-bottom text-sm">
          <TableHeader className="[&_tr]:border-b sticky top-0 z-10 bg-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const pinned = isOverflowing && header.column.getIsPinned()
                  return (
                    <TableHead
                      key={header.id}
                      style={{
                        width: header.getSize(),
                        ...getPinnedStyles(header.column, isOverflowing),
                      }}
                      className={cn(
                        pinned === "right" &&
                        "border-l border-l-border/60 bg-background shadow-[-4px_0_8px_-2px_oklch(0_0_0/0.06)]",
                        pinned === "left" &&
                        "border-r border-r-border/60 bg-background shadow-[4px_0_8px_-2px_oklch(0_0_0/0.06)]"
                      )}
                    >
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <DataTableColumnHeader
                          column={header.column}
                          title={
                            typeof header.column.columnDef.header === "string"
                              ? header.column.columnDef.header
                              : header.id
                          }
                        />
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton rows have no stable id
                <TableRow key={i}>
                  {Array.from({ length: colSpan }).map((__, j) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: skeleton cells have no stable id
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : rows.length > 0 ? (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                >
                  {row.getVisibleCells().map((cell) => {
                    const pinned = isOverflowing && cell.column.getIsPinned()
                    return (
                      <TableCell
                        key={cell.id}
                        style={getPinnedStyles(cell.column, isOverflowing)}
                        className={cn(
                          pinned === "right" &&
                          "border-l border-l-border/60 bg-background shadow-[-4px_0_8px_-2px_oklch(0_0_0/0.06)]",
                          pinned === "left" &&
                          "border-r border-r-border/60 bg-background shadow-[4px_0_8px_-2px_oklch(0_0_0/0.06)]"
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={colSpan} className="p-0">
                  <DataTableEmpty />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  )
}
