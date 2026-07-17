import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { useInView } from "../hooks/use-in-view"
import { TagIcon, MapPinIcon, CheckCircle2, ChevronRight } from "lucide-react"
import { StatusBadge, MiniAvatar } from "./ui"

interface ActiveProps { active: boolean }

type Problem = {
  headline: string
  body: string
  visual: (active: boolean) => React.ReactNode
}


const INCOMING_MSGS = [
  { initials: "JS", color: "bg-orange-400", channel: "WhatsApp", text: "Buraco enorme na rua 7, quase bate o carro!", delay: 0 },
  { initials: "MA", color: "bg-violet-500", channel: "E-mail", text: "Semáforo da Av. Central quebrou de novo", delay: 0.14 },
  { initials: "PR", color: "bg-sky-500", channel: "WhatsApp", text: "Esgoto transbordando no Jd. Europa 😤", delay: 0.28 },
  { initials: "CM", color: "bg-rose-400", channel: "Presencial", text: "Vim pessoalmente pq ninguém responde", delay: 0.42 },
]

function Problem1({ active }: ActiveProps) {
  return (
    <div className="h-full flex gap-3 overflow-hidden">
      <div className="flex-1 flex flex-col rounded-xl overflow-hidden border border-border/60 shadow-sm min-w-0">
        <div className="flex items-center justify-between gap-2 px-3 py-2 bg-muted/60 border-b border-border/60 shrink-0">
          <span className="text-2xs font-semibold text-foreground">Entradas hoje</span>
          <div
            className="inline-flex items-center gap-1 bg-red-500 text-white rounded-md px-1.5 py-0.5 transition-all duration-300"
            style={{ opacity: active ? 1 : 0, transform: active ? "scale(1)" : "scale(0.7)" }}
          >
            <span className="text-2xs font-black">4 sem dono</span>
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-2 px-2.5 py-2 overflow-hidden">
          {INCOMING_MSGS.map((m, i) => (
            <div
              key={i}
              className="flex items-center gap-2 bg-card rounded-lg border border-border/60 px-2.5 py-2 shadow-xs"
              style={{
                transitionDelay: active ? `${m.delay}s` : "0s",
                opacity: active ? 1 : 0,
                transform: active ? "translateY(0)" : "translateY(6px)",
                transition: "opacity 0.35s, transform 0.35s",
              }}
            >
              <MiniAvatar initials={m.initials} color={m.color} size={22} />
              <div className="flex-1 min-w-0">
                <p className="text-2xs text-foreground/80 leading-snug truncate">{m.text}</p>
                <span className="text-2xs text-muted-foreground/50">{m.channel}</span>
              </div>
            </div>
          ))}
        </div>
        <div
          className="px-2.5 py-2 bg-red-50 border-t border-red-100 flex items-center gap-1.5 shrink-0 transition-all duration-400"
          style={{ opacity: active ? 1 : 0, transitionDelay: active ? "0.65s" : "0s" }}
        >
          <span className="size-1.5 rounded-full bg-red-400 shrink-0" />
          <p className="text-2xs font-semibold text-red-600">Nenhuma demanda registrada no sistema</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-1.5 min-w-0">
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-background border border-border rounded-lg shrink-0">
          <div className="size-5 rounded bg-primary/10 border border-primary/20 flex items-center justify-center">
            <span className="text-2xs font-black text-primary">G</span>
          </div>
          <span className="text-2xs font-semibold text-foreground">Portal · Gabinete Municipal</span>
        </div>
        {[
          { title: "Buraco – Rua 7", cat: "Infraestrutura", initials: "JS", color: "bg-orange-400", status: "IN_ANALYSIS" as const, stripe: "border-l-sky-400", delay: 0.1 },
          { title: "Semáforo – Av. Central", cat: "Trânsito", initials: "MA", color: "bg-violet-500", status: "IN_PROGRESS" as const, stripe: "border-l-orange-400", delay: 0.25 },
          { title: "Esgoto – Jd. Europa", cat: "Saneamento", initials: "PR", color: "bg-sky-500", status: "RESOLVED" as const, stripe: "border-l-emerald-500", delay: 0.4 },
        ].map((card, i) => (
          <article
            key={i}
            className={cn("bg-card rounded-lg border border-border border-l-2 overflow-hidden shadow-xs", card.stripe)}
            style={{
              transitionDelay: active ? `${card.delay}s` : "0s",
              opacity: active ? 1 : 0,
              transform: active ? "translateX(0)" : "translateX(-10px)",
              transition: "opacity 0.35s, transform 0.35s",
            }}
          >
            <div className="flex items-start gap-2 px-3 pt-2 pb-2">
              <MiniAvatar initials={card.initials} color={card.color} size={20} />
              <div className="flex-1 min-w-0">
                <p className="text-2xs font-semibold text-foreground leading-snug truncate">{card.title}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <TagIcon className="size-2.5 text-muted-foreground/40 shrink-0" />
                  <span className="text-2xs text-muted-foreground">{card.cat}</span>
                </div>
              </div>
              <StatusBadge status={card.status} />
            </div>
          </article>
        ))}
        <div
          className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1.5 transition-all duration-400"
          style={{ opacity: active ? 1 : 0, transitionDelay: active ? "0.6s" : "0s" }}
        >
          <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
          <span className="text-2xs font-semibold text-emerald-700">3 demandas com responsável</span>
        </div>
      </div>
    </div>
  )
}


const TIMELINE_STEPS = [
  { label: "Enviada pelo cidadão", time: "12/06 09:14", delay: 0.05 },
  { label: "Atribuída a Ana Beatriz", time: "12/06 09:20", delay: 0.2 },
  { label: "Em progresso", time: "13/06 14:05", delay: 0.35 },
  { label: "Resolvida", time: "15/06 11:30", delay: 0.5 },
]

function Problem2({ active }: ActiveProps) {
  return (
    <div className="h-full flex gap-3 overflow-hidden">
      <div className="flex-1 bg-card border border-border rounded-xl overflow-hidden shadow-sm flex flex-col min-w-0">
        <div className="px-4 py-3 border-b border-border/60">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-2xs font-black text-foreground leading-snug">Buraco – Av. Central</p>
              <div className="flex items-center gap-1 mt-0.5">
                <TagIcon className="size-2.5 text-muted-foreground/40" />
                <span className="text-2xs text-muted-foreground">Infraestrutura · há 3 dias</span>
              </div>
            </div>
            <StatusBadge status="RESOLVED" />
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-border/40 shrink-0">
          <span className="text-2xs text-muted-foreground">Responsável</span>
          <MiniAvatar initials="AB" color="bg-primary/80" size={18} />
          <span className="text-2xs font-medium text-foreground">Ana Beatriz</span>
        </div>
        <div className="flex-1 flex flex-col px-4 py-3 relative overflow-hidden">
          <div className="absolute left-5.5 top-4 bottom-4 w-px bg-border/60" />
          {TIMELINE_STEPS.map((step, i) => (
            <div
              key={i}
              className="flex items-start gap-3 pb-3 relative"
              style={{
                transitionDelay: active ? `${step.delay}s` : "0s",
                opacity: active ? 1 : 0,
                transform: active ? "translateX(0)" : "translateX(-8px)",
                transition: "opacity 0.3s, transform 0.3s",
              }}
            >
              <div className="size-2 rounded-full border-2 shrink-0 mt-1 z-10 bg-primary border-primary" />
              <div>
                <p className="text-2xs font-medium text-foreground leading-snug">{step.label}</p>
                <p className="text-2xs text-muted-foreground/50 mt-0.5">{step.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-2 min-w-0 justify-center">
        {[
          { bg: "bg-blue-50", dotCls: "bg-blue-500", title: "Atualização recebida", body: '"Buraco – Av. Central" avançou para Em progresso.', sub: "Gabinete Municipal · agora", delay: 0.25 },
          { bg: "bg-emerald-50", dotCls: "bg-emerald-500", title: "Demanda resolvida", body: "Cidadão notificado automaticamente por e-mail.", sub: "há 2 min", delay: 0.5 },
        ].map((n, i) => (
          <div
            key={i}
            className="bg-card border border-border rounded-xl shadow-sm overflow-hidden"
            style={{
              transitionDelay: active ? `${n.delay}s` : "0s",
              opacity: active ? 1 : 0,
              transform: active ? "translateY(0)" : "translateY(-10px)",
              transition: "opacity 0.35s, transform 0.35s",
            }}
          >
            <div className="flex items-start gap-2.5 px-3 py-3">
              <div className={cn("size-8 rounded-xl flex items-center justify-center shrink-0", n.bg)}>
                <span className={cn("size-2 rounded-full", n.dotCls)} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-2xs font-semibold text-foreground leading-snug">{n.title}</p>
                <p className="text-2xs text-muted-foreground mt-0.5">{n.body}</p>
                <p className="text-2xs text-muted-foreground/50 mt-1">{n.sub}</p>
              </div>
            </div>
          </div>
        ))}
        <div
          className="flex items-center gap-1.5 border border-border/60 rounded-lg px-2.5 py-1.5 bg-muted/30 transition-all duration-400"
          style={{ opacity: active ? 1 : 0, transitionDelay: active ? "0.7s" : "0s" }}
        >
          <MapPinIcon className="size-3 text-primary/50 shrink-0" />
          <span className="text-2xs text-muted-foreground">Av. Central, 1240 · Centro</span>
        </div>
      </div>
    </div>
  )
}


const CHART_POINTS = [14, 22, 18, 35, 29, 48, 42]
const CHART_MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul"]
const CATEGORY_ROWS = [
  { label: "Infraestrutura", count: 32, bar: "bg-primary", pct: 41 },
  { label: "Saneamento", count: 18, bar: "bg-sky-500", pct: 23 },
  { label: "Trânsito", count: 14, bar: "bg-amber-500", pct: 18 },
  { label: "Energia", count: 14, bar: "bg-emerald-500", pct: 18 },
]

function Problem3({ active }: ActiveProps) {
  const max = Math.max(...CHART_POINTS)
  const pts = CHART_POINTS.map((v, i) => ({
    x: (i / (CHART_POINTS.length - 1)) * 100,
    y: 100 - (v / max) * 88,
  }))
  const linePts = pts.map((p) => `${p.x},${p.y}`).join(" ")
  const areaPath = `M ${pts[0].x},100 ${pts.map((p) => `L ${p.x},${p.y}`).join(" ")} L ${pts[pts.length - 1].x},100 Z`

  return (
    <div className="h-full flex gap-3 overflow-hidden">
      <div
        className="flex-1 bg-card border border-border rounded-xl overflow-hidden shadow-sm flex flex-col min-w-0"
        style={{ opacity: active ? 1 : 0, transform: active ? "translateY(0)" : "translateY(8px)", transition: "opacity 0.4s, transform 0.4s" }}
      >
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/60 shrink-0">
          <span className="text-2xs font-bold text-foreground flex-1">Demandas · Jul 2025</span>
          <div
            className="flex items-center gap-1 bg-primary text-primary-foreground rounded px-2 py-0.5 transition-all duration-300"
            style={{ opacity: active ? 1 : 0, transform: active ? "scale(1)" : "scale(0.75)", transitionDelay: active ? "0.8s" : "0s" }}
          >
            <span className="text-2xs font-bold">Exportar PDF</span>
          </div>
        </div>
        <div className="grid grid-cols-3 border-b border-border/60 shrink-0">
          {[
            { label: "Resolvidas", val: "78", c: "text-foreground" },
            { label: "Taxa", val: "91%", c: "text-emerald-600" },
            { label: "Tempo médio", val: "2.3d", c: "text-primary" },
          ].map((kpi, i) => (
            <div key={i} className={cn("px-3 py-2 flex flex-col gap-0.5", i > 0 && "border-l border-border/60")}>
              <p className={cn("text-lg font-bold tabular-nums leading-none", kpi.c)}>{kpi.val}</p>
              <p className="text-2xs text-muted-foreground mt-0.5">{kpi.label}</p>
            </div>
          ))}
        </div>
        <div className="flex-1 px-4 pt-2 pb-1 min-h-0 flex flex-col">
          <div className="relative flex-1">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="hiw-chart-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[25, 50, 75].map((y) => (
                <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="hsl(var(--border))" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
              ))}
              <path d={areaPath} fill="url(#hiw-chart-grad)" />
              <polyline points={linePts} fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
              {pts.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="1.5" fill="hsl(var(--primary))" vectorEffect="non-scaling-stroke" />
              ))}
            </svg>
          </div>
          <div className="flex justify-between pt-1 shrink-0">
            {CHART_MONTHS.map((m) => <span key={m} className="text-2xs text-muted-foreground/50">{m}</span>)}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-2 min-w-0">
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm flex-1">
          <div className="px-4 py-2.5 border-b border-border/60">
            <p className="text-2xs font-bold text-foreground">Por categoria</p>
          </div>
          <div className="flex flex-col gap-3 px-4 py-3">
            {CATEGORY_ROWS.map((cat, i) => (
              <div
                key={cat.label}
                className="flex flex-col gap-1"
                style={{
                  transitionDelay: active ? `${0.1 + i * 0.12}s` : "0s",
                  opacity: active ? 1 : 0,
                  transform: active ? "translateX(0)" : "translateX(-8px)",
                  transition: "opacity 0.3s, transform 0.3s",
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xs font-medium text-foreground">{cat.label}</span>
                  <span className="text-2xs tabular-nums font-bold text-foreground/60">{cat.count}</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted/60 overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-700", cat.bar)}
                    style={{ width: active ? `${cat.pct}%` : "0%", transitionDelay: active ? `${0.2 + i * 0.12}s` : "0s" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div
          className="bg-card border border-border rounded-xl px-4 py-3 flex flex-col gap-1 transition-all duration-400"
          style={{ opacity: active ? 1 : 0, transform: active ? "translateY(0)" : "translateY(6px)", transitionDelay: active ? "0.65s" : "0s" }}
        >
          <p className="text-2xs text-muted-foreground uppercase font-bold tracking-wider">Maior concentração</p>
          <p className="text-sm font-black text-foreground leading-tight">Jardim Europa</p>
          <span className="inline-flex items-center w-fit px-1.5 py-0.5 rounded-full border text-2xs font-semibold bg-amber-50 text-amber-600 border-amber-100 mt-0.5">
            9 ocorrências · últimos 30 dias
          </span>
        </div>
      </div>
    </div>
  )
}


const PROBLEMS: Problem[] = [
  {
    headline: "Demandas chegam por WhatsApp, e-mail e pessoalmente. Nenhuma tem dono.",
    body: "Sem um canal único, cada assessor trabalha numa caixa separada. Demandas somem, cidadãos cobram.",
    visual: (active) => <Problem1 active={active} />,
  },
  {
    headline: "O cidadão liga perguntando. Ninguém na equipe sabe em que pé está.",
    body: "Com Gabinete, cada mudança de status gera uma notificação automática. O cidadão acompanha sem precisar ligar.",
    visual: (active) => <Problem2 active={active} />,
  },
  {
    headline: "Na prestação de contas, não existe dado nenhum para mostrar.",
    body: "Relatórios por categoria, bairro e período gerados automaticamente. Exporta PDF em um clique.",
    visual: (active) => <Problem3 active={active} />,
  },
]

const AUTO_ADVANCE_MS = 5000

export function HowItWorksSection() {
  const { ref, visible } = useInView()
  const [activeIdx, setActiveIdx] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function selectProblem(i: number) {
    if (timerRef.current) clearTimeout(timerRef.current)
    setActiveIdx(i)
    timerRef.current = setTimeout(() => setActiveIdx((prev) => (prev + 1) % PROBLEMS.length), AUTO_ADVANCE_MS)
  }

  useEffect(() => {
    if (!visible) return
    timerRef.current = setTimeout(() => setActiveIdx(1), AUTO_ADVANCE_MS)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [visible])

  return (
    <section className="py-24 sm:py-32 bg-muted/20 border-t border-border" id="como-funciona">
      <div ref={ref} className="max-w-5xl mx-auto px-5 sm:px-8">
        <div className={cn("mb-16 transition-all duration-500", visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")}>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-primary mb-4">O problema</p>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-foreground leading-[1.07] max-w-2xl">
            Gabinetes perdem demanda todo dia.
          </h2>
          <p className="mt-5 text-base text-muted-foreground leading-relaxed max-w-lg">
            Não por falta de esforço. Por falta de ferramenta. WhatsApp e planilha não foram feitos para isso.
          </p>
        </div>

        <div
          className={cn("grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 lg:gap-10 transition-all duration-500", visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8")}
          style={{ transitionDelay: "100ms" }}
        >
          <div className="flex flex-col gap-1">
            {PROBLEMS.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => selectProblem(i)}
                className={cn(
                  "group relative flex flex-col gap-2 p-4 rounded-xl text-left transition-all duration-200 border",
                  activeIdx === i ? "bg-background border-border shadow-sm" : "border-transparent hover:bg-background/60 hover:border-border/40",
                )}
              >
                {activeIdx === i && (
                  <div className="absolute inset-x-0 bottom-0 h-0.5 rounded-b-xl overflow-hidden bg-border/20">
                    <div className="h-full bg-primary rounded-full" style={{ animation: "lp-bar-grow 5s linear both" }} />
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <ChevronRight className={cn("size-3 transition-colors shrink-0", activeIdx === i ? "text-primary" : "text-muted-foreground/25")} />
                  <span className={cn("text-2xs font-bold uppercase tracking-wider transition-colors", activeIdx === i ? "text-primary" : "text-muted-foreground/30")}>
                    Problema {i + 1}
                  </span>
                </div>
                <p className={cn("text-sm font-bold leading-snug transition-colors", activeIdx === i ? "text-foreground" : "text-muted-foreground/60 group-hover:text-foreground/70")}>
                  {p.headline}
                </p>
                {activeIdx === i && (
                  <p className="text-xs text-muted-foreground leading-relaxed">{p.body}</p>
                )}
              </button>
            ))}
          </div>

          <div className="relative rounded-2xl border border-border bg-background shadow-sm overflow-hidden" style={{ minHeight: 360 }}>
            <div className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-primary/40 via-primary/20 to-transparent" />
            <div className="absolute inset-0 p-5">
              {PROBLEMS.map((p, i) => (
                <div
                  key={i}
                  className="absolute inset-5 transition-all duration-400"
                  style={{
                    opacity: activeIdx === i ? 1 : 0,
                    transform: activeIdx === i ? "scale(1)" : "scale(0.98)",
                    pointerEvents: activeIdx === i ? "auto" : "none",
                  }}
                >
                  {p.visual(activeIdx === i)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
