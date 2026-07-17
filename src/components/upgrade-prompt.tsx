import { FEATURE_LABELS, type FeatureSlug } from "@/api/plans/features"
import { LockIcon } from "lucide-react"

interface Props {
  feature: FeatureSlug
  className?: string
}

export function UpgradePrompt({ feature, className }: Props) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center ${className ?? ""}`}>
      <div className="flex size-10 items-center justify-center rounded-full bg-muted">
        <LockIcon className="size-5 text-muted-foreground" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-foreground">
          {FEATURE_LABELS[feature] ?? feature} não disponível
        </p>
        <p className="text-xs text-muted-foreground">
          Esta funcionalidade não está incluída no plano atual do gabinete.
        </p>
      </div>
    </div>
  )
}
