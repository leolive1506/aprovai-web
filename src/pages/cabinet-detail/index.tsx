import { useGetCabinetBySlug, useGetCabinetMetrics } from "@/api/cabinets/hooks";
import { useGetDemandsByCabinetSlug } from "@/api/demands/hooks";
import { Loading } from "@/components/loading";
import { Post } from "@/components/post";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getFirstLettersFromNames } from "@/utils/get-first-letters-from-names";
import { ArrowLeft, FileText, Mail } from "lucide-react";
import { Link, useParams } from "react-router-dom";

function StatItem({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="flex flex-col gap-1 px-4 py-3.5 rounded-xl border border-border bg-card">
      <p className="text-2xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold tabular-nums leading-none text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

export function CabinetDetail() {
  const { slug } = useParams() as { slug: string };
  const { data: cabinet, isLoading: isLoadingCabinet } = useGetCabinetBySlug(slug);
  const { data: metrics } = useGetCabinetMetrics(slug);
  const { data: demandsData, isLoading: isLoadingDemands } = useGetDemandsByCabinetSlug({
    slug,
    limit: 20,
    page: 1,
  });

  const demands = demandsData?.items ?? [];

  if (isLoadingCabinet) {
    return (
      <div className="flex justify-center py-16">
        <Loading className="text-primary size-6" />
      </div>
    );
  }

  if (!cabinet) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <p className="text-sm text-muted-foreground">Gabinete não encontrado.</p>
        <Link to="/gabinetes">
          <Button variant="outline" size="sm" className="mt-4">
            <ArrowLeft className="size-3.5" />
            Voltar aos gabinetes
          </Button>
        </Link>
      </div>
    );
  }

  const hasMetrics = metrics !== undefined;

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-5">
      <Link
        to="/gabinetes"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ArrowLeft className="size-3.5" />
        Todos os gabinetes
      </Link>

      <div className="bg-card rounded-xl border border-border p-5 flex items-start gap-4">
        <Avatar className="size-16 shrink-0">
          <AvatarImage src={cabinet.avatarUrl} />
          <AvatarFallback className="bg-muted text-foreground font-bold text-xl">
            {getFirstLettersFromNames(cabinet.name)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-foreground leading-tight">{cabinet.name}</h1>
              {cabinet.description && (
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed max-w-xl">
                  {cabinet.description}
                </p>
              )}
              {cabinet.email && (
                <a
                  href={`mailto:${cabinet.email}`}
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mt-2"
                >
                  <Mail className="size-3.5" />
                  {cabinet.email}
                </a>
              )}
            </div>
            {cabinet.score !== undefined && (
              <div className="text-right shrink-0">
                <p className="text-lg font-bold text-foreground tabular-nums">{cabinet.score}</p>
                <p className="text-xs text-muted-foreground">pontos</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {hasMetrics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatItem
            label="Total"
            value={metrics.total ?? cabinet.demand_count ?? 0}
            sub="esse mês"
          />
          <StatItem
            label="Resolvidas"
            value={metrics.resolved ?? 0}
            sub="esse mês"
          />
          <StatItem
            label="Urgentes"
            value={metrics.urgent ?? 0}
            sub="em aberto"
          />
          <StatItem
            label="Novas"
            value={metrics.new ?? 0}
            sub="últimas 24h"
          />
        </div>
      )}

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-foreground">Demandas do gabinete</h2>
          {!isLoadingDemands && demands.length > 0 && (
            <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
              {demandsData?.meta?.total ?? demands.length}
            </span>
          )}
        </div>

        {isLoadingDemands ? (
          <div className="flex justify-center py-10">
            <Loading className="text-primary size-6" />
          </div>
        ) : demands.length === 0 ? (
          <div className="bg-card rounded-xl border border-border flex flex-col items-center justify-center py-14 gap-3 text-center">
            <div className="size-12 rounded-full bg-muted flex items-center justify-center">
              <FileText className="size-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Nenhuma demanda ainda</p>
              <p className="text-xs text-muted-foreground mt-1">
                Este gabinete ainda não possui demandas vinculadas.
              </p>
            </div>
          </div>
        ) : (
          demands.map((demand) => (
            <Post key={demand.id} demand={demand} showStatus />
          ))
        )}
      </div>
    </div>
  );
}
