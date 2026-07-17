import { DemandsApi } from "@/api/demands"
import { queryClient } from "@/api/queryClient"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useMutation, useQuery } from "@tanstack/react-query"
import { CheckCircle2, Loader2, Star } from "lucide-react"
import { useState } from "react"
import { useParams, Link } from "react-router-dom"
import Logo from "@/assets/logo-new.png"

export function DemandSurveyPage() {
  const { token } = useParams() as { token: string }
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const { data: survey, isLoading, isError } = useQuery({
    queryKey: ["demand-survey", token],
    queryFn: () => DemandsApi.getSurvey(token),
    enabled: !!token,
    retry: false,
  })

  const { mutateAsync: submit, isPending } = useMutation({
    mutationFn: () => DemandsApi.submitSurvey(token, rating, comment || undefined),
    onSuccess: () => {
      setSubmitted(true)
      queryClient.invalidateQueries({ queryKey: ["demands"] })
      queryClient.invalidateQueries({ queryKey: ["demands-infinite"] })
      queryClient.invalidateQueries({ queryKey: ["my-demands"] })
    },
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isError || !survey) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-lg font-semibold text-foreground">Pesquisa não encontrada</p>
        <p className="text-sm text-muted-foreground">Este link de avaliação é inválido ou já expirou.</p>
        <Button asChild variant="outline" size="sm">
          <Link to="/">Ir para a página inicial</Link>
        </Button>
      </div>
    )
  }

  const alreadyDone = survey.alreadySubmitted || submitted

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col">
      <header className="bg-background border-b border-border/40 px-4 py-3 flex items-center">
        <img src={Logo} alt="Gabinete App" className="w-28" />
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-background border border-border rounded-2xl shadow-sm p-8">
          {alreadyDone ? (
            <div className="text-center space-y-4">
              <div className="size-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto">
                <CheckCircle2 className="size-8 text-emerald-500" />
              </div>
              <h1 className="text-xl font-bold text-foreground">Obrigado pela avaliação!</h1>
              <p className="text-sm text-muted-foreground">
                Seu feedback é muito importante para que o{" "}
                <span className="font-medium text-foreground">{survey.cabinetName}</span>{" "}
                continue melhorando o atendimento.
              </p>
              <div className="flex items-center justify-center gap-2 mt-2">
                {survey.cabinetSlug && (
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/${survey.cabinetSlug}`}>Ver perfil do gabinete</Link>
                  </Button>
                )}
                <Button asChild size="sm">
                  <Link to="/">Voltar ao início</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                  {survey.cabinetName}
                </p>
                <h1 className="text-xl font-bold text-foreground">Como foi o atendimento?</h1>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Sua demanda{" "}
                  <span className="font-medium text-foreground">"{survey.demandTitle}"</span>{" "}
                  foi resolvida. Avalie o atendimento recebido.
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">Sua nota</p>
                <div className="flex items-center gap-1.5" onMouseLeave={() => setHovered(0)}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHovered(star)}
                      className="transition-transform hover:scale-110 focus:outline-none"
                    >
                      <Star
                        className={cn(
                          "size-10 transition-colors",
                          (hovered || rating) >= star
                            ? "fill-amber-400 text-amber-400"
                            : "fill-muted text-muted-foreground/30",
                        )}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {rating === 1 && "Muito ruim"}
                    {rating === 2 && "Ruim"}
                    {rating === 3 && "Regular"}
                    {rating === 4 && "Bom"}
                    {rating === 5 && "Excelente!"}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="comment" className="text-sm font-medium text-foreground">
                  Comentário{" "}
                  <span className="text-muted-foreground font-normal">(opcional)</span>
                </label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Conte o que poderia ter sido melhor ou o que você gostou..."
                  rows={3}
                  maxLength={500}
                  className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <Button
                onClick={() => submit()}
                disabled={rating === 0 || isPending}
                className="w-full"
              >
                {isPending && <Loader2 className="size-4 animate-spin" />}
                Enviar avaliação
              </Button>

              {rating === 0 && (
                <p className="text-xs text-center text-muted-foreground">Selecione uma nota para continuar</p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

