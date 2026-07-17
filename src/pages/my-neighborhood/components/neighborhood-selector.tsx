import { MapPin, Star } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { UserNeighborhood } from "@/api/neighborhood/types"
import { useSetPrimaryNeighborhood } from "@/api/neighborhood/hooks"

interface NeighborhoodSelectorProps {
  neighborhoods: UserNeighborhood[]
  selected: UserNeighborhood
  onSelect: (id: string) => void
}

export function NeighborhoodSelector({
  neighborhoods,
  selected,
  onSelect,
}: NeighborhoodSelectorProps) {
  const { mutate: setPrimary } = useSetPrimaryNeighborhood()

  if (neighborhoods.length <= 1) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 h-7 text-xs font-medium max-w-48 truncate"
        >
          <MapPin className="size-3 shrink-0" />
          <span className="truncate">
            {selected.label ?? selected.neighborhood}
          </span>
          <span className="text-muted-foreground shrink-0">▾</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-52">
        {neighborhoods.map((n) => (
          <DropdownMenuItem
            key={n.id}
            onClick={() => onSelect(n.id)}
            className={cn(
              "flex items-center gap-2",
              n.id === selected.id && "bg-muted/50",
            )}
          >
            <MapPin className="size-3.5 text-muted-foreground shrink-0" />
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-medium truncate">
                {n.label ?? n.neighborhood}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                {n.neighborhood}, {n.city}
              </span>
            </div>
            {n.isPrimary && (
              <Star className="size-3 text-amber-400 fill-amber-400 shrink-0" />
            )}
          </DropdownMenuItem>
        ))}

        {!selected.isPrimary && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setPrimary(selected.id)}
              className="text-xs text-muted-foreground"
            >
              <Star className="size-3.5 shrink-0" />
              Definir como principal
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
