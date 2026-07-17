import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import type { NeighborhoodCategory } from "@/api/neighborhood/types"

const CAT_COLORS = [
  "bg-primary",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-violet-500",
]

interface NeighborhoodCategoriesProps {
  categories: NeighborhoodCategory[]
}

export function NeighborhoodCategories({ categories }: NeighborhoodCategoriesProps) {
  if (categories.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        Nenhuma categoria registrada ainda.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {categories.map((cat, i) => (
        <div key={cat.id} className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className={cn(
                  "size-2 rounded-full shrink-0",
                  CAT_COLORS[i % CAT_COLORS.length],
                )}
              />
              <span className="text-sm text-foreground truncate">{cat.name}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-sm font-bold tabular-nums text-foreground font-mono">
                {cat.count}
              </span>
              <span className="text-xs text-muted-foreground w-8 text-right tabular-nums">
                {cat.percentage}%
              </span>
            </div>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              className={cn("h-full rounded-full", CAT_COLORS[i % CAT_COLORS.length])}
              initial={{ width: 0 }}
              animate={{ width: `${cat.percentage}%` }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 + i * 0.05 }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
