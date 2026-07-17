import type { ReporterMonthlyActivity } from "@/api/demands/types"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

const PRIMARY = "#0058F3"

interface ActivityChartProps {
  data: ReporterMonthlyActivity[]
}

function ChartTip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { value: number }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-border/60 bg-background/98 px-3.5 py-2.5 shadow-lg shadow-black/8 min-w-32 space-y-1.5">
      <p className="text-2xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <div className="h-px bg-border/50" />
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-1.5">
          <div className="size-2 rounded-full shrink-0" style={{ background: PRIMARY }} />
          <span className="text-xs text-muted-foreground">Demandas</span>
        </div>
        <span className="font-mono text-sm font-bold tabular-nums text-foreground">
          {payload[0].value}
        </span>
      </div>
    </div>
  )
}

export function ActivityChart({ data }: ActivityChartProps) {
  const max = Math.max(...data.map((d) => d.count), 1)

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart
        data={data}
        barCategoryGap="28%"
        margin={{ top: 4, right: 8, bottom: 0, left: -12 }}
      >
        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={PRIMARY} stopOpacity={1} />
            <stop offset="100%" stopColor={PRIMARY} stopOpacity={0.55} />
          </linearGradient>
          <linearGradient id="barGradDim" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={PRIMARY} stopOpacity={0.35} />
            <stop offset="100%" stopColor={PRIMARY} stopOpacity={0.15} />
          </linearGradient>
        </defs>
        <CartesianGrid
          vertical={false}
          strokeDasharray="2 4"
          stroke="currentColor"
          className="text-border"
          strokeOpacity={0.5}
        />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "currentColor" }}
          className="text-muted-foreground"
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 11, fill: "currentColor" }}
          className="text-muted-foreground"
          axisLine={false}
          tickLine={false}
          width={24}
        />
        <Tooltip
          content={<ChartTip />}
          cursor={{ fill: "hsl(var(--muted))", opacity: 0.5, radius: 6 }}
        />
        <Bar dataKey="count" radius={[5, 5, 2, 2]} maxBarSize={40} animationDuration={700} animationEasing="ease-out">
          {data.map((entry, i) => (
            <Cell
              key={i}
              fill={entry.count === max && max > 0 ? "url(#barGrad)" : "url(#barGradDim)"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
