import { FEATURES } from "@/api/plans/features"
import { FeatureGate } from "@/components/feature-gate"
import { useGetCabinetMembers } from "@/api/cabinets/hooks"
import { DemandsApi } from "@/api/demands"
import { useGetDemandsByCabinetSlug } from "@/api/demands/hooks"
import type { Demand, DemandPriority, DemandStatus } from "@/api/demands/types"
import { DataTable, type DataTableFilterField } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { useDataTable } from "@/hooks/use-data-table"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Download, Loader2, Upload } from "lucide-react"
import { useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { toast } from "sonner"
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from "./demand-utils"
import { demandsColumns } from "./demands-columns"
import { DemandImportModal } from "./demand-import-modal"
import { DemandsForm } from "./demands-form"

const filterFields: DataTableFilterField[] = [
  {
    id: "status",
    label: "Status",
    type: "select",
    options: STATUS_OPTIONS,
  },
  {
    id: "priority",
    label: "Prioridade",
    type: "select",
    options: PRIORITY_OPTIONS,
  },
]

const STATUS_LABELS: Record<string, string> = {
  SUBMITTED: "Enviada",
  IN_ANALYSIS: "Em análise",
  IN_PROGRESS: "Em progresso",
  RESOLVED: "Resolvida",
  REJECTED: "Rejeitada",
  CANCELED: "Cancelada",
}

const PRIORITY_LABELS: Record<string, string> = {
  URGENT: "Urgente",
  HIGH: "Alta",
  MEDIUM: "Média",
  LOW: "Baixa",
}

function exportDemandsCSV(demands: Demand[], cabinetName: string) {
  const header = ["ID", "Título", "Descrição", "Categoria", "Prioridade", "Status", "Endereço", "Bairro", "Relator", "Responsável", "Curtidas", "Comentários", "Criada em"]
  const rows = demands.map((d) => [
    d.id,
    d.title,
    d.description,
    d.category?.name ?? "",
    PRIORITY_LABELS[d.priority ?? ""] ?? d.priority ?? "",
    STATUS_LABELS[d.status] ?? d.status,
    d.address ?? "",
    d.neighborhood ?? "",
    d.reporter?.name ?? d.guestEmail ?? "",
    "",
    String(d.likesCount),
    String(d.commentsCount),
    d.createdAt ? format(new Date(d.createdAt), "dd/MM/yyyy HH:mm") : "",
  ])
  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n")
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `demandas-${cabinetName.toLowerCase().replace(/\s+/g, "-")}-${format(new Date(), "yyyy-MM-dd")}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function DemandsTable() {
  const { cabinet, user } = useAuth()
  const columns = useMemo(() => demandsColumns, [])
  const [searchParams, setSearchParams] = useSearchParams()
  const [isExporting, setIsExporting] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)

  const assigneeMemberIdParam = searchParams.get("assigneeMemberId") ?? undefined

  const { data: members = [] } = useGetCabinetMembers(cabinet?.slug)
  const currentMember = useMemo(
    () => members.find((m) => m.userId === user?.id),
    [members, user?.id],
  )

  const isMyTasks = assigneeMemberIdParam === currentMember?.id

  function showAllTasks() {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.delete("assigneeMemberId")
      next.delete("page")
      return next
    })
  }

  function toggleMyTasks() {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (isMyTasks) {
        next.delete("assigneeMemberId")
      } else if (currentMember) {
        next.set("assigneeMemberId", currentMember.id)
        next.delete("page")
      }
      return next
    })
  }

  async function handleExport() {
    if (!cabinet?.slug || isExporting) return
    setIsExporting(true)
    try {
      const PAGE_LIMIT = 100
      const allItems: Demand[] = []
      let page = 1

      const first = await DemandsApi.listDemandsByCabinetSlug({
        slug: cabinet.slug,
        page,
        limit: PAGE_LIMIT,
        search: searchParams.get("search") ?? undefined,
        status: (searchParams.get("status") as DemandStatus) || undefined,
        priority: (searchParams.get("priority") as DemandPriority) || undefined,
        assigneeMemberId: assigneeMemberIdParam,
      })
      allItems.push(...first.items)

      const totalPages = Math.ceil(first.meta.total / PAGE_LIMIT)
      for (page = 2; page <= totalPages; page++) {
        const next = await DemandsApi.listDemandsByCabinetSlug({
          slug: cabinet.slug,
          page,
          limit: PAGE_LIMIT,
          search: searchParams.get("search") ?? undefined,
          status: (searchParams.get("status") as DemandStatus) || undefined,
          priority: (searchParams.get("priority") as DemandPriority) || undefined,
          assigneeMemberId: assigneeMemberIdParam,
        })
        allItems.push(...next.items)
      }

      exportDemandsCSV(allItems, cabinet.name)
      toast.success(`${allItems.length} demandas exportadas`)
    } catch {
      toast.error("Erro ao exportar demandas")
    } finally {
      setIsExporting(false)
    }
  }

  const { data: demands, isLoading } = useGetDemandsByCabinetSlug({
    slug: cabinet?.slug as string,
    page: Number(searchParams.get("page") ?? 1),
    limit: Number(searchParams.get("per_page") ?? 10),
    search: searchParams.get("search") ?? undefined,
    status: (searchParams.get("status") as DemandStatus) || undefined,
    priority: (searchParams.get("priority") as DemandPriority) || undefined,
    assigneeMemberId: assigneeMemberIdParam,
  })

  const { table, ...tableState } = useDataTable({
    data: demands?.items ?? [],
    columns,
    rowCount: demands?.meta.total ?? 0,
    columnPinning: { right: ["actions"] },
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          <Button
            size="sm"
            variant="ghost"
            className={cn(
              "h-7 px-3 text-xs font-medium rounded-md transition-all",
              !isMyTasks
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
            onClick={showAllTasks}
          >
            Todas
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={!currentMember}
            className={cn(
              "h-7 px-3 text-xs font-medium rounded-md transition-all",
              isMyTasks
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
            onClick={toggleMyTasks}
          >
            Minhas tarefas
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <FeatureGate feature={FEATURES.CSV_EXPORT}>
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 text-xs text-muted-foreground"
              onClick={handleExport}
              disabled={isExporting || !demands?.meta.total}
            >
              {isExporting ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
              <span className="hidden sm:inline">Exportar CSV</span>
              {demands?.meta.total ? <span className="tabular-nums">({demands.meta.total})</span> : null}
            </Button>
          </FeatureGate>
          <FeatureGate feature={FEATURES.CSV_IMPORT}>
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 text-xs text-muted-foreground"
              onClick={() => setIsImportOpen(true)}
            >
              <Upload className="size-3.5" />
              <span className="hidden sm:inline">Importar CSV</span>
            </Button>
          </FeatureGate>
          <DemandsForm sizeTrigger="default" />
        </div>
      </div>
      <DemandImportModal open={isImportOpen} onOpenChange={setIsImportOpen} />
      <DataTable
        table={table}
        {...tableState}
        filterFields={filterFields}
        isLoading={isLoading}
        searchPlaceholder="Buscar por título ou descrição..."
      />
    </div>
  )
}
