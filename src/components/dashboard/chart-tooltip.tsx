interface ChartTooltipPayload {
  name?: string
  value: number
  color?: string
  payload: Record<string, string | number>
}

interface ChartTooltipProps {
  active?: boolean
  payload?: ChartTooltipPayload[]
  labelKey?: string
}

export function ChartTooltip({ active, payload, labelKey = "label" }: ChartTooltipProps) {
  if (!active || !payload?.length) return null
  const label = String(payload[0].payload[labelKey] ?? "")
  return (
    <div className="rounded-xl border border-border/60 bg-background/98 px-3.5 py-3 shadow-lg shadow-black/8 min-w-40 space-y-2.5">
      <p className="text-2xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
      <div className="h-px bg-border/50" />
      {payload.map((item, i) => (
        <div key={i} className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full shrink-0" style={{ background: item.color }} />
            <span className="text-xs text-muted-foreground">{item.name}</span>
          </div>
          <span className="font-mono text-sm font-bold tabular-nums text-foreground">{item.value}</span>
        </div>
      ))}
    </div>
  )
}
