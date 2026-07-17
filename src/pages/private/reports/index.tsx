import { FEATURES } from "@/api/plans/features"
import { FeatureGate } from "@/components/feature-gate"
import { RequireActiveSubscription } from "@/components/require-active-subscription"
import { useGetCabinetReport } from "@/api/demands/hooks"
import type { CabinetReport, DemandStatus as DemandStatusType } from "@/api/demands/types"
import { DemandStatus } from "@/api/demands/types"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { useAuth } from "@/hooks/use-auth"
import { useCabinetFeatures } from "@/hooks/use-cabinet-features"
import { usePageTitle } from "@/hooks/use-page-title"
import { cn } from "@/lib/utils"
import { format, subDays, subMonths, subYears, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  CheckCircle2,
  Download,
  FileDown,
  Loader2,
  BarChart3,
} from "lucide-react"
import { motion } from "framer-motion"
import { useEffect, useMemo, useState } from "react"

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts"

const STATUS_CONFIG: Record<DemandStatusType, { label: string; color: string; bg: string }> = {
  [DemandStatus.SUBMITTED]:   { label: "Enviada",       color: "#94a3b8", bg: "bg-slate-400" },
  [DemandStatus.IN_ANALYSIS]: { label: "Em análise",    color: "#3b82f6", bg: "bg-blue-500" },
  [DemandStatus.IN_PROGRESS]: { label: "Em progresso",  color: "#f59e0b", bg: "bg-amber-500" },
  [DemandStatus.RESOLVED]:    { label: "Finalizada",    color: "#22c55e", bg: "bg-emerald-500" },
  [DemandStatus.REJECTED]:    { label: "Rejeitada",     color: "#ef4444", bg: "bg-red-500" },
  [DemandStatus.CANCELED]:    { label: "Cancelada",     color: "#a1a1aa", bg: "bg-zinc-400" },
}

const PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  URGENT: { label: "Urgente", color: "#ef4444", bg: "bg-red-500" },
  HIGH:   { label: "Alta",    color: "#f97316", bg: "bg-orange-500" },
  MEDIUM: { label: "Média",   color: "#0058F3", bg: "bg-primary" },
  LOW:    { label: "Baixa",   color: "#94a3b8", bg: "bg-slate-400" },
}

type Period = "7d" | "30d" | "90d" | "6m" | "1a"

const PERIODS: { key: Period; label: string }[] = [
  { key: "7d",  label: "7 dias" },
  { key: "30d", label: "30 dias" },
  { key: "90d", label: "90 dias" },
  { key: "6m",  label: "6 meses" },
  { key: "1a",  label: "1 ano" },
]

function getPeriodDates(period: Period): { startDate: string; endDate: string } {
  const end = new Date()
  let start: Date

  if (period === "7d")  start = subDays(end, 7)
  else if (period === "30d") start = subDays(end, 30)
  else if (period === "90d") start = subDays(end, 90)
  else if (period === "6m")  start = subMonths(end, 6)
  else start = subYears(end, 1)

  return {
    startDate: format(start, "yyyy-MM-dd"),
    endDate: format(end, "yyyy-MM-dd"),
  }
}

function formatPeriodLabel(start: string, end: string) {
  const s = new Date(start)
  const e = new Date(end)
  return `${format(s, "dd 'de' MMM 'de' yyyy", { locale: ptBR })} – ${format(e, "dd 'de' MMM 'de' yyyy", { locale: ptBR })}`
}

function formatTrendLabel(dateStr: string, periodDays: number): string {
  const date = parseISO(dateStr + "T12:00:00")
  if (periodDays > 180) return format(date, "MMM/yy", { locale: ptBR })
  return format(date, "dd/MM", { locale: ptBR })
}

function exportCSV(report: CabinetReport, cabinetName: string) {
  const lines: string[][] = [
    [`Relatório de Demandas – ${cabinetName}`],
    [`Período`, `${report.period.start.split("T")[0]} a ${report.period.end.split("T")[0]}`],
    [],
    ["RESUMO"],
    ["Indicador", "Valor"],
    ["Total no período", String(report.summary.totalInPeriod)],
    ["Resolvidas", String(report.summary.resolvedInPeriod)],
    ["Taxa de resolução", `${report.summary.resolutionRate}%`],
    ["Em aberto", String(report.summary.openCount)],
    ["Rejeitadas", String(report.summary.rejectedCount)],
    ["Canceladas", String(report.summary.canceledCount)],
    ["Resultados registrados", String(report.resultsInPeriod)],
    [],
    ["DISTRIBUIÇÃO POR STATUS"],
    ["Status", "Quantidade", "Percentual"],
    ...report.byStatus.map(s => [STATUS_CONFIG[s.status]?.label ?? s.status, String(s.count), `${s.percentage}%`]),
    [],
    ["DISTRIBUIÇÃO POR PRIORIDADE"],
    ["Prioridade", "Quantidade", "Percentual"],
    ...report.byPriority.map(p => [PRIORITY_CONFIG[p.priority]?.label ?? p.priority, String(p.count), `${p.percentage}%`]),
    [],
    ["CATEGORIAS"],
    ["Categoria", "Quantidade", "Percentual"],
    ...report.byCategory.map(c => [c.name, String(c.count), `${c.percentage}%`]),
    [],
    ["BAIRROS COM MAIS DEMANDAS"],
    ["Bairro", "Quantidade"],
    ...report.byNeighborhood.map(n => [n.neighborhood, String(n.count)]),
    [],
    ["TENDÊNCIA DIÁRIA"],
    ["Data", "Recebidas", "Resolvidas"],
    ...report.trend.map(t => [t.date, String(t.created), String(t.resolved)]),
  ]

  const csv = lines.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n")
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `relatorio-${cabinetName.toLowerCase().replace(/\s+/g, "-")}-${format(new Date(), "yyyy-MM-dd")}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function Reports() {
  const { setTitle } = usePageTitle()
  const { cabinet } = useAuth()
  const { plans } = useCabinetFeatures()

  useEffect(() => {
    setTitle({ title: "Relatórios" })
  }, [setTitle])
  const [period, setPeriod] = useState<Period>("30d")
  const dates = useMemo(() => getPeriodDates(period), [period])

  const { data: report, isLoading } = useGetCabinetReport({
    slug: cabinet?.slug ?? "",
    startDate: dates.startDate,
    endDate: dates.endDate,
    enabled: !!cabinet?.slug && (plans?.subscription.hasActiveSubscription ?? false),
  })

  const trendData = useMemo(() => {
    if (!report) return []
    return report.trend.map(t => ({
      ...t,
      label: formatTrendLabel(t.date, report.period.days),
    }))
  }, [report])

  return (
    <RequireActiveSubscription>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8" id="report-print-root">
        <div className="report-print-header hidden items-center justify-between pb-4 border-b border-border mb-6">
          <div>
            <h1 className="text-lg font-bold text-foreground">{cabinet?.name ?? "Gabinete"}</h1>
            <p className="text-xs text-muted-foreground">Relatório de Demandas</p>
          </div>
          {report && (
            <p className="text-xs text-muted-foreground">
              {formatPeriodLabel(report.period.start, report.period.end)}
            </p>
          )}
        </div>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Relatórios</h1>
            {report && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatPeriodLabel(report.period.start, report.period.end)}
              </p>
            )}
          </div>
          {report && (
            <div className="report-controls flex items-center gap-2">
              <FeatureGate feature={FEATURES.CSV_EXPORT}>
                <button
                  onClick={() => exportCSV(report, cabinet?.name ?? "gabinete")}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/60 transition-colors shrink-0"
                >
                  <Download className="size-3.5" />
                  CSV
                </button>
              </FeatureGate>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/60 transition-colors shrink-0"
              >
                <FileDown className="size-3.5" />
                PDF
              </button>
            </div>
          )}
        </div>

        <div className="report-controls inline-flex items-center rounded-lg border border-border bg-muted/30 p-0.5 gap-0.5">
          {PERIODS.map(p => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                period === p.key
                  ? "bg-background text-foreground shadow-sm border border-border/60"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {report && !isLoading && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border rounded-xl overflow-hidden border border-border">
              <KpiCard label="Recebidas" value={report.summary.totalInPeriod} />
              <KpiCard
                label="Resolvidas"
                value={report.summary.resolvedInPeriod}
                sub={report.summary.resolutionRate > 0 ? `${report.summary.resolutionRate}% do total` : undefined}
                accent="emerald"
              />
              <KpiCard
                label="Em aberto"
                value={report.summary.openCount}
                accent={report.summary.openCount > 0 ? "amber" : undefined}
              />
              <KpiCard
                label="Resultados"
                value={report.resultsInPeriod}
                icon={<CheckCircle2 className="size-3.5 text-emerald-500" />}
              />
            </div>

            {report.byStatus.length > 0 && (
              <ReportSection number="01" title="Distribuição por status">
                <div className="space-y-2.5">
                  {report.byStatus
                    .sort((a, b) => b.count - a.count)
                    .map((s, i) => {
                      const cfg = STATUS_CONFIG[s.status]
                      return (
                        <DistBar
                          key={s.status}
                          label={cfg?.label ?? s.status}
                          count={s.count}
                          percentage={s.percentage}
                          color={cfg?.bg ?? "bg-muted-foreground/40"}
                          total={report.summary.totalInPeriod}
                          index={i}
                        />
                      )
                    })}
                </div>
              </ReportSection>
            )}

            {report.byPriority.length > 0 && (
              <ReportSection number="02" title="Distribuição por prioridade">
                <div className="space-y-2.5">
                  {report.byPriority
                    .sort((a, b) => b.count - a.count)
                    .map((p, i) => {
                      const cfg = PRIORITY_CONFIG[p.priority]
                      return (
                        <DistBar
                          key={p.priority}
                          label={cfg?.label ?? p.priority}
                          count={p.count}
                          percentage={p.percentage}
                          color={cfg?.bg ?? "bg-muted-foreground/40"}
                          total={report.summary.totalInPeriod}
                          index={i}
                        />
                      )
                    })}
                </div>
              </ReportSection>
            )}

            {report.byCategory.length > 0 && (
              <ReportSection number="03" title="Por categoria">
                <div className="space-y-2">
                  {report.byCategory.map((c, i) => (
                    <div key={c.id} className="flex items-center gap-3">
                      <span className="text-xs tabular-nums text-muted-foreground/50 w-4 shrink-0">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-sm text-foreground truncate">{c.name}</span>
                          <span className="text-xs tabular-nums text-muted-foreground shrink-0">
                            {c.count} · {c.percentage}%
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-primary/70"
                            initial={{ width: 0 }}
                            animate={{ width: `${c.percentage}%` }}
                            transition={{ duration: 0.55, ease: "easeOut", delay: 0.1 + i * 0.04 }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ReportSection>
            )}

            {report.byNeighborhood.length > 0 && (
              <ReportSection number="04" title="Bairros com mais demandas">
                <div className="space-y-1.5">
                  {report.byNeighborhood.map((n, i) => {
                    const max = report.byNeighborhood[0].count
                    const pct = Math.round((n.count / max) * 100)
                    return (
                      <div key={n.neighborhood} className="flex items-center gap-3">
                        <span className="text-xs tabular-nums text-muted-foreground/50 w-4 shrink-0">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-sm text-foreground truncate">{n.neighborhood}</span>
                            <span className="text-xs tabular-nums text-muted-foreground shrink-0">{n.count}</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                            <motion.div
                              className="h-full rounded-full bg-muted-foreground/30"
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.55, ease: "easeOut", delay: 0.1 + i * 0.04 }}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </ReportSection>
            )}

            {trendData.length > 0 && (
              <ReportSection number="05" title="Volume ao longo do tempo" icon={<BarChart3 className="size-3.5" />}>
                <div className="flex items-center gap-4 mb-4">
                  <LegendDot color="bg-primary" label="Recebidas" />
                  <LegendDot color="bg-emerald-500" label="Resolvidas" />
                </div>

                <div className="report-chart-screen">
                  <ChartContainer
                    config={{
                      created:  { label: "Recebidas",  color: "#0058F3" },
                      resolved: { label: "Resolvidas", color: "#22c55e" },
                    }}
                    className="h-64 w-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trendData} margin={{ top: 8, right: 4, left: -24, bottom: 0 }}>
                        <defs>
                          <linearGradient id="grad-created" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%"  stopColor="#0058F3" stopOpacity={0.22} />
                            <stop offset="85%" stopColor="#0058F3" stopOpacity={0.02} />
                          </linearGradient>
                          <linearGradient id="grad-resolved" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%"  stopColor="#22c55e" stopOpacity={0.22} />
                            <stop offset="85%" stopColor="#22c55e" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} strokeDasharray="3 6" stroke="hsl(var(--border))" strokeOpacity={0.7} />
                        <XAxis
                          dataKey="label"
                          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                          axisLine={false}
                          tickLine={false}
                          interval="preserveStartEnd"
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                          axisLine={false}
                          tickLine={false}
                          allowDecimals={false}
                          width={28}
                        />
                        <ChartTooltip
                          cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1, strokeDasharray: "4 4" }}
                          content={({ active, payload, label }) => {
                            if (!active || !payload?.length) return null
                            return (
                              <div className="rounded-xl border border-border/60 bg-background/98 px-3.5 py-3 shadow-lg shadow-black/8 min-w-40 space-y-2.5">
                                <p className="text-2xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
                                <div className="h-px bg-border/50" />
                                {payload.map((p, i) => (
                                  <div key={i} className="flex items-center justify-between gap-6">
                                    <div className="flex items-center gap-2">
                                      <span className="size-2 rounded-full shrink-0" style={{ background: p.color }} />
                                      <span className="text-xs text-muted-foreground">{p.name}</span>
                                    </div>
                                    <span className="font-mono text-sm font-bold tabular-nums text-foreground">{p.value}</span>
                                  </div>
                                ))}
                              </div>
                            )
                          }}
                        />
                        <Area type="monotone" dataKey="created" name="Recebidas" stroke="#0058F3" strokeWidth={2.5} fill="url(#grad-created)" dot={false} activeDot={{ r: 5, fill: "#0058F3", stroke: "white", strokeWidth: 2 }} animationDuration={900} animationEasing="ease-out" />
                        <Area type="monotone" dataKey="resolved" name="Resolvidas" stroke="#22c55e" strokeWidth={2.5} fill="url(#grad-resolved)" dot={false} activeDot={{ r: 5, fill: "#22c55e", stroke: "white", strokeWidth: 2 }} animationDuration={900} animationBegin={150} animationEasing="ease-out" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>

                <div className="report-trend-print hidden">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-1.5 text-muted-foreground font-medium">Data</th>
                        <th className="text-right py-1.5 text-muted-foreground font-medium">Recebidas</th>
                        <th className="text-right py-1.5 text-muted-foreground font-medium">Resolvidas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trendData.filter(d => d.created > 0 || d.resolved > 0).map((d, i) => (
                        <tr key={i} className="border-b border-border/40">
                          <td className="py-1 text-foreground">{d.label}</td>
                          <td className="py-1 text-right tabular-nums font-medium" style={{ color: "#0058F3" }}>{d.created}</td>
                          <td className="py-1 text-right tabular-nums font-medium" style={{ color: "#22c55e" }}>{d.resolved}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-border">
                        <td className="py-1.5 font-semibold text-foreground">Total</td>
                        <td className="py-1.5 text-right tabular-nums font-bold" style={{ color: "#0058F3" }}>
                          {trendData.reduce((s, d) => s + d.created, 0)}
                        </td>
                        <td className="py-1.5 text-right tabular-nums font-bold" style={{ color: "#22c55e" }}>
                          {trendData.reduce((s, d) => s + d.resolved, 0)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </ReportSection>
            )}

            {report.summary.totalInPeriod === 0 && (
              <div className="rounded-xl border border-border bg-muted/20 px-6 py-12 text-center">
                <p className="text-sm text-muted-foreground">Nenhuma demanda no período selecionado.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </RequireActiveSubscription>
  )
}

function KpiCard({
  label,
  value,
  sub,
  accent,
  icon,
}: {
  label: string
  value: number
  sub?: string
  accent?: "emerald" | "amber"
  icon?: React.ReactNode
}) {
  return (
    <div className="bg-background px-4 py-4 flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <span
        className={cn(
          "text-2xl font-semibold tabular-nums leading-none",
          accent === "emerald" && "text-emerald-600 dark:text-emerald-400",
          accent === "amber" && value > 0 && "text-amber-600 dark:text-amber-400",
        )}
      >
        {value.toLocaleString("pt-BR")}
      </span>
      {sub && <span className="text-xs text-muted-foreground/70 leading-none">{sub}</span>}
    </div>
  )
}

function ReportSection({
  number,
  title,
  icon,
  children,
}: {
  number: string
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="report-section rounded-xl border border-border bg-background p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs font-semibold tabular-nums text-muted-foreground/40">{number}</span>
        {icon}
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      </div>
      {children}
    </div>
  )
}

function DistBar({
  label,
  count,
  percentage,
  color,
  total,
  index = 0,
}: {
  label: string
  count: number
  percentage: number
  color: string
  total: number
  index?: number
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-28 shrink-0">
        <span className="text-sm text-foreground">{label}</span>
      </div>
      <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
        <motion.div
          className={cn("h-full rounded-full", color)}
          initial={{ width: 0 }}
          animate={{ width: total > 0 ? `${percentage}%` : "0%" }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 + index * 0.05 }}
        />
      </div>
      <div className="w-16 text-right shrink-0">
        <span className="text-xs tabular-nums text-muted-foreground">
          {count} <span className="text-muted-foreground/50">({percentage}%)</span>
        </span>
      </div>
    </div>
  )
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={cn("size-2 rounded-full shrink-0", color)} />
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}
