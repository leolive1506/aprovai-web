import type { CabinetSection, TestimonialsSectionConfig } from "@/api/cabinets/types";
import { getFirstLettersFromNames } from "@/utils/get-first-letters-from-names";

export function TestimonialsSection({
  section,
  accent,
}: {
  slug: string;
  section: CabinetSection;
  accent: string;
}) {
  const cfg = (section.config ?? {}) as TestimonialsSectionConfig;
  const items = (cfg.items ?? []).filter(
    (item) => item.text?.trim() && item.authorName?.trim(),
  );

  if (items.length === 0) return null;

  return (
    <section className="py-24 px-4 sm:px-6 bg-background overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-14">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: accent }}>
              O que dizem
            </p>
            <h2 className="text-4xl sm:text-5xl font-black text-foreground leading-[1.04] tracking-tight">
              {section.title || "Depoimentos"}
            </h2>
          </div>
          {section.subtitle && (
            <p className="text-sm text-muted-foreground sm:max-w-xs sm:text-right leading-relaxed">
              {section.subtitle}
            </p>
          )}
        </div>

        {/* Cards — masonry feel com alturas variadas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, index) => (
            <div
              key={index}
              className="group flex flex-col justify-between gap-6 rounded-lg border border-border/60 bg-card p-6 transition-shadow hover:shadow-md"
            >
              {/* Opening mark tipográfico — não ícone SVG, texto puro */}
              <div className="flex flex-col gap-4">
                <span
                  className="text-5xl font-black leading-none select-none"
                  style={{ color: `${accent}25` }}
                  aria-hidden
                >
                  "
                </span>
                <p className="text-sm text-foreground/80 leading-[1.75] -mt-2">
                  {item.text}
                </p>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-border/40">
                <div
                  className="size-8 shrink-0 rounded-md flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: accent }}
                >
                  {getFirstLettersFromNames(item.authorName)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground leading-none truncate">{item.authorName}</p>
                  {item.authorRole && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{item.authorRole}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
