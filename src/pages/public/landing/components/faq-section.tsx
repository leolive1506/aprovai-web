import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { useInView } from "../hooks/use-in-view"

export type FaqItem = { q: string; a: string }

export const FAQ_ITEMS: FaqItem[] = [
  {
    q: "Quando a plataforma vai ser lançada?",
    a: "A beta fechada começa em 2025 com um grupo pequeno de gabinetes. Quem entra na lista de espera agora é notificado primeiro e tem acesso gratuito nos primeiros meses.",
  },
  {
    q: "O que está incluído no acesso da beta?",
    a: "Acesso completo à plataforma, suporte direto com o time e influência real sobre o que priorizamos. Os primeiros gabinetes moldam o produto.",
  },
  {
    q: "O cidadão precisa instalar alguma coisa?",
    a: "Não. O portal público funciona pelo navegador. Para registrar uma demanda, o cidadão só precisa do link do gabinete. Sem cadastro, sem app.",
  },
  {
    q: "Funciona para qualquer cargo eletivo?",
    a: "Sim. O fluxo é adaptável para vereadores, deputados estaduais e federais e senadores, independente do tamanho da equipe.",
  },
  {
    q: "Como os dados ficam armazenados?",
    a: "A plataforma segue a LGPD. Dados armazenados no Brasil, criptografados em trânsito e em repouso. Cada gabinete tem seus dados completamente isolados dos demais.",
  },
  {
    q: "Quanto vai custar depois da beta?",
    a: "Ainda definindo a precificação com base nos primeiros usuários. Quem entrar na beta terá condições especiais garantidas.",
  },
]

export function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null)
  const { ref, visible } = useInView()

  return (
    <section className="py-24 sm:py-32 bg-background border-t border-border" id="faq">
      <div ref={ref} className="max-w-5xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-12 lg:gap-24">
          <div
            className={cn(
              "flex flex-col gap-4 lg:sticky lg:top-28 self-start transition-all duration-500",
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
            )}
          >
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-primary">FAQ</p>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground leading-[1.07]">
              Dúvidas frequentes.
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mt-1">
              Não encontrou o que precisava? Fale pelo WhatsApp. Respondemos no mesmo dia.
            </p>
          </div>

          <div
            className={cn(
              "flex flex-col transition-all duration-500 delay-100",
              visible ? "opacity-100" : "opacity-0",
            )}
          >
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} className="border-t border-border/50 last:border-b last:border-border/50">
                <button
                  type="button"
                  onClick={() => setOpenIdx(openIdx === i ? null : i)}
                  className="flex w-full items-start gap-4 py-6 text-left group"
                  aria-expanded={openIdx === i}
                >
                  <span className="flex-1 text-sm font-semibold text-foreground group-hover:text-foreground/75 transition-colors leading-snug">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={cn(
                      "shrink-0 size-4 text-muted-foreground/40 transition-transform duration-200 mt-0.5",
                      openIdx === i && "rotate-180 text-primary",
                    )}
                  />
                </button>
                <div
                  className={cn(
                    "grid transition-all duration-300 ease-out",
                    openIdx === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="pb-6 text-sm text-muted-foreground leading-[1.85]">
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
