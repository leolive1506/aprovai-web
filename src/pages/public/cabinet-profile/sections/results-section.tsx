import type { CabinetSection } from "@/api/cabinets/types";
import { useGetDemandsByCabinetSlug } from "@/api/demands/hooks";
import { Loading } from "@/components/loading";
import { CheckCircle2, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

export function ResultsSection({
  slug,
  section,
  accent,
}: {
  slug: string;
  section: CabinetSection;
  accent: string;
}) {
  const { data: demandsData, isLoading } = useGetDemandsByCabinetSlug({
    slug,
    page: 1,
    limit: 3,
    status: "RESOLVED",
  });

  const demands = demandsData?.items ?? [];
  const total = demandsData?.meta?.total ?? 0;

  if (!isLoading && demands.length === 0) return null;

  return (
    <section className="py-24 px-4 sm:px-6 bg-background">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-14">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: accent }}>
              Resultados entregues
            </p>
            <h2 className="text-4xl sm:text-5xl font-black text-foreground leading-[1.04] tracking-tight">
              {section.title || "Resultados concretos"}
            </h2>
            {section.subtitle && (
              <p className="text-base text-muted-foreground mt-3 max-w-md leading-relaxed">
                {section.subtitle}
              </p>
            )}
          </div>
          {total > 3 && (
            <Link
              to={`/feed?cabinet=${slug}&status=RESOLVED`}
              className="shrink-0 text-xs font-semibold underline underline-offset-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              Ver todos os {total} resultados
            </Link>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loading className="text-muted-foreground size-5" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {demands.map((demand) => (
              <div
                key={demand.id}
                className="group flex flex-col gap-4 rounded-lg border border-border/60 bg-card p-5 transition-shadow hover:shadow-sm"
              >
                {/* Status chip */}
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 shrink-0" style={{ color: accent }} />
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: accent }}>
                    Resolvida
                  </span>
                </div>

                {/* Title */}
                <p className="text-sm font-semibold text-foreground leading-snug line-clamp-3 flex-1">
                  {demand.title}
                </p>

                {/* Meta */}
                <div className="flex flex-col gap-1.5 pt-3 border-t border-border/40">
                  {demand.category && (
                    <span className="text-xs text-muted-foreground font-medium">
                      {demand.category.name}
                    </span>
                  )}
                  {(demand.neighborhood || demand.city) && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="size-3 shrink-0" />
                      {[demand.neighborhood, demand.city].filter(Boolean).join(", ")}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer link — mobile */}
        {total > 3 && (
          <div className="mt-8 flex justify-center sm:hidden">
            <Link
              to={`/feed?cabinet=${slug}&status=RESOLVED`}
              className="text-xs font-semibold underline underline-offset-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              Ver todos os {total} resultados
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
