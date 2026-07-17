import { cn } from "@/lib/utils"
import { useInView } from "../hooks/use-in-view"
import { MessageCircle } from "lucide-react"
import { WHATSAPP_URL } from "../constants"
import { trackWhatsappClick } from "@/lib/analytics"

const QUOTES = [
  {
    text: "A gente perde demanda toda semana. Chega por WhatsApp, por e-mail e pessoalmente. Não tem como controlar tudo ao mesmo tempo.",
    role: "Chefe de gabinete",
    context: "Câmara Municipal — Interior de SP",
    initial: "C",
  },
  {
    text: "O cidadão liga para cobrar e a gente não sabe nem quem estava responsável. Isso gera desgaste direto com o vereador.",
    role: "Assessor parlamentar",
    context: "Câmara Municipal — MG",
    initial: "A",
  },
  {
    text: "Na hora de mostrar o que o mandato fez, não tenho dado nenhum. Tudo ficou espalhado no grupo do zap.",
    role: "Vereador",
    context: "Sul do Brasil",
    initial: "V",
  },
]

export function TestimonialsSection() {
  const { ref, visible } = useInView()

  return (
    <section className="py-24 sm:py-32 bg-foreground" id="depoimentos">
      <div ref={ref} className="max-w-5xl mx-auto px-5 sm:px-8">
        <div
          className={cn(
            "mb-16 transition-all duration-500",
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          )}
        >
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-background/40 mb-4">
            O que ouvimos
          </p>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-background leading-[1.07] max-w-sm">
              Antes de escrever código, ouvimos quem trabalha em gabinete.
            </h2>
            <p className="text-sm text-background/50 leading-relaxed max-w-xs">
              Entrevistamos assessores e vereadores. Essas são as palavras deles, sem editar.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {QUOTES.map((q, i) => (
            <div
              key={i}
              className={cn(
                "flex flex-col gap-5 rounded-xl border border-background/10 bg-background/6 p-6",
                "transition-all duration-500",
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
              )}
              style={{ transitionDelay: `${i * 90}ms` }}
            >
              <p className="text-sm text-background/75 leading-[1.8] flex-1">
                "{q.text}"
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-background/10">
                <div className="size-8 rounded-full bg-background/10 border border-background/15 flex items-center justify-center shrink-0">
                  <span className="text-xs font-black text-background/50">{q.initial}</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-background/70">{q.role}</p>
                  <p className="text-xs text-background/35 mt-0.5">{q.context}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div
          className={cn(
            "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-background/10 bg-background/4 px-6 py-5",
            "transition-all duration-500 delay-300",
            visible ? "opacity-100" : "opacity-0",
          )}
        >
          <p className="text-sm text-background/50 max-w-md leading-relaxed">
            Você é assessor, chefe de gabinete ou gestor? Adoramos conversar antes do lançamento.
          </p>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackWhatsappClick("testimonials")}
            className="inline-flex items-center gap-2 shrink-0 rounded-lg border border-background/15 bg-background/10 px-4 py-2.5 text-sm font-semibold text-background/80 hover:bg-background/15 transition-colors"
          >
            <MessageCircle className="size-4" />
            Falar com o time
          </a>
        </div>
      </div>
    </section>
  )
}
