import { useParams, Link, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  useGetCabinetBySlug,
  useGetCabinetMetrics,
  useGetCabinetSections,
} from "@/api/cabinets/hooks";
import { Button } from "@/components/ui/button";
import { Building2, ChevronDown, LogIn, LogOut, Settings } from "lucide-react";
import { PublicDemandForm } from "./public-demand-form";
import Logo from "@/assets/logo-new.png";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

// Sections
import { HeroSection } from "./sections/hero-section";
import { BiographySection } from "./sections/biography-section";
import { StatsSection } from "./sections/stats-section";
import { ResultsSection } from "./sections/results-section";
import { DemandsCtaSection } from "./sections/demands-cta-section";
import { ContactSection } from "./sections/contact-section";
import { TestimonialsSection } from "./sections/testimonials-section";
import { PrioritiesSection } from "./sections/priorities-section";
import { FaqSection } from "./sections/faq-section";
import { TimelineSection } from "./sections/timeline-section";
import { GallerySection } from "./sections/gallery-section";
import type { CabinetSection } from "@/api/cabinets/types";

// ─── Header ───────────────────────────────────────────────────────────────────

function ProfileHeader({
  accent,
  cabinetName,
  logoUrl,
}: {
  accent: string;
  cabinetName?: string;
  logoUrl?: string | null;
}) {
  const { isAuthenticated, user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const initials = user?.name ? user.name.substring(0, 2).toUpperCase() : "U";

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      setScrolled(y > 40);
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docH > 0 ? Math.min((y / docH) * 100, 100) : 0);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/95 backdrop-blur-md border-b border-border/40 shadow-sm"
          : "bg-transparent border-b border-transparent",
      )}
    >
      {/* Scroll progress bar */}
      <div
        className="absolute bottom-0 left-0 h-0.5 transition-all duration-100"
        style={{ width: `${scrollProgress}%`, backgroundColor: accent }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left */}
        <div className="flex items-center gap-3 min-w-0">
          <Link to="/" className="shrink-0">
            <img
              src={logoUrl || Logo}
              alt={logoUrl ? cabinetName : "Gabinete App"}
              className={cn(
                "transition-all duration-300 object-contain",
                scrolled ? "w-24 h-9" : "w-28 h-10",
              )}
            />
          </Link>
          {cabinetName && scrolled && (
            <div className="hidden sm:flex items-center gap-2 text-sm font-semibold text-foreground min-w-0">
              <span className="text-border">·</span>
              <span className="truncate">{cabinetName}</span>
            </div>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:flex text-xs font-medium">
                <Link to="/home">Painel</Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-1.5 rounded-full pl-1 pr-2 py-1 hover:bg-muted transition-colors focus:outline-none border border-border/50"
                  >
                    <Avatar size="sm">
                      <AvatarImage src={user?.avatarUrl ?? undefined} />
                      <AvatarFallback
                        className="text-white text-xs font-semibold"
                        style={{ backgroundColor: accent }}
                      >
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="size-3 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 mt-1 rounded-xl shadow-lg">
                  <div className="px-3 py-2.5 border-b border-border/50">
                    <p className="text-sm font-semibold truncate">{user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                  <div className="p-1">
                    <DropdownMenuItem asChild className="gap-2 rounded-lg">
                      <Link to="/settings">
                        <Settings className="size-4" />
                        Configurações
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="gap-2 rounded-lg text-red-500">
                      <LogOut className="size-4" />
                      Sair
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className={cn(
                  "gap-1.5 text-sm font-medium transition-colors",
                  !scrolled && "text-white hover:text-white hover:bg-white/10",
                )}
              >
                <Link to="/login">
                  <LogIn className="size-4" />
                  Entrar
                </Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="text-sm font-bold text-white shadow-md hover:scale-105 transition-transform"
                style={{ backgroundColor: accent }}
              >
                <Link to="/sign-up">Criar conta</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-16 border-b border-border/40" />
      <div className="h-[92vh] bg-muted animate-pulse" />
      <div className="max-w-5xl mx-auto px-4 py-20 flex flex-col gap-6">
        <div className="h-8 w-56 rounded-xl bg-muted animate-pulse" />
        <div className="h-4 w-full max-w-lg rounded-lg bg-muted/70 animate-pulse" />
        <div className="h-4 w-full max-w-md rounded-lg bg-muted/70 animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-muted/60 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function PublicCabinetProfile() {
  const { slug } = useParams() as { slug: string };
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: cabinet, isLoading: isCabinetLoading } = useGetCabinetBySlug(slug);
  const { data: metrics } = useGetCabinetMetrics(slug);
  const { data: sectionsData = [], isLoading: isSectionsLoading } = useGetCabinetSections(slug);
  const [demandFormOpen, setDemandFormOpen] = useState(
    () => searchParams.get("nova-demanda") === "1",
  );

  useEffect(() => {
    if (isSectionsLoading || searchParams.get("nova-demanda") !== "1") return;

    document.getElementById("demands-cta")?.scrollIntoView({ behavior: "smooth", block: "start" });

    const next = new URLSearchParams(searchParams);
    next.delete("nova-demanda");
    setSearchParams(next, { replace: true });
  }, [isSectionsLoading, searchParams, setSearchParams]);

  useEffect(() => {
    if (!cabinet) return;
    const prev = document.title;
    document.title = `${cabinet.name} · Gabinete Digital`;
    const description =
      cabinet.tagline || cabinet.description || `Página oficial do gabinete ${cabinet.name}.`;
    const tags: { selector: string; attr: string; key: string; content: string }[] = [
      { selector: 'meta[name="description"]', attr: "name", key: "description", content: description },
      { selector: 'meta[property="og:title"]', attr: "property", key: "og:title", content: `${cabinet.name} · Gabinete Digital` },
      { selector: 'meta[property="og:description"]', attr: "property", key: "og:description", content: description },
    ];
    for (const tag of tags) {
      let el = document.head.querySelector<HTMLMetaElement>(tag.selector);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(tag.attr, tag.key);
        document.head.appendChild(el);
      }
      el.content = tag.content;
    }
    return () => { document.title = prev; };
  }, [cabinet]);

  if (isCabinetLoading || isSectionsLoading) return <PageSkeleton />;

  if (!cabinet) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-5 px-4 text-center">
        <div className="size-16 rounded-3xl bg-muted flex items-center justify-center">
          <Building2 className="size-8 text-muted-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Gabinete não encontrado</h1>
          <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
            A página que você tentou acessar não existe ou está indisponível.
          </p>
        </div>
        <Button asChild size="lg">
          <Link to="/">Voltar para o início</Link>
        </Button>
      </div>
    );
  }

  const accent = cabinet.accentColor || "#2563EB";
  const score = cabinet.transparencyScore ?? 0;
  const sections = [...sectionsData]
    .filter((s) => s.enabled)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  function renderSection(section: CabinetSection) {
    switch (section.type) {
      case "HERO":
        return <HeroSection key={section.id} cabinet={cabinet!} section={section} accent={accent} onOpenForm={() => setDemandFormOpen(true)} />;
      case "BIOGRAPHY":
        return <BiographySection key={section.id} cabinet={cabinet!} section={section} accent={accent} />;
      case "PRIORITIES":
        return <PrioritiesSection key={section.id} section={section} accent={accent} />;
      case "STATS":
        return <StatsSection key={section.id} metrics={metrics} section={section} accent={accent} score={score} />;
      case "DEMANDS_CTA":
        return <DemandsCtaSection key={section.id} section={section} accent={accent} onOpenForm={() => setDemandFormOpen(true)} />;
      case "RESULTS":
        return <ResultsSection key={section.id} slug={cabinet!.slug} section={section} accent={accent} />;
      case "TIMELINE":
        return <TimelineSection key={section.id} section={section} accent={accent} />;
      case "GALLERY":
        return <GallerySection key={section.id} section={section} accent={accent} />;
      case "FAQ":
        return <FaqSection key={section.id} section={section} accent={accent} />;
      case "CONTACT":
        return <ContactSection key={section.id} cabinet={cabinet!} section={section} accent={accent} />;
      case "TESTIMONIALS":
        return <TestimonialsSection key={section.id} slug={cabinet!.slug} section={section} accent={accent} />;
      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen bg-background font-sans">
      <ProfileHeader accent={accent} cabinetName={cabinet.name} logoUrl={cabinet.logoUrl} />

      <main className="pt-16 flex flex-col">
        {sections.length > 0 ? (
          sections.map(renderSection)
        ) : (
          <div className="flex flex-col items-center justify-center py-40 text-center gap-4 px-4">
            <Building2 className="size-12 text-muted-foreground/30" />
            <div>
              <p className="text-lg font-semibold text-foreground">Página em construção</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
                Este gabinete ainda não configurou sua página pública.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60 bg-background px-4 py-14">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
            {/* Cabinet identity */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2.5">
                {cabinet.avatarUrl && (
                  <img src={cabinet.avatarUrl} alt="" className="size-7 rounded-lg object-cover" />
                )}
                <span className="text-sm font-bold text-foreground">{cabinet.name}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
                Página oficial gerenciada pelo Gabinete Digital — plataforma de transparência e participação cidadã.
              </p>
            </div>

            {/* Platform link */}
            <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
              <Link to="/" className="opacity-50 hover:opacity-100 transition-opacity">
                <img src={Logo} alt="Gabinete Digital" className="w-22" />
              </Link>
              <span className="text-xs text-muted-foreground">
                &copy; {new Date().getFullYear()} Gabinete Digital
              </span>
            </div>
          </div>

          {/* Divider + bottom row */}
          <div className="mt-10 pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground/60">
              As informações e demandas exibidas são de responsabilidade do gabinete.
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground/60">
              <Link to="/termos-de-uso" className="hover:text-foreground transition-colors">Termos de uso</Link>
              <Link to="/politica-de-privacidade" className="hover:text-foreground transition-colors">Privacidade</Link>
            </div>
          </div>
        </div>
      </footer>

      <PublicDemandForm
        open={demandFormOpen}
        onOpenChange={setDemandFormOpen}
        cabinet={cabinet}
        accent={accent}
      />
    </div>
  );
}
