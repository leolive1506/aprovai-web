import { useMyCompany } from "@/api/companies/hooks"
import { useAuth } from "@/hooks/use-auth"
import { usePageTitle } from "@/hooks/use-page-title"
import { getFormattedDate, getGreeting } from "@/utils/date"
import { Building2, Loader2, Users } from "lucide-react"
import { useEffect } from "react"
import { Link } from "react-router-dom"

export function Home() {
  const { setTitle } = usePageTitle()
  const { user } = useAuth()
  const { data: company, isLoading } = useMyCompany()

  useEffect(() => {
    setTitle({ title: "Início", description: "Visão geral da empresa" })
  }, [setTitle])

  const firstName = user?.name?.split(" ")[0] ?? "usuário"

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold font-brand text-foreground tracking-tight leading-none">
          Início
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 capitalize">
          {getGreeting()}, {firstName} · {getFormattedDate()}
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : company ? (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-border/50">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Building2 className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{company.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {[company.industry, company.teamSize && `${company.teamSize} pessoas`].filter(Boolean).join(" · ") || "Sem detalhes cadastrados"}
              </p>
            </div>
          </div>

          <Link
            to="/equipe"
            className="flex items-center gap-3 px-6 py-4 hover:bg-muted/30 transition-colors"
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Users className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">Equipe</p>
              <p className="text-xs text-muted-foreground">Convide colegas e aprovadores</p>
            </div>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-card py-16 text-center">
          <Building2 className="size-8 text-muted-foreground/30" />
          <p className="text-sm font-medium text-foreground">Nenhuma empresa configurada</p>
          <p className="text-xs text-muted-foreground">Complete o onboarding para configurar sua empresa.</p>
        </div>
      )}
    </div>
  )
}
