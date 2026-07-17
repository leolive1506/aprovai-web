import type { CabinetSection, TimelineSectionConfig } from "@/api/cabinets/types";
import { cn } from "@/lib/utils";

export function TimelineSection({
  section,
  accent,
}: {
  section: CabinetSection;
  accent: string;
}) {
  const config = (section.config ?? {}) as TimelineSectionConfig;
  const items = (config.items ?? []).filter((item) => item.title?.trim());

  if (items.length === 0) return null;

  return (
    <section id="timeline" className="py-16 px-4 sm:px-6 bg-foreground text-background">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-12 border-b border-background/10">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-3 opacity-40">
              Trajetória
            </p>
            <h2 className="text-4xl sm:text-5xl font-black leading-[1.04] tracking-tight">
              {section.title || "Linha do tempo"}
            </h2>
          </div>
          {section.subtitle && (
            <p className="text-sm opacity-50 sm:max-w-xs sm:text-right leading-relaxed">
              {section.subtitle}
            </p>
          )}
        </div>

        {/* Timeline — vertical line left, content right, alternating text alignment */}
        <div className="relative pt-12 pl-8 sm:pl-12">
          {/* Vertical track */}
          <div
            className="absolute left-2.75 sm:left-3.75 top-12 bottom-0 w-px"
            style={{ backgroundColor: `${accent}30` }}
          />

          <div className="flex flex-col gap-0">
            {items.map((item, i) => (
              <div key={i} className="relative pb-10 last:pb-0">
                {/* Dot */}
                <div
                  className="absolute -left-8 sm:-left-12 top-1 size-3 rounded-full ring-4 ring-foreground"
                  style={{ backgroundColor: accent }}
                />

                <div className={cn("flex flex-col gap-1", i % 2 === 1 && "sm:items-end sm:text-right")}>
                  {item.date && (
                    <time
                      className="text-xs font-black uppercase tracking-widest"
                      style={{ color: accent }}
                    >
                      {item.date}
                    </time>
                  )}
                  <h3 className="text-base font-bold leading-snug">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-sm opacity-50 leading-relaxed mt-0.5 max-w-sm">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
