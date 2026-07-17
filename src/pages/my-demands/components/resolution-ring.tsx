import { cn } from "@/lib/utils"

interface ResolutionRingProps {
  rate: number
  resolved: number
  total: number
  className?: string
}

export function ResolutionRing({ rate, resolved, total, className }: ResolutionRingProps) {
  const size = 140
  const strokeWidth = 10
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const clampedRate = Math.min(100, Math.max(0, rate))
  const dashOffset = circumference - (clampedRate / 100) * circumference

  const isGood = rate >= 50
  const progressColor = isGood ? "text-emerald-500" : "text-primary"

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted/60"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            className={cn("transition-all duration-700 ease-out", progressColor)}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold tabular-nums text-foreground leading-none">
            {clampedRate}%
          </span>
          <span className="text-2xs font-medium text-muted-foreground mt-1 uppercase tracking-widest">
            resolvidas
          </span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center leading-relaxed">
        {total === 0 ? (
          "Nenhuma demanda registrada ainda"
        ) : (
          <>
            <span className="font-semibold text-foreground">{resolved}</span>
            {" de "}
            <span className="font-semibold text-foreground">{total}</span>
            {" demandas resolvidas"}
          </>
        )}
      </p>
    </div>
  )
}
