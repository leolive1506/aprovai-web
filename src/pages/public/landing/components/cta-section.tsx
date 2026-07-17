import { useState } from "react"
import { ArrowRight, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useInView } from "../hooks/use-in-view"
import { WHATSAPP_URL } from "../constants"
import { trackCtaClick, trackWhatsappClick } from "@/lib/analytics"

export function CTASection() {
  const { ref, visible } = useInView()
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    trackCtaClick("cta_bottom_waitlist")
    await new Promise((r) => setTimeout(r, 700))
    setLoading(false)
    setSubmitted(true)
  }

  return (
    <section className="relative overflow-hidden bg-foreground py-24 sm:py-32">
      <div className="absolute inset-x-0 top-0 h-64 bg-linear-to-b from-primary/8 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-200 h-48 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      <div
        ref={ref}
        className={cn(
          "relative max-w-5xl mx-auto px-5 sm:px-8 transition-all duration-500",
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
        )}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="flex flex-col gap-6">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-background/35">
              Lista de espera
            </p>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-background leading-[1.05]">
              Vagas abertas para a beta.
            </h2>
            <p className="text-base text-background/50 leading-relaxed max-w-sm">
              A beta está rodando com um grupo fechado de gabinetes.
              Entre na lista. Avisamos quando abrirmos novas vagas.
            </p>

            <div className="flex flex-col gap-3 mt-2">
              {[
                "Acesso gratuito durante a beta",
                "Suporte direto com o time fundador",
                "Voz ativa nas próximas funcionalidades",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <span className="size-5 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                    <svg className="size-3 text-primary" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="text-sm text-background/60">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-background/10 bg-background/6 p-8 flex flex-col gap-5">
            <div>
              <p className="text-base font-bold text-background">Entrar na lista de espera</p>
              <p className="text-xs text-background/40 mt-1">Sem cartão. Sem compromisso. LGPD.</p>
            </div>

            {submitted ? (
              <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/10 px-5 py-4">
                <div className="size-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <ArrowRight className="size-4 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-background">Você está na lista.</p>
                  <p className="text-xs text-background/50 mt-0.5">Avisamos quando abrirmos novas vagas.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com.br"
                  className={cn(
                    "w-full h-11 rounded-xl border border-background/15 bg-background/10 px-4 text-sm text-background",
                    "placeholder:text-background/25",
                    "focus:outline-none focus:ring-2 focus:ring-primary/35 focus:border-primary/40",
                    "transition-all duration-150",
                  )}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className={cn(
                    "w-full h-11 rounded-xl text-sm font-bold text-primary-foreground bg-primary",
                    "inline-flex items-center justify-center gap-2",
                    "hover:opacity-90 active:scale-[0.98] transition-all duration-150",
                    "disabled:opacity-60 disabled:cursor-not-allowed",
                  )}
                >
                  {loading
                    ? <span className="size-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    : <>Solicitar acesso <ArrowRight className="size-4" /></>
                  }
                </button>
              </form>
            )}

            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-background/10" />
              <span className="text-xs text-background/25 px-2">ou</span>
              <div className="h-px flex-1 bg-background/10" />
            </div>

            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsappClick("cta_bottom")}
              className="flex items-center justify-center gap-2 text-sm font-medium text-background/50 hover:text-background/80 transition-colors"
            >
              <MessageCircle className="size-4" />
              Falar diretamente com o fundador
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
