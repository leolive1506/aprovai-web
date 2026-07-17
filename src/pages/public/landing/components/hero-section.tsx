import { useState } from "react"
import { ArrowRight, Play } from "lucide-react"
import { cn } from "@/lib/utils"
import { trackCtaClick, trackEvent } from "@/lib/analytics"

const VIDEO_ID = "GGvJw76K7zQ"

export function HeroSection() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [playing, setPlaying] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    trackCtaClick("hero_waitlist")
    await new Promise((r) => setTimeout(r, 700))
    setLoading(false)
    setSubmitted(true)
  }

  return (
    <section className="relative pt-18 overflow-hidden bg-background" id="inicio">
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <pattern id="hero-grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#c7d2e0" strokeWidth="0.75" />
          </pattern>
          <linearGradient id="hero-grid-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="70%" stopColor="white" stopOpacity="0.4" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <mask id="hero-grid-mask">
            <rect width="100%" height="100%" fill="url(#hero-grid-fade)" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-grid)" mask="url(#hero-grid-mask)" opacity="0.55" />
      </svg>
      <div className="absolute inset-x-0 top-16 h-150 bg-linear-to-b from-primary/6 to-transparent pointer-events-none" />
      <div className="absolute top-32 left-1/2 -translate-x-1/2 w-200 h-100 rounded-full bg-primary/4 blur-3xl pointer-events-none" />

      <div className="relative flex justify-center pt-12 sm:pt-16">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/6 px-4 py-1.5">
          <span className="size-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-semibold text-primary tracking-wide">
            Beta em andamento · acesso fechado
          </span>
        </div>
      </div>

      <div className="relative max-w-4xl mx-auto px-5 sm:px-8 pt-8 pb-10 text-center">
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.04] text-foreground">
          Demandas entram.
          <br />
          <span className="text-primary">Resoluções saem.</span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-md mx-auto">
          Cada demanda do cidadão entra organizada, tem um responsável e sai resolvida com registro.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4">
          {submitted ? (
            <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/6 px-6 py-4 max-w-sm w-full">
              <div className="size-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                <ArrowRight className="size-4 text-primary-foreground" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-foreground">Você está na lista.</p>
                <p className="text-xs text-muted-foreground mt-0.5">Avisamos quando abrirmos novas vagas.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-full max-w-sm">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com.br"
                className={cn(
                  "w-full h-12 rounded-xl border border-border bg-background px-4 text-sm text-foreground shadow-sm",
                  "placeholder:text-muted-foreground/50",
                  "focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary",
                  "transition-all duration-150",
                )}
              />
              <button
                type="submit"
                disabled={loading}
                className={cn(
                  "w-full h-12 rounded-xl text-sm font-bold text-primary-foreground bg-primary shadow-sm",
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
          <p className="text-xs text-muted-foreground">Gratuito na beta · Sem cartão de crédito · LGPD</p>
        </div>
      </div>

      <div className="relative max-w-5xl mx-auto px-5 sm:px-8 pb-0">
        <div className="absolute -inset-4 bg-primary/3 rounded-2xl blur-xl pointer-events-none" />
        <div className="relative rounded-2xl overflow-hidden border border-border/60 shadow-xl bg-muted">
          <div className="flex items-center gap-1.5 px-4 py-3 bg-muted/80 border-b border-border/40">
            <div className="flex gap-1">
              <div className="size-2.5 rounded-full bg-border" />
              <div className="size-2.5 rounded-full bg-border" />
              <div className="size-2.5 rounded-full bg-border" />
            </div>
            <div className="flex-1 mx-4 h-5 rounded-md bg-background/60 border border-border/30 flex items-center px-3">
              <span className="text-2xs text-muted-foreground/50 truncate">gabineteapp.com.br/gabinete/demo</span>
            </div>
          </div>
          <div className="relative aspect-video">
            {playing ? (
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${VIDEO_ID}?autoplay=1&rel=0&modestbranding=1`}
                title="Demo Gabinete Digital"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <>
                <img
                  src={`https://i.ytimg.com/vi/${VIDEO_ID}/maxresdefault.jpg`}
                  alt="Preview da plataforma Gabinete"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-foreground/35" />
                <button
                  type="button"
                  onClick={() => { setPlaying(true); trackEvent("play_demo_video", { location: "hero" }) }}
                  className="group absolute inset-0 flex flex-col items-center justify-center gap-4"
                  aria-label="Assistir demonstração"
                >
                  <span className="flex items-center justify-center size-16 rounded-full bg-background border border-border/60 shadow-lg transition-all duration-200 group-hover:scale-110 group-hover:shadow-xl">
                    <Play className="size-6 text-foreground fill-foreground ml-0.5" />
                  </span>
                  <span className="text-sm font-medium text-background/65 tracking-wide">
                    Assistir demonstração · 3 min
                  </span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
