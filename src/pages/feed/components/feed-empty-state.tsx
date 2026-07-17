import { PencilLineIcon } from "lucide-react";

interface FeedEmptyStateProps {
  search: string
}

export function FeedEmptyState({ search }: FeedEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-slide-in">
      <div className="size-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <PencilLineIcon className="size-6 text-muted-foreground/40" />
      </div>
      <p className="text-sm font-semibold text-foreground">
        {search ? `Nenhum resultado para "${search}"` : "Nenhuma demanda encontrada"}
      </p>
      <p className="text-xs text-muted-foreground mt-1.5 max-w-xs leading-relaxed">
        Ajuste os filtros ou registre uma nova demanda.
      </p>
    </div>
  )
}
