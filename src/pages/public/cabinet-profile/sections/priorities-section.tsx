import type { CabinetSection, PrioritiesSectionConfig } from "@/api/cabinets/types";

export function PrioritiesSection({
  section,
  accent,
}: {
  section: CabinetSection;
  accent: string;
}) {
  const config = (section.config ?? {}) as PrioritiesSectionConfig;
  const items = (config.items ?? []).filter((item) => item.title?.trim());

  if (items.length === 0) return null;

  return (
    <section id="priorities" className="py-24 px-4 sm:px-6 bg-muted/30">
      <div className="max-w-5xl mx-auto">
        {/* Header — split layout, não centralizado */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-end mb-16">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: accent }}>
              Compromissos
            </p>
            <h2 className="text-4xl sm:text-5xl font-black text-foreground leading-[1.04] tracking-tight">
              {section.title || "Nossas prioridades"}
            </h2>
          </div>
          {section.subtitle && (
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed md:text-right md:pb-1">
              {section.subtitle}
            </p>
          )}
        </div>

        {/* Items */}
        <div className="flex flex-col">
          {items.map((item, i) => (
            <div
              key={i}
              className="group grid grid-cols-[56px_1fr] gap-6 sm:gap-10 py-8 border-t border-border/50 last:border-b"
            >
              {/* Number */}
              <div className="flex flex-col items-start pt-0.5">
                <span
                  className="text-4xl sm:text-5xl font-black tabular-nums leading-none select-none"
                  style={{ color: `${accent}22` }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>

              {/* Content */}
              <div className="flex flex-col gap-2 min-w-0 relative">
                {/* Hover accent bar */}
                <div
                  className="absolute -left-6 sm:-left-10 top-1 h-0 w-0.5 group-hover:h-6 rounded-full transition-all duration-300"
                  style={{ backgroundColor: accent }}
                />
                <h3 className="text-base sm:text-lg font-bold text-foreground leading-snug">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
