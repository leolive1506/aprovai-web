import { cn } from "@/lib/utils"
import { AlertTriangle, PhoneCall, XCircle } from "lucide-react"

const WHATSAPP_URL = "https://wa.me/5511999999999"

interface Props {
  current: number
  max: number
  label: string
  warnThreshold?: number
  formatValue?: (n: number) => string
}

export function PlanLimitBanner({ current, max, label, warnThreshold = 0.8, formatValue }: Props) {
  const pct = Math.min(current / max, 1)
  const fmt = formatValue ?? ((n: number) => String(n))
  const isWarning = pct >= warnThreshold && pct < 1
  const isExceeded = pct >= 1

  const barColor = isExceeded
    ? "bg-destructive"
    : isWarning
      ? "bg-amber-500"
      : pct >= 0.6
        ? "bg-amber-400"
        : "bg-emerald-500"

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{label}</span>
          <span className={cn("text-xs font-medium tabular-nums", isExceeded ? "text-destructive" : isWarning ? "text-amber-600" : "text-foreground")}>
            {fmt(current)} / {fmt(max)}
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all", barColor)}
            style={{ width: `${pct * 100}%` }}
          />
        </div>
      </div>

      {(isWarning || isExceeded) && (
        <div
          className={cn(
            "flex items-start gap-2.5 rounded-md border px-3 py-2.5",
            isExceeded
              ? "border-destructive/30 bg-destructive/5"
              : "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30",
          )}
        >
          <div className="shrink-0 mt-0.5">
            {isExceeded ? (
              <XCircle className="size-4 text-destructive" />
            ) : (
              <AlertTriangle className="size-4 text-amber-500" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className={cn("text-xs font-medium", isExceeded ? "text-destructive" : "text-amber-800 dark:text-amber-300")}>
              {isExceeded
                ? `Limite de ${label.toLowerCase()} atingido`
                : `Você está em ${Math.round(pct * 100)}% do limite de ${label.toLowerCase()}`}
            </p>
            <p className={cn("text-xs mt-0.5", isExceeded ? "text-destructive/80" : "text-amber-700 dark:text-amber-400")}>
              {isExceeded
                ? "Não é possível adicionar mais itens. Entre em contato com um Consultor para fazer upgrade do plano."
                : "Considere fazer upgrade do seu plano antes de atingir o limite. Entre em contato com um Consultor."}
            </p>
          </div>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "shrink-0 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium border transition-colors",
              isExceeded
                ? "border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/20"
                : "border-amber-300 bg-amber-100 text-amber-800 hover:bg-amber-200 dark:border-amber-700 dark:bg-amber-900/40 dark:text-amber-300 dark:hover:bg-amber-900/60",
            )}
          >
            <PhoneCall className="size-3" />
            Falar com Consultor
          </a>
        </div>
      )}
    </div>
  )
}
