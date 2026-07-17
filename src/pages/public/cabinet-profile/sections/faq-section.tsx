import { useState } from "react";
import type { CabinetSection, FaqSectionConfig } from "@/api/cabinets/types";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export function FaqSection({
  section,
  accent,
}: {
  section: CabinetSection;
  accent: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const config = (section.config ?? {}) as FaqSectionConfig;
  const items = (config.items ?? []).filter(
    (item) => item.question?.trim() && item.answer?.trim(),
  );

  if (items.length === 0) return null;

  return (
    <section id="faq" className="py-24 px-4 sm:px-6 bg-muted/30">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-14 md:gap-20 items-start">

          {/* Left: sticky header */}
          <div className="md:sticky md:top-24 flex flex-col gap-3">
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: accent }}>
              {typeof section.config?.eyebrowLabel === "string" ? section.config.eyebrowLabel : "Dúvidas"}
            </p>
            <h2 className="text-4xl sm:text-5xl font-black text-foreground leading-[1.04] tracking-tight">
              {section.title || "Perguntas frequentes"}
            </h2>
            {section.subtitle && (
              <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                {section.subtitle}
              </p>
            )}
          </div>

          {/* Right: accordion */}
          <div className="flex flex-col">
            {items.map((item, i) => {
              const isOpen = openIndex === i;
              return (
                <div
                  key={i}
                  className="border-t border-border/50 last:border-b"
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="flex w-full items-center gap-4 py-5 text-left group"
                    aria-expanded={isOpen}
                  >
                    {/* Accent number */}
                    <span
                      className="shrink-0 text-xs font-black tabular-nums w-5 text-right select-none"
                      style={{ color: `${accent}60` }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>

                    <span className={cn(
                      "flex-1 text-sm font-semibold leading-snug transition-colors",
                      isOpen ? "text-foreground" : "text-foreground/75 group-hover:text-foreground",
                    )}>
                      {item.question}
                    </span>

                    <ChevronDown
                      className={cn(
                        "shrink-0 size-4 text-muted-foreground/50 transition-transform duration-200",
                        isOpen && "rotate-180",
                      )}
                    />
                  </button>

                  <div
                    className={cn(
                      "grid transition-all duration-300 ease-out",
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                    )}
                  >
                    <div className="overflow-hidden">
                      <p className="pl-9 pb-6 text-sm text-muted-foreground leading-[1.85] whitespace-pre-line">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
