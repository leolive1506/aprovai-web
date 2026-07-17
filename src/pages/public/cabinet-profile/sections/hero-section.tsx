import { useEffect, useState } from "react";
import type { Cabinet, CabinetSection, HeroSectionConfig } from "@/api/cabinets/types";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronLeft, ChevronRight, ShieldCheck, Users } from "lucide-react";

export function HeroSection({
  cabinet,
  section,
  accent,
  onOpenForm,
}: {
  cabinet: Cabinet;
  section: CabinetSection;
  accent: string;
  onOpenForm?: () => void;
}) {
  const config = (section.config ?? {}) as HeroSectionConfig;
  const extraSlides = (config.slides ?? []).filter((s) => s.url?.trim());

  const allSlides = [
    ...(cabinet.bannerUrl ? [{ url: cabinet.bannerUrl, caption: "" }] : []),
    ...extraSlides,
  ];

  const hasSlides = allSlides.length > 0;
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (allSlides.length <= 1) return;
    const id = setInterval(() => {
      setActiveSlide((i) => (i + 1) % allSlides.length);
    }, 5000);
    return () => clearInterval(id);
  }, [allSlides.length]);

  function scrollToSection(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="relative w-full overflow-hidden" style={{ minHeight: "92vh" }}>
      {/* Background */}
      {hasSlides ? (
        allSlides.map((slide, i) => (
          <img
            key={i}
            src={slide.url}
            alt=""
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition-opacity duration-700",
              i === activeSlide ? "opacity-100" : "opacity-0",
            )}
          />
        ))
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 20% 40%, ${accent}55 0%, transparent 60%),
              radial-gradient(ellipse 60% 80% at 80% 60%, ${accent}33 0%, transparent 55%),
              linear-gradient(160deg, #0f1117 0%, #1a1f2e 50%, #0f1117 100%)
            `,
          }}
        />
      )}

      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: hasSlides
            ? "linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.50) 60%, rgba(0,0,0,0.80) 100%)"
            : "linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.04) 100%)",
        }}
      />

      {/* Grid texture for no-image bg */}
      {!hasSlides && (
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      )}

      {/* Content */}
      <div
        className="relative z-10 flex flex-col items-center justify-center text-center text-white px-4 sm:px-6"
        style={{ minHeight: "92vh", paddingTop: "4rem", paddingBottom: "6rem" }}
      >
        {/* Cabinet identity pill */}
        {cabinet.avatarUrl && (
          <div className="mb-6 flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 pl-1.5 pr-4 py-1.5 backdrop-blur-sm text-sm font-medium text-white/90">
            <img src={cabinet.avatarUrl} alt="" className="size-6 rounded-full object-cover" />
            {cabinet.name}
          </div>
        )}

        {/* Headline */}
        <h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-6 max-w-4xl"
          style={{ textShadow: "0 2px 20px rgba(0,0,0,0.4)" }}
        >
          {section.title || cabinet.heroTitle || cabinet.name}
        </h1>

        {(section.subtitle || cabinet.heroSubtitle || cabinet.tagline) && (
          <p className="text-lg sm:text-xl font-medium text-white/75 max-w-2xl mb-10 leading-relaxed">
            {section.subtitle || cabinet.heroSubtitle || cabinet.tagline}
          </p>
        )}

        {/* CTAs — primary opens form directly, not scroll to section */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-center mb-14">
          <button
            type="button"
            onClick={onOpenForm}
            className="inline-flex items-center gap-2.5 rounded-lg px-7 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:opacity-90 hover:-translate-y-px active:scale-[0.98]"
            style={{ backgroundColor: accent }}
          >
            {config.primaryCtaLabel?.trim() || "Enviar uma solicitação"}
          </button>
          <button
            type="button"
            onClick={() => scrollToSection("biography")}
            className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 active:scale-[0.98]"
          >
            {config.secondaryCtaLabel?.trim() || "Conheça o Gabinete"}
          </button>
        </div>

        {/* Trust signals — apenas dados verificáveis, sem "Verificado" genérico */}
        <div className="flex flex-wrap items-center justify-center gap-5 text-white/55 text-xs font-medium">
          {cabinet.demand_count > 0 && (
            <span className="flex items-center gap-1.5">
              <Users className="size-3.5" style={{ color: accent }} />
              {cabinet.demand_count.toLocaleString("pt-BR")} cidadãos atendidos
            </span>
          )}
          {cabinet.transparencyScore > 0 && (
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5" style={{ color: accent }} />
              {cabinet.transparencyScore}% de resolutividade
            </span>
          )}
          {cabinet.resolved_count > 0 && (
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 opacity-0 pointer-events-none" />
              {cabinet.resolved_count.toLocaleString("pt-BR")} problemas resolvidos
            </span>
          )}
        </div>
      </div>

      {/* Carousel controls */}
      {allSlides.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => setActiveSlide((i) => (i - 1 + allSlides.length) % allSlides.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex size-9 items-center justify-center rounded-lg bg-black/30 text-white backdrop-blur-sm hover:bg-black/50 transition-colors"
            aria-label="Slide anterior"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setActiveSlide((i) => (i + 1) % allSlides.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex size-9 items-center justify-center rounded-lg bg-black/30 text-white backdrop-blur-sm hover:bg-black/50 transition-colors"
            aria-label="Próximo slide"
          >
            <ChevronRight className="size-4" />
          </button>

          {/* Dot indicators */}
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
            {allSlides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveSlide(i)}
                className={cn(
                  "rounded-full transition-all duration-300",
                  i === activeSlide ? "w-5 h-1.5 bg-white" : "size-1.5 bg-white/35 hover:bg-white/60",
                )}
                aria-label={`Ir para slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}

      {/* Scroll indicator — sem animate-bounce (proibido no DS) */}
      <button
        type="button"
        onClick={() => scrollToSection("biography")}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 text-white/35 hover:text-white/65 transition-colors"
        aria-label="Rolar para baixo"
      >
        <ChevronDown className="size-5 transition-transform hover:translate-y-0.5" />
      </button>
    </div>
  );
}
