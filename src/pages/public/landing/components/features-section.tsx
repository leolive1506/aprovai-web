import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { useInView } from "../hooks/use-in-view"
import {
  TagIcon, MapPinIcon, Crown, Shield,
  Search, UserPlus, Download, CheckCircle2, Info, AlertTriangle,
  MailCheck, ChevronRight,
} from "lucide-react"
import { StatusBadge, MiniAvatar, PRIORITY_STRIPE } from "./ui"
import { APIProvider, Map as GoogleMap, AdvancedMarker } from "@vis.gl/react-google-maps"

const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY as string

const KANBAN_COLS = [
  {
    dot: "bg-slate-400", label: "Enviada", count: 3,
    cards: [
      { title: "Buraco na Av. das Flores", priority: "HIGH" as const, initials: "MA", color: "bg-primary/80", tag: "Infraestrutura", ago: "há 2d" },
      { title: "Semáforo quebrado na Rua XV", priority: "MEDIUM" as const, initials: "JS", color: "bg-orange-400", tag: "Trânsito", ago: "há 5d" },
      { title: "Lixo acumulado no Jd. América", priority: "LOW" as const, initials: "PR", color: "bg-rose-400", tag: "Saneamento", ago: "há 1s" },
    ],
  },
  {
    dot: "bg-amber-500", label: "Em progresso", count: 2,
    cards: [
      { title: "Poda urgente no Parque Central", priority: "URGENT" as const, initials: "AB", color: "bg-violet-500", tag: "Meio Ambiente", ago: "há 1d" },
      { title: "Calçada interditada perto da escola", priority: "HIGH" as const, initials: "CR", color: "bg-sky-400", tag: "Acessibilidade", ago: "há 3d" },
    ],
  },
  {
    dot: "bg-emerald-500", label: "Resolvida", count: 4,
    cards: [
      { title: "Iluminação restaurada no Setor Norte", priority: "MEDIUM" as const, initials: "FO", color: "bg-emerald-500", tag: "Energia", ago: "há 8d" },
      { title: "Calçada reparada na Rua dos Ipês", priority: "LOW" as const, initials: "TK", color: "bg-teal-400", tag: "Infraestrutura", ago: "há 12d" },
    ],
  },
  {
    dot: "bg-blue-500", label: "Em análise", count: 1,
    cards: [
      { title: "Vazamento de água na Rua Goiás", priority: "URGENT" as const, initials: "RA", color: "bg-sky-500", tag: "Saneamento Básico", ago: "há 6h" },
    ],
  },
]

function KanbanVisual() {
  return (
    <div className="flex gap-2 sm:gap-3 h-full overflow-hidden">
      {KANBAN_COLS.map((col, colIdx) => (
        <div
          key={col.label}
          className={cn(
            "flex flex-col flex-1 min-w-0 gap-2",
            colIdx >= 2 && "hidden sm:flex",
          )}
        >
          <div className="flex items-center gap-1.5 sm:gap-2 px-1 pb-2 border-b border-border/60 shrink-0">
            <span className={cn("size-2 rounded-full shrink-0", col.dot)} />
            <span className="text-2xs sm:text-xs font-semibold text-foreground truncate">{col.label}</span>
            <span className="ml-auto text-2xs bg-muted text-muted-foreground rounded-full px-1.5 py-px shrink-0">{col.count}</span>
          </div>
          <div className="flex flex-col gap-2 overflow-hidden">
            {col.cards.map((card) => (
              <div key={card.title} className={cn("rounded-xl border border-border/70 bg-background shadow-xs overflow-hidden", PRIORITY_STRIPE[card.priority])}>
                <div className="px-2.5 sm:px-3 py-2 sm:py-2.5">
                  <p className="text-2xs sm:text-xs font-semibold text-foreground leading-snug mb-2">{card.title}</p>
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1 text-2xs text-muted-foreground min-w-0">
                      <TagIcon className="size-2.5 shrink-0" />
                      <span className="truncate">{card.tag}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-2xs text-muted-foreground/50 hidden sm:inline">{card.ago}</span>
                      <MiniAvatar initials={card.initials} color={card.color} size={16} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

const PORTAL_ITEMS = [
  { initials: "RS", color: "bg-sky-500", name: "Ronaldo Silva", title: "Vazamento de esgoto no Jardim Europa", cat: "Saneamento", priority: "HIGH" as const, status: "IN_ANALYSIS" as const, addr: "R. Rio Solimões, 897", time: "há 2 dias" },
  { initials: "CM", color: "bg-violet-500", name: "Carla Mendes", title: "Buraco na Av. Central, trecho perigoso", cat: "Infraestrutura", priority: "URGENT" as const, status: "IN_PROGRESS" as const, addr: "Av. Central, 1240", time: "há 5 dias" },
  { initials: "JP", color: "bg-emerald-400", name: "João Paulo", title: "Semáforo apagado na Rua XV de Novembro", cat: "Trânsito", priority: "MEDIUM" as const, status: "RESOLVED" as const, addr: "R. XV de Novembro, 80", time: "há 8 dias" },
  { initials: "LF", color: "bg-amber-400", name: "Lívia Freitas", title: "Calçada quebrada em frente à escola", cat: "Acessibilidade", priority: "HIGH" as const, status: "SUBMITTED" as const, addr: "R. das Flores, 300", time: "há 1 dia" },
]

function PortalVisual() {
  return (
    <div className="flex flex-col h-full gap-0 rounded-xl border border-border overflow-hidden bg-background shadow-sm">
      <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 border-b border-border bg-muted/30 shrink-0">
        <div className="size-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
          <span className="text-xs font-black text-primary">G</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-foreground truncate">Portal · Gabinete Municipal</p>
          <p className="text-2xs text-muted-foreground truncate hidden sm:block">gabineteapp.com.br/gabinete/demo</p>
        </div>
        <span className="inline-flex items-center gap-1 text-2xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5 font-semibold shrink-0">
          <span className="size-1.5 rounded-full bg-emerald-500" />Público
        </span>
      </div>
      <div className="flex items-center gap-2 px-3 sm:px-4 py-2 border-b border-border/50 shrink-0 bg-muted/10">
        <div className="flex-1 h-7 sm:h-8 rounded-lg border border-border/60 bg-muted/40 flex items-center px-3">
          <span className="text-xs text-muted-foreground/40">Buscar demanda...</span>
        </div>
        <div className="h-7 sm:h-8 rounded-lg bg-primary px-2.5 sm:px-3 flex items-center gap-1 shrink-0">
          <span className="text-xs font-semibold text-primary-foreground whitespace-nowrap">Nova demanda</span>
        </div>
      </div>
      <div className="flex-1 flex flex-col divide-y divide-border/40 overflow-hidden">
        {PORTAL_ITEMS.map((d) => (
          <div key={d.title} className={cn("flex items-start gap-2.5 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3", PRIORITY_STRIPE[d.priority])}>
            <MiniAvatar initials={d.initials} color={d.color} size={28} />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="text-xs font-semibold text-foreground leading-snug line-clamp-1">{d.title}</p>
                <StatusBadge status={d.status} />
              </div>
              <div className="flex items-center gap-1.5 text-2xs text-muted-foreground">
                <span className="shrink-0">{d.cat}</span>
                <span className="text-muted-foreground/30 hidden sm:inline">·</span>
                <MapPinIcon className="size-2.5 shrink-0 hidden sm:block" />
                <span className="truncate hidden sm:inline">{d.addr}</span>
                <span className="ml-auto shrink-0 text-muted-foreground/50">{d.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const TEAM_MEMBERS = [
  { initials: "AB", color: "bg-primary/80", name: "Ana Beatriz", email: "ana@gabinete.com", role: "OWNER" as const, open: 12, resolved: 34 },
  { initials: "CM", color: "bg-sky-400", name: "Carlos Menezes", email: "carlos@gabinete.com", role: "STAFF" as const, open: 8, resolved: 21 },
  { initials: "FR", color: "bg-emerald-400", name: "Fernanda Reis", email: "fernanda@gabinete.com", role: "STAFF" as const, open: 5, resolved: 18 },
  { initials: "TK", color: "bg-teal-400", name: "Tiago Kurosaki", email: "tiago@gabinete.com", role: "STAFF" as const, open: 3, resolved: 11 },
]

const ROLE_CFG = {
  OWNER: { label: "Responsável", Icon: Crown, cls: "bg-amber-50 text-amber-700 border-amber-200" },
  STAFF: { label: "Membro", Icon: Shield, cls: "bg-blue-50 text-blue-700 border-blue-200" },
}

function TeamVisual() {
  return (
    <div className="flex flex-col h-full gap-0 rounded-xl border border-border overflow-hidden bg-background shadow-sm">
      <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 border-b border-border bg-muted/30 shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/50" />
          <div className="h-8 rounded-lg border border-border/60 bg-background pl-8 flex items-center">
            <span className="text-xs text-muted-foreground/40">Buscar membro...</span>
          </div>
        </div>
        <div className="h-8 rounded-lg bg-primary px-3 flex items-center gap-1.5 shrink-0">
          <UserPlus className="size-3.5 text-primary-foreground" />
          <span className="text-xs font-semibold text-primary-foreground hidden sm:inline">Convidar</span>
        </div>
      </div>
      <div className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_auto_auto_auto] items-center px-3 sm:px-4 py-2 bg-muted/20 border-b border-border/40 text-2xs font-semibold text-muted-foreground uppercase tracking-wider shrink-0 gap-3 sm:gap-6">
        <span>Membro</span>
        <span>Função</span>
        <span className="text-right hidden sm:block">Em aberto</span>
        <span className="text-right hidden sm:block">Resolvidas</span>
      </div>
      <div className="flex-1 divide-y divide-border/40 overflow-hidden">
        {TEAM_MEMBERS.map((m) => {
          const cfg = ROLE_CFG[m.role]
          return (
            <div key={m.name} className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_auto_auto_auto] items-center px-3 sm:px-4 py-2.5 sm:py-3 gap-3 sm:gap-6 hover:bg-muted/10 transition-colors">
              <div className="flex items-center gap-2.5 min-w-0">
                <MiniAvatar initials={m.initials} color={m.color} size={30} />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{m.name}</p>
                  <p className="text-2xs text-muted-foreground truncate hidden sm:block">{m.email}</p>
                </div>
              </div>
              <span className={cn("inline-flex items-center gap-1 px-2 py-1 rounded-lg text-2xs font-semibold border whitespace-nowrap", cfg.cls)}>
                <cfg.Icon className="size-2.5" />{cfg.label}
              </span>
              <span className="text-sm font-black tabular-nums text-amber-500 text-right hidden sm:block">{m.open}</span>
              <span className="text-sm font-black tabular-nums text-emerald-600 text-right hidden sm:block">{m.resolved}</span>
            </div>
          )
        })}
      </div>
      <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 border-t border-border/40 bg-muted/10 shrink-0">
        <span className="text-2xs text-muted-foreground">4 membros ativos</span>
        <button type="button" className="text-2xs text-primary font-semibold hover:underline">Ver todos</button>
      </div>
    </div>
  )
}

const CHART_PTS = [18, 22, 15, 31, 28, 42, 38]
const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul"]
const STATUS_BARS = [
  { label: "Resolvidas", count: 42, bar: "bg-emerald-500", pct: 55 },
  { label: "Em progresso", count: 18, bar: "bg-amber-500", pct: 23 },
  { label: "Em análise", count: 12, bar: "bg-blue-500", pct: 16 },
  { label: "Enviadas", count: 5, bar: "bg-slate-400", pct: 6 },
]

function ReportsVisual() {
  const max = Math.max(...CHART_PTS)
  const pts = CHART_PTS.map((v, i) => ({ x: (i / (CHART_PTS.length - 1)) * 100, y: 100 - (v / max) * 86 }))
  const line = pts.map((p) => `${p.x},${p.y}`).join(" ")
  const area = `M ${pts[0].x},100 ${pts.map((p) => `L ${p.x},${p.y}`).join(" ")} L ${pts[pts.length - 1].x},100 Z`

  return (
    <div className="flex flex-col h-full gap-0 rounded-xl border border-border overflow-hidden bg-background shadow-sm">
      <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 border-b border-border bg-muted/30 shrink-0">
        <span className="text-xs font-bold text-foreground flex-1">Relatório · Jul 2025</span>
        <div className="hidden sm:flex items-center gap-1">
          {["7 dias", "30 dias", "90 dias"].map((p, i) => (
            <span key={p} className={cn("px-2 py-1 rounded-lg text-xs font-medium border", i === 1 ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground bg-background")}>
              {p}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-1 h-8 rounded-lg border border-border bg-background px-2.5 shrink-0">
          <Download className="size-3 text-muted-foreground/50" />
          <span className="text-xs text-muted-foreground hidden sm:inline">PDF</span>
        </div>
      </div>
      <div className="grid grid-cols-3 border-b border-border/50 shrink-0">
        {[
          { v: "77", l: "Resolvidas", c: "text-foreground" },
          { v: "91%", l: "Taxa resolução", c: "text-emerald-600" },
          { v: "2.3d", l: "Tempo médio", c: "text-primary" },
        ].map((kpi, i) => (
          <div key={kpi.l} className={cn("px-3 sm:px-4 py-2.5 sm:py-3", i > 0 && "border-l border-border/50")}>
            <p className={cn("text-xl sm:text-2xl font-black tabular-nums leading-none", kpi.c)}>{kpi.v}</p>
            <p className="text-2xs text-muted-foreground mt-1">{kpi.l}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-1 min-h-0 gap-0">
        <div className="flex-1 flex flex-col px-3 sm:px-4 pt-3 pb-3 min-w-0">
          <p className="text-2xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 shrink-0">Tendência</p>
          <div className="relative flex-1 min-h-0">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="feat-rpt-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[25, 50, 75].map((y) => (
                <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="hsl(var(--border))" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
              ))}
              <path d={area} fill="url(#feat-rpt-grad)" />
              <polyline points={line} fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
              {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="2" fill="hsl(var(--primary))" vectorEffect="non-scaling-stroke" />)}
            </svg>
          </div>
          <div className="flex justify-between shrink-0 pt-1">
            {MONTHS.map((m) => <span key={m} className="text-2xs text-muted-foreground/50">{m}</span>)}
          </div>
        </div>
        <div className="w-36 sm:w-48 border-l border-border/40 px-3 sm:px-4 py-3 flex flex-col gap-2 sm:gap-2.5 shrink-0">
          <p className="text-2xs font-semibold text-muted-foreground uppercase tracking-wider">Por status</p>
          {STATUS_BARS.map((s) => (
            <div key={s.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-2xs text-muted-foreground truncate">{s.label}</span>
                <span className="text-2xs font-bold text-foreground/70 tabular-nums ml-1 shrink-0">{s.count}</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div className={cn("h-full rounded-full", s.bar)} style={{ width: `${s.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const NOTIF_CFG = {
  INFO: { Icon: Info, bg: "bg-blue-50", dot: "bg-blue-500", icon: "text-blue-500" },
  SUCCESS: { Icon: CheckCircle2, bg: "bg-emerald-50", dot: "bg-emerald-500", icon: "text-emerald-500" },
  WARNING: { Icon: AlertTriangle, bg: "bg-amber-50", dot: "bg-amber-500", icon: "text-amber-500" },
} as const

const NOTIFS = [
  { type: "INFO" as const, unread: true, title: "Nova demanda atribuída", body: 'Você foi designado responsável pela demanda "Buraco na Av. das Flores".', time: "agora" },
  { type: "SUCCESS" as const, unread: false, title: "Demanda resolvida", body: '"Iluminação pública no Setor Norte" foi marcada como resolvida.', time: "há 2 h" },
  { type: "WARNING" as const, unread: true, title: "Prazo se aproximando", body: '"Semáforo quebrado na Rua XV" está sem atualização há 15 dias.', time: "há 1 dia" },
  { type: "INFO" as const, unread: false, title: "Cidadão notificado", body: '"Esgoto no Jardim Europa" avançou para Em progresso. E-mail enviado automaticamente.', time: "há 2 dias" },
]

function NotificationsVisual() {
  return (
    <div className="flex flex-col h-full gap-0 rounded-xl border border-border overflow-hidden bg-background shadow-sm">
      <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 border-b border-border bg-muted/30 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-foreground">Notificações</span>
          <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-primary text-2xs font-bold text-primary-foreground">2</span>
        </div>
        <button type="button" className="flex items-center gap-1.5 text-xs text-primary font-semibold">
          <MailCheck className="size-3.5" /><span className="hidden sm:inline">Marcar lidas</span>
        </button>
      </div>
      <div className="flex-1 flex flex-col divide-y divide-border/40 overflow-hidden">
        {NOTIFS.map((n, i) => {
          const cfg = NOTIF_CFG[n.type]
          return (
            <div key={i} className={cn("flex items-start gap-3 px-3 sm:px-4 py-3 sm:py-4", n.unread && "bg-primary/2.5")}>
              <div className={cn("size-8 sm:size-9 rounded-xl flex items-center justify-center shrink-0", cfg.bg, !n.unread && "opacity-40")}>
                <cfg.Icon className={cn("size-3.5 sm:size-4", cfg.icon)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-0.5">
                  <p className={cn("text-xs leading-snug", n.unread ? "font-semibold text-foreground" : "font-medium text-muted-foreground")}>{n.title}</p>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-2xs text-muted-foreground/50 whitespace-nowrap">{n.time}</span>
                    {n.unread && <span className={cn("size-2 rounded-full shrink-0", cfg.dot)} />}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground/70 leading-relaxed line-clamp-2">{n.body}</p>
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 border-t border-border/40 bg-muted/10 shrink-0">
        <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <p className="text-xs text-muted-foreground/60">Sincronizado em tempo real</p>
      </div>
    </div>
  )
}

const DEMO_PINS = [
  { lat: -15.780, lng: -47.930, urgent: false, size: 14 },
  { lat: -15.795, lng: -47.895, urgent: true, size: 20 },
  { lat: -15.768, lng: -47.868, urgent: false, size: 14 },
  { lat: -15.810, lng: -47.920, urgent: false, size: 16 },
  { lat: -15.800, lng: -47.875, urgent: true, size: 18 },
  { lat: -15.774, lng: -47.905, urgent: false, size: 12 },
]

const DEMO_CENTER = { lat: -15.790, lng: -47.898 }

function MapVisual() {
  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 h-full">
      <div className="relative flex-1 rounded-xl overflow-hidden border border-border/60 min-w-0 min-h-48 sm:min-h-0">
        <APIProvider apiKey={MAPS_API_KEY}>
          <GoogleMap
            defaultCenter={DEMO_CENTER}
            defaultZoom={12}
            gestureHandling="greedy"
            disableDefaultUI
            mapId="landing-demo"
            style={{ width: "100%", height: "100%" }}
          >
            {DEMO_PINS.map((pin, i) => (
              <AdvancedMarker key={i} position={{ lat: pin.lat, lng: pin.lng }}>
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "rounded-full border-2",
                      pin.urgent
                        ? "bg-red-600/80 border-red-600 shadow-[0_0_0_5px_rgba(220,38,38,0.15)]"
                        : "bg-blue-600/75 border-blue-600 shadow-[0_0_0_5px_rgba(37,99,235,0.15)]",
                    )}
                    style={{ width: pin.size, height: pin.size }}
                  />
                  <div className={cn("w-px h-2.5", pin.urgent ? "bg-red-500/50" : "bg-blue-500/40")} />
                </div>
              </AdvancedMarker>
            ))}
          </GoogleMap>
        </APIProvider>
        <div className="absolute top-3 right-3 bg-background/95 backdrop-blur-sm rounded-xl border border-border shadow-sm px-3 py-2.5 flex flex-col gap-2 pointer-events-none">
          <p className="text-2xs font-bold text-foreground/60 uppercase tracking-wider">Legenda</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><span className="size-2.5 rounded-full bg-blue-600 shrink-0" />Normal</div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><span className="size-2.5 rounded-full bg-red-500 shrink-0" />Urgente</div>
        </div>
        <div className="absolute bottom-3 left-3 bg-background/95 backdrop-blur-sm rounded-xl border border-border shadow-sm px-3 py-2 pointer-events-none">
          <p className="text-xs font-bold text-foreground">23 demandas ativas</p>
          <p className="text-2xs text-muted-foreground">em 7 bairros · 2 urgentes</p>
        </div>
      </div>
      <div className="hidden sm:flex w-44 shrink-0 flex-col gap-3">
        <div className="rounded-xl border border-border bg-background p-4 flex-1">
          <p className="text-2xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Concentração</p>
          {[
            { name: "Jardim Europa", count: 9, pct: 90 },
            { name: "Centro", count: 6, pct: 60 },
            { name: "Setor Norte", count: 4, pct: 40 },
            { name: "Vila Nova", count: 2, pct: 20 },
          ].map((z) => (
            <div key={z.name} className="mb-3 last:mb-0">
              <div className="flex justify-between mb-1">
                <span className="text-xs text-foreground font-medium">{z.name}</span>
                <span className="text-xs text-muted-foreground tabular-nums font-bold">{z.count}</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${z.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-border bg-background p-3">
          <p className="text-2xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Alertas</p>
          <div className="flex items-center gap-2 py-1.5 border-b border-border/40">
            <span className="size-2 rounded-full bg-red-500 shrink-0" />
            <span className="text-xs text-foreground font-medium flex-1">Urgentes</span>
            <span className="text-sm font-black text-red-500 tabular-nums">2</span>
          </div>
          <div className="flex items-center gap-2 py-1.5">
            <span className="size-2 rounded-full bg-amber-400 shrink-0" />
            <span className="text-xs text-foreground font-medium flex-1">Atrasadas</span>
            <span className="text-sm font-black text-amber-500 tabular-nums">5</span>
          </div>
        </div>
      </div>
    </div>
  )
}

const FEATURES = [
  {
    id: "kanban",
    eyebrow: "Core",
    label: "Quadro de demandas",
    description: "Todas as solicitações do cidadão em um lugar. Organize por status, atribua responsáveis e acompanhe cada etapa.",
    visual: <KanbanVisual />,
  },
  {
    id: "portal",
    eyebrow: "Cidadão",
    label: "Portal público",
    description: "Cada gabinete tem um link próprio. O cidadão registra e acompanha sua demanda pelo navegador, sem instalar nada.",
    visual: <PortalVisual />,
  },
  {
    id: "equipe",
    eyebrow: "Equipe",
    label: "Gestão de assessores",
    description: "Convide assessores, defina papéis e veja em tempo real quem está com mais demandas em aberto.",
    visual: <TeamVisual />,
  },
  {
    id: "relatorios",
    eyebrow: "Dados",
    label: "Relatórios automáticos",
    description: "Resolução por categoria, bairro e período. Relatório gerado automaticamente, pronto para a assessoria de imprensa.",
    visual: <ReportsVisual />,
  },
  {
    id: "notificacoes",
    eyebrow: "Automação",
    label: "Notificações automáticas",
    description: "A cada mudança de status, o cidadão recebe um aviso. Nenhum assessor precisa fazer isso manualmente.",
    visual: <NotificationsVisual />,
  },
  {
    id: "mapa",
    eyebrow: "Território",
    label: "Mapa de demandas",
    description: "Visualize onde as demandas se concentram e identifique bairros críticos com dados reais do território.",
    visual: <MapVisual />,
  },
]

const AUTO_ADVANCE_MS = 5500

export function FeaturesSection() {
  const { ref, visible } = useInView()
  const [activeIdx, setActiveIdx] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function selectFeature(i: number) {
    if (timerRef.current) clearTimeout(timerRef.current)
    setActiveIdx(i)
    timerRef.current = setTimeout(() => setActiveIdx((prev) => (prev + 1) % FEATURES.length), AUTO_ADVANCE_MS)
  }

  useEffect(() => {
    if (!visible) return
    timerRef.current = setTimeout(() => setActiveIdx(1), AUTO_ADVANCE_MS)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [visible])

  return (
    <section className="py-20 sm:py-24 lg:py-32 bg-muted/20 border-t border-border" id="funcionalidades">
      <div ref={ref} className="max-w-5xl mx-auto px-5 sm:px-8">

        <div className={cn("mb-12 sm:mb-16 transition-all duration-500", visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")}>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-primary mb-4">Funcionalidades</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-[1.07] max-w-2xl">
            Construído para gabinete. Não adaptado.
          </h2>
          <p className="mt-4 sm:mt-5 text-base text-muted-foreground leading-relaxed max-w-lg">
            Cada tela, cada fluxo e cada automação foi desenhada a partir de como assessores e chefes de gabinete trabalham de fato.
          </p>
        </div>

        <div
          className={cn("grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-5 lg:gap-10 transition-all duration-500", visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8")}
          style={{ transitionDelay: "100ms" }}
        >
          <div className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0 -mx-5 px-5 sm:-mx-8 sm:px-8 lg:mx-0 lg:px-0">
            {FEATURES.map((f, i) => (
              <button
                key={f.id}
                type="button"
                onClick={() => selectFeature(i)}
                className={cn(
                  "group relative flex flex-col gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-xl text-left transition-all duration-200 border shrink-0 lg:w-full",
                  activeIdx === i ? "bg-background border-border shadow-sm" : "border-transparent hover:bg-background/60 hover:border-border/40",
                )}
              >
                {activeIdx === i && (
                  <div className="absolute inset-x-0 bottom-0 h-0.5 rounded-b-xl overflow-hidden bg-border/20">
                    <div className="h-full bg-primary rounded-full" style={{ animation: "lp-bar-grow 5.5s linear both" }} />
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <ChevronRight className={cn("size-3 transition-colors shrink-0", activeIdx === i ? "text-primary" : "text-muted-foreground/25")} />
                  <span className={cn("text-2xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap", activeIdx === i ? "text-primary" : "text-muted-foreground/30")}>
                    {f.eyebrow}
                  </span>
                </div>
                <p className={cn("text-xs sm:text-sm font-bold leading-snug transition-colors whitespace-nowrap lg:whitespace-normal", activeIdx === i ? "text-foreground" : "text-muted-foreground/60 group-hover:text-foreground/70")}>
                  {f.label}
                </p>
                {activeIdx === i && (
                  <p className="text-xs text-muted-foreground leading-relaxed hidden lg:block">{f.description}</p>
                )}
              </button>
            ))}
          </div>

          <div
            className="relative rounded-2xl border border-border bg-background shadow-sm overflow-hidden"
            style={{ minHeight: "clamp(280px, 50vw, 460px)" }}
          >
            <div className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-primary/40 via-primary/20 to-transparent" />
            <div className="absolute inset-0 p-3 sm:p-5">
              {FEATURES.map((f, i) => (
                <div
                  key={f.id}
                  className="absolute inset-3 sm:inset-5 transition-all duration-400"
                  style={{
                    opacity: activeIdx === i ? 1 : 0,
                    transform: activeIdx === i ? "scale(1)" : "scale(0.98)",
                    pointerEvents: activeIdx === i ? "auto" : "none",
                  }}
                >
                  {f.visual}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
