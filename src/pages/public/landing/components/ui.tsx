import { cn } from "@/lib/utils"

export const PRIORITY_STRIPE: Record<string, string> = {
  URGENT: "border-l-2 border-l-red-500",
  HIGH: "border-l-2 border-l-orange-400",
  MEDIUM: "border-l-2 border-l-sky-400",
  LOW: "border-l-2 border-l-border",
}

export const STATUS_CFG = {
  SUBMITTED: { label: "Enviada", dot: "bg-slate-400", cls: "border-slate-200 bg-slate-50 text-slate-600" },
  IN_ANALYSIS: { label: "Em análise", dot: "bg-blue-500", cls: "border-blue-200 bg-blue-50 text-blue-600" },
  IN_PROGRESS: { label: "Em progresso", dot: "bg-amber-500", cls: "border-amber-200 bg-amber-50 text-amber-700" },
  RESOLVED: { label: "Resolvida", dot: "bg-emerald-500", cls: "border-emerald-200 bg-emerald-50 text-emerald-700" },
} as const

export type StatusKey = keyof typeof STATUS_CFG

export function StatusBadge({ status }: { status: StatusKey }) {
  const cfg = STATUS_CFG[status]
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium leading-none h-5 shrink-0", cfg.cls)}>
      <span className={cn("size-1.5 rounded-full shrink-0", cfg.dot)} />
      {cfg.label}
    </span>
  )
}

export function MiniAvatar({ initials, color, size = 24 }: { initials: string; color: string; size?: number }) {
  return (
    <div
      className={cn("rounded-full flex items-center justify-center shrink-0 font-bold text-white", color)}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials}
    </div>
  )
}
