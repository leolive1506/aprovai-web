import type { CabinetSection } from "@/api/cabinets/types";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export function DemandsCtaSection({
  section,
  accent,
  onOpenForm,
}: {
  section: CabinetSection;
  accent: string;
  onOpenForm: () => void;
}) {
  return (
    <section id="demands-cta" className="py-24 px-4 sm:px-6 bg-background">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-16 lg:gap-24 items-end border-t-2 pt-12" style={{ borderColor: accent }}>

          {/* Left — tipografia grande */}
          <div className="flex flex-col gap-8">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {typeof section.config?.eyebrow === "string" ? section.config.eyebrow : "Canal direto com o mandato"}
            </p>

            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black text-foreground leading-[1.02] tracking-tight">
              {section.title || "Sua voz\nimporta."}
            </h2>

            <p className="text-base text-muted-foreground leading-relaxed max-w-sm">
              {section.subtitle ||
                "Registre uma demanda para o seu bairro e acompanhe a resolução em tempo real."}
            </p>

            <ul className="flex flex-col gap-2">
              {[
                "100% gratuito, sem necessidade de cadastro",
                "Acompanhamento em tempo real da solicitação",
                "Equipe notificada imediatamente ao enviar",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="shrink-0 size-1 rounded-full bg-muted-foreground/40" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Right — CTA isolado */}
          <div className="flex flex-col items-start lg:items-end gap-4 lg:pb-1 shrink-0">
            <button
              type="button"
              onClick={onOpenForm}
              className="group inline-flex items-center gap-3 rounded-lg px-8 py-4 text-base font-bold text-white transition-all hover:opacity-90 hover:-translate-y-px active:scale-[0.98] shadow-lg whitespace-nowrap"
              style={{ backgroundColor: accent }}
            >
              Enviar solicitação
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </button>

            <p className="text-xs text-muted-foreground/60">
              Ao enviar, você concorda com nossa{" "}
              <Link
                to="/politica-de-privacidade"
                className="underline underline-offset-2 hover:text-foreground transition-colors"
              >
                política de privacidade
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
