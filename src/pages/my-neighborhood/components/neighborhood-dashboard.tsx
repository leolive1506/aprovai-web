import { useState } from "react"
import { Edit2, Loader2, MapPin } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useNeighborhoodDashboard } from "@/api/neighborhood/hooks"
import type { UserNeighborhood } from "@/api/neighborhood/types"
import { NeighborhoodSelector } from "./neighborhood-selector"
import { NeighborhoodStatsGrid } from "./neighborhood-stats"
import { NeighborhoodCategories } from "./neighborhood-categories"
import { NeighborhoodCabinets } from "./neighborhood-cabinets"
import { NeighborhoodDemands } from "./neighborhood-demands"
import { NeighborhoodSetup } from "./neighborhood-setup"

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number], delay: i * 0.06 },
  }),
}

interface NeighborhoodDashboardProps {
  neighborhoods: UserNeighborhood[]
  selectedId: string | null
  onSelect: (id: string) => void
}

function SectionCard({
  title,
  children,
  index = 0,
}: {
  title: string
  children: React.ReactNode
  index?: number
}) {
  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      className="rounded-2xl border border-border bg-card overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-border/50">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      </div>
      <div className="px-5 py-4">{children}</div>
    </motion.div>
  )
}

export function NeighborhoodDashboard({
  neighborhoods,
  selectedId,
  onSelect,
}: NeighborhoodDashboardProps) {
  const [isChanging, setIsChanging] = useState(false)

  const selected =
    neighborhoods.find((n) => n.id === selectedId) ??
    neighborhoods.find((n) => n.isPrimary) ??
    neighborhoods[0]

  const { data: dashboard, isLoading } = useNeighborhoodDashboard(
    selected?.neighborhood,
    selected?.city,
    selected?.state,
  )

  if (isChanging) {
    return (
      <NeighborhoodSetup
        onSuccess={() => setIsChanging(false)}
      />
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-wrap items-start justify-between gap-3"
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <MapPin className="size-4 text-primary shrink-0" />
              <h1 className="text-xl font-bold text-foreground tracking-tight">
                {selected.neighborhood}
              </h1>
            </div>
            <NeighborhoodSelector
              neighborhoods={neighborhoods}
              selected={selected}
              onSelect={onSelect}
            />
          </div>
          <p className="text-sm text-muted-foreground pl-5.5">
            {selected.city} · {selected.state}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 h-7 text-xs text-muted-foreground"
          onClick={() => setIsChanging(true)}
        >
          <Edit2 className="size-3" />
          Alterar bairro
        </Button>
      </motion.div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : dashboard ? (
        <>
          <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
            <NeighborhoodStatsGrid stats={dashboard.stats} />
          </motion.div>

          <div className="grid gap-4 lg:grid-cols-2">
            <SectionCard title="Principais problemas" index={1}>
              <NeighborhoodCategories categories={dashboard.topCategories} />
            </SectionCard>

            <SectionCard title="Gabinetes que atendem aqui" index={2}>
              <NeighborhoodCabinets cabinets={dashboard.servingCabinets} />
            </SectionCard>
          </div>

          <SectionCard title="Demandas recentes" index={3}>
            <NeighborhoodDemands demands={dashboard.recentDemands} />
          </SectionCard>
        </>
      ) : null}
    </div>
  )
}
