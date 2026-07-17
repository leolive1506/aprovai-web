import { cardVariant } from "@/utils/animation"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import { motion } from "framer-motion"

interface KpiBadgeProps {
  text: string
  variant: "success" | "warning" | "danger" | "info"
}

const badgeStyles: Record<KpiBadgeProps["variant"], string> = {
  success: "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800",
  warning: "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800",
  danger: "bg-red-50 text-red-600 border-red-100 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800",
  info: "bg-primary/5 text-primary border-primary/15",
}

export function KpiBadge({ text, variant }: KpiBadgeProps) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-semibold", badgeStyles[variant])}>
      {text}
    </span>
  )
}

interface KpiCardProps {
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  label: string
  value: string
  sub?: string
  badge?: KpiBadgeProps
  loading?: boolean
  onClick?: () => void
}

export function KpiCard({ icon, iconBg, iconColor, label, value, sub, badge, loading, onClick }: KpiCardProps) {
  return (
    <motion.button
      variants={cardVariant}
      onClick={onClick}
      disabled={!onClick}
      whileHover={onClick ? { y: -1, transition: { duration: 0.15 } } : undefined}
      whileTap={onClick ? { scale: 0.99 } : undefined}
      className={cn(
        "relative w-full rounded-2xl border border-border bg-card p-4 sm:p-5 flex flex-col gap-3 text-left overflow-hidden transition-all duration-150",
        onClick ? "hover:shadow-md hover:border-border/60 cursor-pointer" : "cursor-default",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className={cn("flex items-center justify-center size-9 rounded-xl shrink-0", iconBg)}>
          <span className={cn("flex items-center justify-center", iconColor)}>{icon}</span>
        </div>
        {badge && <KpiBadge {...badge} />}
      </div>
      {loading ? (
        <div className="h-9 flex items-center">
          <Loader2 className="size-4 text-muted-foreground animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          <p className="text-2xl sm:text-3xl font-bold tabular-nums text-foreground leading-none tracking-tight">
            {value}
          </p>
          <p className="text-xs text-muted-foreground leading-snug">{label}</p>
          {sub && <p className="text-2xs text-muted-foreground/70 leading-snug">{sub}</p>}
        </div>
      )}
    </motion.button>
  )
}
