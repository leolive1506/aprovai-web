import { useAuth } from "@/hooks/use-auth"
import { useCabinetFeatures } from "@/hooks/use-cabinet-features"
import { cn } from "@/lib/utils"
import { WHATSAPP_URL } from "@/pages/public/landing/constants"
import { AlertTriangle, PhoneCall, XCircle } from "lucide-react"

const WARNING_WINDOW_DAYS = 7

export function SubscriptionStatusBanner() {
  const { user, cabinet } = useAuth()
  const { plans, isLoading } = useCabinetFeatures()

  if (!user?.isCabinetMember || !cabinet || isLoading || !plans) return null

  const { hasActiveSubscription, currentPeriodEnd } = plans.subscription

  if (!hasActiveSubscription) {
    return (
      <div className="flex items-start gap-2.5 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2.5 mb-4">
        <div className="shrink-0 mt-0.5">
          <XCircle className="size-4 text-destructive" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-destructive">
            Este gabinete não possui uma assinatura ativa
          </p>
          <p className="text-xs mt-0.5 text-destructive/80">
            Você pode visualizar os dados existentes, mas não é possível criar novas demandas,
            resultados ou convidar membros até regularizar a assinatura.
          </p>
        </div>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium border transition-colors border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/20"
        >
          <PhoneCall className="size-3" />
          Falar com Consultor
        </a>
      </div>
    )
  }

  if (currentPeriodEnd) {
    const daysLeft = Math.ceil(
      (new Date(currentPeriodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    )
    if (daysLeft >= 0 && daysLeft <= WARNING_WINDOW_DAYS) {
      return (
        <div
          className={cn(
            "flex items-start gap-2.5 rounded-md border px-3 py-2.5 mb-4",
            "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30",
          )}
        >
          <div className="shrink-0 mt-0.5">
            <AlertTriangle className="size-4 text-amber-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-amber-800 dark:text-amber-300">
              {daysLeft === 0
                ? "Sua assinatura vence hoje"
                : daysLeft === 1
                  ? "Sua assinatura vence em 1 dia"
                  : `Sua assinatura vence em ${daysLeft} dias`}
            </p>
            <p className="text-xs mt-0.5 text-amber-700 dark:text-amber-400">
              Vencimento em {new Date(currentPeriodEnd).toLocaleDateString("pt-BR")}. Entre em
              contato com um Consultor para renovar e evitar interrupções.
            </p>
          </div>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium border transition-colors border-amber-300 bg-amber-100 text-amber-800 hover:bg-amber-200 dark:border-amber-700 dark:bg-amber-900/40 dark:text-amber-300 dark:hover:bg-amber-900/60"
          >
            <PhoneCall className="size-3" />
            Falar com Consultor
          </a>
        </div>
      )
    }
  }

  return null
}
