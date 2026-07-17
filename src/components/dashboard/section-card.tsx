import { cn } from "@/lib/utils"

interface SectionCardProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export function SectionCard({ children, className, style }: SectionCardProps) {
  return (
    <div
      className={cn("rounded-2xl border border-border bg-card overflow-hidden", className)}
      style={style}
    >
      {children}
    </div>
  )
}

interface SectionCardHeaderProps {
  icon: React.ElementType
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export function SectionCardHeader({ icon: Icon, title, subtitle, action }: SectionCardHeaderProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
      <div className="flex items-center gap-2.5">
        <div className="size-7 rounded-lg bg-muted flex items-center justify-center shrink-0">
          <Icon className="size-3.5 text-muted-foreground" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-foreground leading-none">{title}</h2>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
