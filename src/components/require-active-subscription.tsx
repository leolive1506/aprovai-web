import { useCabinetFeatures } from "@/hooks/use-cabinet-features"
import { WHATSAPP_URL } from "@/pages/public/landing/constants"
import { PhoneCall, ShieldAlert } from "lucide-react"
import type { ReactNode } from "react"

interface Props {
  children: ReactNode
}

export function RequireActiveSubscription({ children }: Props) {
  const { plans, isLoading } = useCabinetFeatures()

  if (isLoading) return <>{children}</>

  if (plans && !plans.subscription.hasActiveSubscription) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-muted/30 p-12 text-center max-w-md mx-auto mt-8">
        <div className="flex size-10 items-center justify-center rounded-full bg-muted">
          <ShieldAlert className="size-5 text-muted-foreground" />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-foreground">
            Este gabinete não possui uma assinatura ativa
          </p>
          <p className="text-xs text-muted-foreground">
            Esta página fica disponível novamente após a regularização da assinatura.
          </p>
        </div>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium border transition-colors border-border bg-background text-foreground hover:bg-muted mt-1"
        >
          <PhoneCall className="size-3" />
          Falar com Consultor
        </a>
      </div>
    )
  }

  return <>{children}</>
}
