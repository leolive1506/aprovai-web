import type { ReportedDemandItem } from "@/api/admin"
import { useAdminListReportedDemands } from "@/api/admin/hooks"
import { DataTable } from "@/components/data-table"
import { TABLE_PARAM_KEYS, useDataTable } from "@/hooks/use-data-table"
import { useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { buildReportsColumns } from "./reports-columns"
import { ReportDetailSheet } from "./report-detail-sheet"

export function ReportsTable() {
  const [searchParams] = useSearchParams()
  const [selectedItem, setSelectedItem] = useState<ReportedDemandItem | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const page = Math.max(1, Number(searchParams.get(TABLE_PARAM_KEYS.PAGE) ?? 1))
  const limit = Math.max(1, Number(searchParams.get(TABLE_PARAM_KEYS.PER_PAGE) ?? 10))

  const { data, isLoading } = useAdminListReportedDemands({ page, limit })

  function handleViewDetail(item: ReportedDemandItem) {
    setSelectedItem(item)
    setSheetOpen(true)
  }

  const columns = useMemo(() => buildReportsColumns({ onViewDetail: handleViewDetail }), [])

  const { table, ...tableState } = useDataTable({
    data: data?.items ?? [],
    columns,
    rowCount: data?.meta?.total ?? 0,
    columnPinning: { right: ["actions"] },
  })

  return (
    <>
      <DataTable
        table={table}
        {...tableState}
        isLoading={isLoading}
      />
      <ReportDetailSheet
        item={selectedItem}
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open)
          if (!open) setSelectedItem(null)
        }}
      />
    </>
  )
}
