import { UsersApi } from "@/api/users"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "../ui/button"
import { Checkbox } from "../ui/checkbox"
import { useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"

export function ConsentOverlay() {
  const { user, updateLocalUser } = useAuth()
  const [accepted, setAccepted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!user || user.termsAcceptedAt) return null

  async function handleAccept() {
    if (!accepted) {
      toast.error("Você deve aceitar os termos para continuar.")
      return
    }

    try {
      setIsSubmitting(true)
      await UsersApi.updateProfile(user!.id, { termsAcceptedAt: new Date() })
      updateLocalUser({ termsAcceptedAt: new Date().toISOString() })
      toast.success("Termos aceitos com sucesso!")
    } catch {
      toast.error("Erro ao processar sua solicitação.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-9999 bg-background/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl shadow-lg max-w-lg w-full animate-in fade-in zoom-in duration-300">
        <div className="p-8 flex flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <h2 className="text-lg font-semibold text-foreground tracking-tight">
              Privacidade e Termos
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Para continuar no <strong className="text-foreground font-medium">Gabinete App</strong>, por favor aceite nossos termos atualizados conforme a LGPD.
            </p>
          </div>

          <div className="flex items-start gap-3 rounded-lg bg-muted/40 border border-border px-4 py-3">
            <Checkbox
              id="consent-check"
              checked={accepted}
              onCheckedChange={(checked) => setAccepted(!!checked)}
              className="mt-0.5"
            />
            <label
              htmlFor="consent-check"
              className="text-sm text-foreground leading-snug cursor-pointer"
            >
              Concordo com os{" "}
              <Link to="/termos-de-uso" target="_blank" className="text-primary hover:underline">
                Termos de Uso
              </Link>{" "}
              e a{" "}
              <Link to="/politica-de-privacidade" target="_blank" className="text-primary hover:underline">
                Política de Privacidade
              </Link>
            </label>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={handleAccept}
              disabled={!accepted || isSubmitting}
              className="w-full"
            >
              {isSubmitting ? "Salvando..." : "Aceitar e Continuar"}
            </Button>
            <button
              onClick={() => (window.location.href = "/login")}
              className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Sair da conta
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

