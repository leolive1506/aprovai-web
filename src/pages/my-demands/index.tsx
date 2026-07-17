import { useGetMyDemands, useGetMyDemandsSummary } from "@/api/demands/hooks"
import type { Demand } from "@/api/demands/types"
import { DemandStatusBadge } from "@/components/demand-status-badge"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { useAuth } from "@/hooks/use-auth"
import { usePageTitle } from "@/hooks/use-page-title"
import { cn } from "@/lib/utils"
import { fadeUp, stagger } from "@/utils/animation"
import { CAT_COLORS } from "@/utils/colors"
import { formatDateToNow, getGreeting } from "@/utils/date"
import { motion } from "framer-motion"
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Clock,
  Loader2,
  MapPin,
  Plus,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react"
import { useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ActivityChart } from "./components/activity-chart"
import { ResolutionRing } from "./components/resolution-ring"
import { StatusBreakdown } from "./components/status-breakdown"


function DemandRow({ demand }: { demand: Demand }) {
  const navigate = useNavigate()
  return (
    <button
      className="group w-full grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_140px_32px] gap-x-4 items-center px-6 py-3.5 hover:bg-muted/30 transition-colors text-left"
      onClick={() => navigate(`/demand/${demand.id}`)}
    >
      <div className="min-w-0 flex items-center gap-3.5">
        <div className="size-8 rounded-xl bg-muted/60 flex items-center justify-center shrink-0 border border-border/50">
          <ClipboardList className="size-3.5 text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground line-clamp-1">{demand.title}</p>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <span className="text-xs text-muted-foreground">{demand.category.name}</span>
            {demand.neighborhood && (
              <>
                <span className="text-muted-foreground/30 text-xs">·</span>
                <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                  <MapPin className="size-2.5 shrink-0" />
                  {demand.neighborhood}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="hidden sm:flex items-center gap-3">
        <DemandStatusBadge status={demand.status} />
        <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
          {formatDateToNow(demand.createdAt)}
        </span>
      </div>
      <div className="flex items-center justify-end">
        <ArrowRight className="size-3.5 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
      </div>
    </button>
  )
}

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded bg-muted/60", className)} />
}

function KpiSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-3">
      <SkeletonBlock className="size-9 rounded-xl" />
      <div className="flex flex-col gap-2">
        <SkeletonBlock className="h-7 w-16" />
        <SkeletonBlock className="h-3 w-28" />
      </div>
    </div>
  )
}

export function MyDemands() {
  const { user } = useAuth()
  const { setTitle } = usePageTitle()
  const { data: summary, isLoading: isLoadingSummary } = useGetMyDemandsSummary()
  const { data: demandsData, isLoading: isLoadingDemands } = useGetMyDemands({ limit: 8 })

  useEffect(() => {
    setTitle({ title: "Minhas Demandas" })
  }, [setTitle])

  const firstName = user?.name?.split(" ")[0] ?? "cidadão"
  const recentDemands = demandsData?.pages[0]?.items ?? []

  const resolvedCount =
    summary?.statusBreakdown.find((s) => s.status === "RESOLVED")?.count ?? 0
  const activeCount =
    (summary?.statusBreakdown.find((s) => s.status === "IN_ANALYSIS")?.count ?? 0) +
    (summary?.statusBreakdown.find((s) => s.status === "IN_PROGRESS")?.count ?? 0)
  const total = summary?.totalDemands ?? 0
  const resolutionRate = summary?.resolutionRate ?? 0

  const categoryData = (summary?.categoryBreakdown ?? []).map((c, i) => ({
    ...c,
    color: CAT_COLORS[i % CAT_COLORS.length],
  }))
  const maxCatCount = categoryData[0]?.count ?? 1

  return (
    <motion.div
      className="flex flex-col gap-6"
      initial="hidden"
      animate="visible"
      variants={stagger}
    >
      <motion.div
        className="flex flex-wrap items-start justify-between gap-3"
        variants={fadeUp}
        custom={0}
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight leading-none">
            Minhas Demandas
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1.5">
            {getGreeting()},{" "}
            <span className="font-medium text-foreground">{firstName}</span> — acompanhe suas
            solicitações aqui.
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors shrink-0 h-8"
        >
          <Plus className="size-3.5" />
          Nova demanda
        </Link>
      </motion.div>

      <motion.div className="grid grid-cols-2 gap-3 lg:grid-cols-4" variants={stagger}>
        {isLoadingSummary ? (
          Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)
        ) : (
          <>
            <KpiCard
              icon={<ClipboardList className="size-4.5" />}
              iconBg="bg-primary/10"
              iconColor="text-primary"
              label="Total de Demandas"
              value={String(total)}
              sub={total === 0 ? "Registre sua primeira" : "desde o início"}
            />
            <KpiCard
              icon={<TrendingUp className="size-4.5" />}
              iconBg={
                resolutionRate >= 50
                  ? "bg-emerald-50 dark:bg-emerald-950/30"
                  : "bg-amber-50 dark:bg-amber-950/30"
              }
              iconColor={
                resolutionRate >= 50
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-amber-500"
              }
              label="Taxa de Resolução"
              value={`${resolutionRate}%`}
              sub={
                resolutionRate >= 50
                  ? "acima da metade"
                  : resolvedCount > 0
                    ? `${resolvedCount} resolvida${resolvedCount > 1 ? "s" : ""}`
                    : "sem resoluções ainda"
              }
            />
            <KpiCard
              icon={<Zap className="size-4.5" />}
              iconBg={activeCount > 0 ? "bg-blue-50 dark:bg-blue-950/30" : "bg-muted/50"}
              iconColor={activeCount > 0 ? "text-blue-500" : "text-muted-foreground"}
              label="Em Andamento"
              value={String(activeCount)}
              sub={activeCount > 0 ? "em análise ou progresso" : "nenhuma no momento"}
            />
            <KpiCard
              icon={<Clock className="size-4.5" />}
              iconBg="bg-muted/50"
              iconColor="text-muted-foreground"
              label="Tempo Médio de Resolução"
              value={
                summary?.avgDaysToResolve !== null && summary?.avgDaysToResolve !== undefined
                  ? `${summary.avgDaysToResolve}d`
                  : "—"
              }
              sub={
                summary?.avgDaysToResolve !== null && summary?.avgDaysToResolve !== undefined
                  ? "para demandas resolvidas"
                  : "sem dados ainda"
              }
            />
          </>
        )}
      </motion.div>

      <motion.div className="grid gap-4 lg:grid-cols-3" variants={fadeUp} custom={0.15}>
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Atividade</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Demandas registradas nos últimos 6 meses</p>
            </div>
            {summary?.monthlyActivity.some((m) => m.count > 0) && (
              <span className="text-xs text-muted-foreground font-mono tabular-nums font-semibold">
                {summary.monthlyActivity.reduce((s, m) => s + m.count, 0)} total
              </span>
            )}
          </div>
          {isLoadingSummary ? (
            <div className="flex justify-center items-center h-[240px]">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            </div>
          ) : !summary?.monthlyActivity.some((m) => m.count > 0) ? (
            <div className="flex flex-col items-center justify-center h-[240px] gap-2.5 text-center px-6">
              <BarChart3 className="size-8 text-muted-foreground/30" />
              <div>
                <p className="text-sm font-medium text-foreground">Sem atividade ainda</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Registre sua primeira demanda para ver o histórico.
                </p>
              </div>
            </div>
          ) : (
            <div className="px-2 pt-5 pb-3">
              <ActivityChart data={summary.monthlyActivity} />
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-border/50">
            <h2 className="text-sm font-semibold text-foreground">Índice de Resolutividade</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Taxa de demandas resolvidas</p>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
            {isLoadingSummary ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="size-4 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <ResolutionRing
                  rate={resolutionRate}
                  resolved={resolvedCount}
                  total={total}
                />
                {total > 0 && resolvedCount === total && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-800">
                    <CheckCircle2 className="size-3 text-emerald-500" />
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      Todas resolvidas!
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </motion.div>

      <motion.div className="grid gap-4 lg:grid-cols-2" variants={fadeUp} custom={0.25}>
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border/50">
            <h2 className="text-sm font-semibold text-foreground">Por Categoria</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {categoryData.length > 0
                ? `${categoryData.length} categoria${categoryData.length !== 1 ? "s" : ""} registradas`
                : "Tipos de problema reportados"}
            </p>
          </div>
          {isLoadingSummary ? (
            <div className="px-6 py-4 flex flex-col gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <SkeletonBlock className="h-3 w-24" />
                    <SkeletonBlock className="h-3 w-8" />
                  </div>
                  <SkeletonBlock className="h-2 w-full rounded-full" />
                </div>
              ))}
            </div>
          ) : categoryData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2 px-6 text-center">
              <Sparkles className="size-7 text-muted-foreground/30" />
              <p className="text-xs text-muted-foreground">Nenhuma categoria ainda</p>
            </div>
          ) : (
            <div className="px-6 py-4 flex flex-col gap-4">
              {categoryData.map((cat, i) => (
                <motion.div
                  key={cat.name}
                  className="flex flex-col gap-1.5"
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.05, duration: 0.3, ease: "easeOut" }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="size-2 rounded-full shrink-0" style={{ background: cat.color }} />
                      <span className="text-sm text-foreground truncate">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm font-bold font-mono tabular-nums text-foreground">
                        {cat.count}
                      </span>
                      <span className="text-xs text-muted-foreground w-7 text-right tabular-nums">
                        {Math.round((cat.count / maxCatCount) * 100)}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: cat.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.round((cat.count / maxCatCount) * 100)}%` }}
                      transition={{ delay: 0.35 + i * 0.05, duration: 0.55, ease: "easeOut" }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border/50">
            <h2 className="text-sm font-semibold text-foreground">Distribuição por Status</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Situação atual de todas as demandas</p>
          </div>
          <div className="px-6 py-5">
            {isLoadingSummary ? (
              <div className="flex flex-col gap-4">
                <SkeletonBlock className="h-3 w-full rounded-full" />
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonBlock key={i} className="h-8 rounded-lg" />
                  ))}
                </div>
              </div>
            ) : (
              <StatusBreakdown data={summary?.statusBreakdown ?? []} />
            )}
          </div>
        </div>
      </motion.div>

      <motion.div
        className="rounded-2xl border border-border bg-card overflow-hidden"
        variants={fadeUp}
        custom={0.35}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
          <div className="flex items-center gap-2.5">
            <div className="size-7 rounded-lg bg-muted flex items-center justify-center">
              <ClipboardList className="size-3.5 text-muted-foreground" />
            </div>
            <h2 className="text-sm font-semibold text-foreground">Demandas Recentes</h2>
            {recentDemands.length > 0 && (
              <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-primary/5 text-primary border border-primary/10 text-xs font-bold tabular-nums">
                {demandsData?.pages[0]?.meta.total ?? recentDemands.length}
              </span>
            )}
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors h-7 px-2 rounded-md hover:bg-muted"
          >
            Ver feed
            <ArrowRight className="size-3" />
          </Link>
        </div>

        {isLoadingDemands ? (
          <div className="flex justify-center py-10">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          </div>
        ) : recentDemands.length === 0 ? (
          <div className="flex items-center gap-3 px-6 py-8">
            <div className="size-9 rounded-full bg-muted flex items-center justify-center shrink-0">
              <ClipboardList className="size-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Nenhuma demanda ainda</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Suas demandas registradas aparecerão aqui.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="hidden sm:grid grid-cols-[1fr_140px_32px] gap-x-4 px-6 py-2.5 border-b border-border/20 bg-muted/20">
              <span className="text-2xs font-semibold uppercase tracking-widest text-muted-foreground/60">
                Demanda
              </span>
              <span className="text-2xs font-semibold uppercase tracking-widest text-muted-foreground/60">
                Status · Data
              </span>
              <span />
            </div>
            <div className="divide-y divide-border/30">
              {recentDemands.map((demand, i) => (
                <motion.div
                  key={demand.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + i * 0.05, duration: 0.3, ease: "easeOut" }}
                >
                  <DemandRow demand={demand} />
                </motion.div>
              ))}
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}
