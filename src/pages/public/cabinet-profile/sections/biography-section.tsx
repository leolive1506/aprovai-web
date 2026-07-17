import type { Cabinet, CabinetSection } from "@/api/cabinets/types";

export function BiographySection({
  cabinet,
  section,
  accent,
}: {
  cabinet: Cabinet;
  section: CabinetSection;
  accent: string;
}) {
  const photoUrl = cabinet.biographyPhotoUrl || cabinet.avatarUrl;
  const text = cabinet.biographyContent || cabinet.description;

  if (!text && !photoUrl) return null;

  return (
    <section id="biography" className="py-24 px-4 sm:px-6 bg-background">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-0 items-start">

          {/* Photo column */}
          <div className="relative md:pr-16 pb-10 md:pb-0">
            {/* Vertical accent line */}
            <div
              className="hidden md:block absolute right-8 top-0 bottom-0 w-px"
              style={{ backgroundColor: `${accent}20` }}
            />

            {photoUrl ? (
              <div className="relative">
                <img
                  src={photoUrl}
                  alt={`Foto de ${cabinet.name}`}
                  className="w-full max-w-[220px] aspect-[3/4] object-cover rounded-lg shadow-md"
                />
                {cabinet.transparencyScore > 0 && (
                  <div
                    className="absolute -bottom-3 -right-3 flex flex-col items-center justify-center w-16 h-16 rounded-lg shadow-lg border-2 border-background text-white"
                    style={{ backgroundColor: accent }}
                  >
                    <span className="text-lg font-black leading-none">{cabinet.transparencyScore}%</span>
                    <span className="text-[8px] font-bold uppercase tracking-wide opacity-80 mt-0.5">
                      Resolutivo
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div
                className="w-full max-w-[220px] aspect-[3/4] rounded-lg flex items-center justify-center text-5xl font-black text-white"
                style={{ backgroundColor: accent }}
              >
                {cabinet.name.charAt(0)}
              </div>
            )}
          </div>

          {/* Text column */}
          <div className="flex flex-col gap-8 md:pl-2">
            <div className="flex flex-col gap-3">
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: accent }}>
                Sobre o mandato
              </p>
              <h2 className="text-4xl sm:text-5xl font-black text-foreground leading-[1.04] tracking-tight">
                {section.title || cabinet.name}
              </h2>
              {section.subtitle && (
                <p className="text-base text-muted-foreground leading-relaxed">{section.subtitle}</p>
              )}
            </div>

            {text && (
              <p className="text-[0.9375rem] text-foreground/70 leading-[1.85] whitespace-pre-line">
                {text}
              </p>
            )}

            {(cabinet.demand_count > 0 || cabinet.resolved_count > 0) && (
              <div className="grid grid-cols-2 gap-px bg-border/40 rounded-lg overflow-hidden border border-border/40 max-w-xs">
                {cabinet.demand_count > 0 && (
                  <div className="bg-card px-5 py-4">
                    <p className="text-2xl font-black text-foreground tabular-nums">
                      {cabinet.demand_count.toLocaleString("pt-BR")}
                    </p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mt-1">
                      Demandas
                    </p>
                  </div>
                )}
                {cabinet.resolved_count > 0 && (
                  <div className="bg-card px-5 py-4">
                    <p className="text-2xl font-black tabular-nums" style={{ color: accent }}>
                      {cabinet.resolved_count.toLocaleString("pt-BR")}
                    </p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mt-1">
                      Resolvidas
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
