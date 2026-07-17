import type { CabinetMetrics, CabinetSection } from "@/api/cabinets/types";

export function StatsSection({
  metrics,
  section,
  accent,
  score,
}: {
  metrics: CabinetMetrics | undefined;
  section: CabinetSection;
  accent: string;
  score: number;
}) {
  if (!metrics) return null;

  const stats = [
    {
      value: metrics.total.toLocaleString("pt-BR"),
      label: "Demandas recebidas",
    },
    {
      value: metrics.resolved.toLocaleString("pt-BR"),
      label: "Resolvidas",
    },
    {
      value: metrics.statusCounts.IN_PROGRESS.toLocaleString("pt-BR"),
      label: "Em andamento",
    },
    {
      value: `${score}%`,
      label: "Resolutividade",
    },
  ];

  return (
    <section className="bg-foreground text-background py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Section label */}
        <div className="border-b border-background/10 py-5">
          <p className="text-xs font-bold uppercase tracking-widest opacity-40">
            {section.title || "Transparência em números"}
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-background/10">
          {stats.map(({ value, label }, i) => (
            <div key={i} className="flex flex-col gap-1 py-10 px-6 sm:px-8 first:pl-0 last:pr-0">
              <p
                className="text-5xl sm:text-6xl font-black tabular-nums leading-none tracking-tight"
                style={i === 0 ? { color: accent } : undefined}
              >
                {value}
              </p>
              <p className="text-xs font-medium uppercase tracking-widest opacity-50 mt-3">
                {label}
              </p>
              {/* Accent underline only on first stat */}
              {i === 0 && (
                <div className="h-0.5 w-8 mt-2 rounded-full" style={{ backgroundColor: accent }} />
              )}
            </div>
          ))}
        </div>

        {section.subtitle && (
          <div className="border-t border-background/10 py-5">
            <p className="text-xs opacity-40 leading-relaxed max-w-lg">{section.subtitle}</p>
          </div>
        )}
      </div>
    </section>
  );
}
