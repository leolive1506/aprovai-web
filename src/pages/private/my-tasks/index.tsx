import { useGetDemandsByCabinetSlug, useUpdateDemandProgress } from "@/api/demands/hooks"
import { DemandStatus, type Demand } from "@/api/demands/types"
import { CreateResultDialog } from "@/components/create-result-dialog"
import { DemandDetailSheet } from "@/components/demand-detail-sheet"
import { DemandStatusBadge } from "@/components/demand-status-badge"
import { UpdateProgressDialog } from "@/components/update-progress-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { useCurrentMember } from "@/hooks/use-current-member"
import { usePageTitle } from "@/hooks/use-page-title"
import { cn } from "@/lib/utils"
import { getFirstLettersFromNames } from "@/utils/get-first-letters-from-names"
import { formatDateToNow } from "@/utils/date"
import { DEMAND_STATUS_CONFIG } from "../demands/components/demand-utils"
import { DemandPriority } from "../demands/components/demand-priority"
import {
  CalendarIcon,
  ClipboardList,
  Kanban,
  List,
  TagIcon,
  TrendingUp,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

const PRIORITY_STRIPE: Record<string, string> = {
  URGENT: "bg-red-500",
  HIGH: "bg-orange-500",
  MEDIUM: "bg-blue-500",
  LOW: "bg-border",
}

const KANBAN_COLUMNS: { status: DemandStatus; dotClass: string }[] = [
  { status: DemandStatus.SUBMITTED, dotClass: "bg-slate-400" },
  { status: DemandStatus.IN_ANALYSIS, dotClass: "bg-blue-500" },
  { status: DemandStatus.IN_PROGRESS, dotClass: "bg-amber-500" },
  { status: DemandStatus.RESOLVED, dotClass: "bg-emerald-500" },
  { status: DemandStatus.REJECTED, dotClass: "bg-red-500" },
  { status: DemandStatus.CANCELED, dotClass: "bg-zinc-400" },
]

const STATUSES_REQUIRING_NOTE: DemandStatus[] = [DemandStatus.REJECTED, DemandStatus.CANCELED]

type StatusGroup = {
  key: string
  label: string
  statuses: DemandStatus[]
  dotClass: string
}

const STATUS_GROUPS: StatusGroup[] = [
  {
    key: "pending",
    label: "Pendentes",
    statuses: [DemandStatus.SUBMITTED, DemandStatus.IN_ANALYSIS],
    dotClass: "bg-blue-500",
  },
  {
    key: "in_progress",
    label: "Em Andamento",
    statuses: [DemandStatus.IN_PROGRESS],
    dotClass: "bg-amber-500",
  },
  {
    key: "done",
    label: "Concluídas",
    statuses: [DemandStatus.RESOLVED, DemandStatus.REJECTED, DemandStatus.CANCELED],
    dotClass: "bg-emerald-500",
  },
]

interface KanbanCardProps {
  demand: Demand
  draggingId: string | null
  onOpenDetail: (d: Demand) => void
  onDragStart: (e: React.DragEvent, d: Demand) => void
  onDragEnd: () => void
}

function KanbanCard({ demand, draggingId, onOpenDetail, onDragStart, onDragEnd }: KanbanCardProps) {
  const isDragging = draggingId === demand.id

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, demand)}
      onDragEnd={onDragEnd}
      onClick={() => onOpenDetail(demand)}
      className={cn(
        "bg-card rounded-lg border border-border p-3 select-none",
        "cursor-grab active:cursor-grabbing hover:bg-muted/30 transition-colors",
        isDragging && "opacity-30 scale-95",
      )}
    >
      <p className="text-sm font-medium text-foreground leading-snug line-clamp-3 mb-2.5">
        {demand.title}
      </p>

      {demand.priority && (
        <div className="mb-2">
          <DemandPriority variant={demand.priority} />
        </div>
      )}

      {demand.category && (
        <div className="flex items-center gap-1 mb-2">
          <TagIcon className="size-3 text-muted-foreground/50 shrink-0" />
          <span className="text-xs text-muted-foreground truncate">{demand.category.name}</span>
        </div>
      )}

      <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/40">
        {demand.reporter ? (
          <div className="flex items-center gap-1.5 min-w-0">
            <Avatar className="size-5 shrink-0">
              <AvatarImage src={demand.reporter.avatarUrl} />
              <AvatarFallback className="text-2xs bg-primary/10 text-primary font-bold">
                {demand.reporter.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground truncate">{demand.reporter.name}</span>
          </div>
        ) : (
          <div />
        )}
        <div className="flex items-center gap-1 shrink-0">
          <CalendarIcon className="size-3 text-muted-foreground/50" />
          <span className="text-xs text-muted-foreground/70">{formatDateToNow(demand.createdAt)}</span>
        </div>
      </div>
    </div>
  )
}

interface KanbanColumnProps {
  status: DemandStatus
  dotClass: string
  demands: Demand[]
  draggingId: string | null
  isOver: boolean
  onDragStart: (e: React.DragEvent, d: Demand) => void
  onDragEnd: () => void
  onDragOver: (e: React.DragEvent, s: DemandStatus) => void
  onDragLeave: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent, s: DemandStatus) => void
  onOpenDetail: (d: Demand) => void
}

function KanbanColumn({
  status, dotClass, demands, draggingId, isOver,
  onDragStart, onDragEnd, onDragOver, onDragLeave, onDrop, onOpenDetail,
}: KanbanColumnProps) {
  const config = DEMAND_STATUS_CONFIG[status]

  return (
    <div
      className={cn(
        "flex flex-col min-w-52 w-52 rounded-lg border border-border bg-muted/20 shrink-0 transition-colors",
        isOver && "border-primary/30 bg-primary/5",
      )}
      onDragOver={(e) => onDragOver(e, status)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, status)}
    >
      <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-border/40">
        <span className={cn("size-1.5 rounded-full shrink-0", dotClass)} />
        <span className="text-xs font-medium text-muted-foreground flex-1 truncate">
          {config.label}
        </span>
        <span
          className={cn(
            "inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-md text-xs tabular-nums font-medium",
            demands.length > 0 ? "bg-muted text-muted-foreground" : "text-muted-foreground/30",
          )}
        >
          {demands.length}
        </span>
      </div>

      <div className="flex flex-col gap-2 p-2.5 flex-1 min-h-28">
        {demands.length === 0 ? (
          <div className="flex items-center justify-center flex-1 py-8">
            <p
              className={cn(
                "text-xs select-none transition-colors",
                isOver ? "text-primary/40" : "text-muted-foreground/30",
              )}
            >
              {isOver ? "Soltar aqui" : "Vazio"}
            </p>
          </div>
        ) : (
          demands.map((demand) => (
            <KanbanCard
              key={demand.id}
              demand={demand}
              draggingId={draggingId}
              onOpenDetail={onOpenDetail}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
            />
          ))
        )}
      </div>
    </div>
  )
}

interface KanbanBoardProps {
  demands: Demand[]
  onOpenDetail: (d: Demand) => void
  onNeedsResults: (d: Demand) => void
}

function KanbanBoard({ demands, onOpenDetail, onNeedsResults }: KanbanBoardProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [overColumn, setOverColumn] = useState<DemandStatus | null>(null)
  const [pendingMove, setPendingMove] = useState<{ demand: Demand; toStatus: DemandStatus } | null>(null)
  const { mutate: updateProgress } = useUpdateDemandProgress()

  const byStatus = useMemo(() => {
    const map = Object.fromEntries(
      Object.values(DemandStatus).map((s) => [s, [] as Demand[]]),
    ) as Record<DemandStatus, Demand[]>
    demands.forEach((d) => map[d.status]?.push(d))
    return map
  }, [demands])

  function handleDragStart(e: React.DragEvent, demand: Demand) {
    setDraggingId(demand.id)
    e.dataTransfer.setData("demandId", demand.id)
    e.dataTransfer.setData("fromStatus", demand.status)
    e.dataTransfer.effectAllowed = "move"
  }

  function handleDragEnd() {
    setDraggingId(null)
    setOverColumn(null)
  }

  function handleDragOver(e: React.DragEvent, status: DemandStatus) {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setOverColumn(status)
  }

  function handleDragLeave(e: React.DragEvent) {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setOverColumn(null)
    }
  }

  function handleDrop(e: React.DragEvent, toStatus: DemandStatus) {
    e.preventDefault()
    const demandId = e.dataTransfer.getData("demandId")
    const fromStatus = e.dataTransfer.getData("fromStatus") as DemandStatus
    setOverColumn(null)
    setDraggingId(null)

    if (!demandId || fromStatus === toStatus) return
    const demand = demands.find((d) => d.id === demandId)
    if (!demand) return

    if (STATUSES_REQUIRING_NOTE.includes(toStatus) || toStatus === DemandStatus.RESOLVED) {
      setPendingMove({ demand, toStatus })
    } else {
      updateProgress({ id: demandId, status: toStatus })
    }
  }

  return (
    <>
      <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4">
        {KANBAN_COLUMNS.map((col) => (
          <KanbanColumn
            key={col.status}
            status={col.status}
            dotClass={col.dotClass}
            demands={byStatus[col.status]}
            draggingId={draggingId}
            isOver={overColumn === col.status}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onOpenDetail={onOpenDetail}
          />
        ))}
      </div>

      {pendingMove && (
        <UpdateProgressDialog
          demandId={pendingMove.demand.id}
          currentStatus={pendingMove.demand.status}
          defaultStatus={pendingMove.toStatus}
          open={!!pendingMove}
          onOpenChange={(open) => !open && setPendingMove(null)}
          onNeedsResults={() => {
            const demand = pendingMove.demand
            setPendingMove(null)
            onNeedsResults(demand)
          }}
        />
      )}
    </>
  )
}

function DemandListCard({
  demand,
  onOpenDetail,
  onOpenProgress,
}: {
  demand: Demand
  onOpenDetail: (d: Demand) => void
  onOpenProgress: (d: Demand) => void
}) {
  const stripeClass = demand.priority ? (PRIORITY_STRIPE[demand.priority] ?? "bg-border") : "bg-border"

  return (
    <div
      className="group relative flex items-center gap-3 pl-5 pr-3 py-2.5 hover:bg-muted/40 transition-colors cursor-pointer"
      onClick={() => onOpenDetail(demand)}
    >
      <div className={cn("absolute left-0 inset-y-0 w-0.75 rounded-r-sm", stripeClass)} />

      {demand.reporter ? (
        <Avatar className="size-7 shrink-0">
          <AvatarImage src={demand.reporter.avatarUrl} />
          <AvatarFallback className="bg-muted text-muted-foreground text-2xs font-semibold">
            {getFirstLettersFromNames(demand.reporter.name)}
          </AvatarFallback>
        </Avatar>
      ) : (
        <div className="size-7 rounded-full bg-muted shrink-0" />
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground line-clamp-1 leading-snug">
          {demand.title}
        </p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <DemandStatusBadge status={demand.status} />
          {demand.category && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <TagIcon className="size-3 shrink-0" />
              {demand.category.name}
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <CalendarIcon className="size-3 shrink-0" />
            {formatDateToNow(demand.createdAt)}
          </span>
        </div>
      </div>

      <div
        className="flex items-center gap-1.5 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        {demand.priority && <DemandPriority variant={demand.priority} />}
        <Button
          size="icon"
          variant="ghost"
          className="size-7 text-muted-foreground/40 hover:text-foreground"
          onClick={() => onOpenProgress(demand)}
          title="Atualizar progresso"
        >
          <TrendingUp className="size-3.5" />
        </Button>
      </div>
    </div>
  )
}

function ListView({
  grouped,
  onOpenDetail,
  onOpenProgress,
}: {
  grouped: (StatusGroup & { items: Demand[] })[]
  onOpenDetail: (d: Demand) => void
  onOpenProgress: (d: Demand) => void
}) {
  return (
    <div className="flex flex-col gap-3">
      {grouped.map((group) => {
        if (group.items.length === 0) return null
        return (
          <div key={group.key} className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/50">
              <span className={cn("size-1.5 rounded-full shrink-0", group.dotClass)} />
              <span className="text-xs font-medium text-muted-foreground flex-1">
                {group.label}
              </span>
              <span className="text-xs tabular-nums font-medium text-muted-foreground/60">
                {group.items.length}
              </span>
            </div>
            <div className="divide-y divide-border/50">
              {group.items.map((demand, i) => (
                <div
                  key={demand.id}
                  className="animate-fade-slide-in"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <DemandListCard
                    demand={demand}
                    onOpenDetail={onOpenDetail}
                    onOpenProgress={onOpenProgress}
                  />
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function MyTasks() {
  const { setTitle } = usePageTitle()
  const { cabinet } = useAuth()
  const { currentMember } = useCurrentMember()
  const [detailDemand, setDetailDemand] = useState<Demand | null>(null)
  const [progressDemand, setProgressDemand] = useState<Demand | null>(null)
  const [resultTargetDemand, setResultTargetDemand] = useState<Demand | null>(null)
  const [view, setView] = useState<"list" | "kanban">("list")
  const { mutate: updateProgressAfterResult } = useUpdateDemandProgress()

  useEffect(() => {
    setTitle({ title: "Minhas Tarefas", description: "Demandas atribuídas a você" })
  }, [setTitle])

  const { data: demands, isLoading } = useGetDemandsByCabinetSlug({
    slug: cabinet?.slug as string,
    assigneeMemberId: currentMember?.id,
    limit: 100,
    page: 1,
    enabled: !!cabinet?.slug && !!currentMember?.id,
  })

  const allDemands = demands?.items ?? []
  const total = allDemands.length

  const grouped = useMemo(
    () =>
      STATUS_GROUPS.map((group) => ({
        ...group,
        items: allDemands.filter((d) => group.statuses.includes(d.status)),
      })),
    [allDemands],
  )

  if (isLoading && !demands) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col gap-1.5">
            <div className="h-4 w-32 rounded-md bg-muted animate-pulse" />
            <div className="h-3 w-48 rounded-md bg-muted/60 animate-pulse" />
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-3 border-b border-border/40 last:border-0">
              <div className="size-7 rounded-full bg-muted animate-pulse shrink-0" />
              <div className="flex-1 flex flex-col gap-1.5">
                <div className="h-3.5 rounded-md bg-muted animate-pulse" style={{ width: `${55 + (i % 3) * 15}%` }} />
                <div className="h-3 w-32 rounded-md bg-muted/60 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-base font-semibold text-foreground">Minhas Tarefas</h1>
            <p className="text-xs text-muted-foreground">
              {cabinet?.name ?? ""}
              {total > 0 && (
                <span> · {total} {total === 1 ? "demanda" : "demandas"}</span>
              )}
            </p>
          </div>

          {total > 0 && (
            <div className="flex items-center rounded-lg border border-border bg-muted/40 p-0.5 shrink-0">
              <button
                onClick={() => setView("list")}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all",
                  view === "list"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <List className="size-3.5" />
                Lista
              </button>
              <button
                onClick={() => setView("kanban")}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all",
                  view === "kanban"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Kanban className="size-3.5" />
                Kanban
              </button>
            </div>
          )}
        </div>

        {total === 0 ? (
          <div className="rounded-lg border border-border bg-card flex flex-col items-center justify-center py-20 text-center gap-3">
            <div className="size-10 rounded-lg bg-muted flex items-center justify-center">
              <ClipboardList className="size-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Nenhuma demanda atribuída</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                Quando uma demanda for atribuída a você, ela aparecerá aqui organizada por status.
              </p>
            </div>
          </div>
        ) : view === "list" ? (
          <ListView
            grouped={grouped}
            onOpenDetail={setDetailDemand}
            onOpenProgress={setProgressDemand}
          />
        ) : (
          <KanbanBoard demands={allDemands} onOpenDetail={setDetailDemand} onNeedsResults={setResultTargetDemand} />
        )}
      </div>

      <DemandDetailSheet
        demand={detailDemand}
        open={!!detailDemand}
        onOpenChange={(open) => !open && setDetailDemand(null)}
      />

      {progressDemand && (
        <UpdateProgressDialog
          demandId={progressDemand.id}
          currentStatus={progressDemand.status}
          open={!!progressDemand}
          onOpenChange={(open) => !open && setProgressDemand(null)}
          onNeedsResults={() => {
            const demand = progressDemand
            setProgressDemand(null)
            setResultTargetDemand(demand)
          }}
        />
      )}

      {resultTargetDemand && (
        <CreateResultDialog
          demand={resultTargetDemand}
          open={!!resultTargetDemand}
          onOpenChange={(open) => !open && setResultTargetDemand(null)}
          onCreated={() => {
            updateProgressAfterResult(
              { id: resultTargetDemand.id, status: DemandStatus.RESOLVED },
              {
                onSuccess: () => toast.success("Demanda finalizada!"),
                onError: () =>
                  toast.error("Resultado salvo, mas não foi possível finalizar. Atualize o status manualmente."),
              },
            )
          }}
        />
      )}
    </>
  )
}
