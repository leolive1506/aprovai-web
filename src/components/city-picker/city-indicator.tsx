import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CitySearchInput } from "@/components/city-picker/city-search-input"
import { useNavigationCity, type NavigationCity } from "@/contexts/navigation-city-context"
import { cn } from "@/lib/utils"
import { ChevronDown, MapPin, X } from "lucide-react"
import { useState } from "react"

interface Props {
  align?: "start" | "center" | "end"
}

export function CityIndicator({ align = "start" }: Props) {
  const { navigationCity, setNavigationCity, clearNavigationCity } = useNavigationCity()
  const [open, setOpen] = useState(false)

  function handleSelect(city: NavigationCity) {
    setNavigationCity(city)
    setOpen(false)
  }

  function handleClear() {
    clearNavigationCity()
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-1.5 h-7 px-2.5 rounded-lg border border-border bg-muted/40",
            "text-xs font-medium transition-colors",
            "hover:bg-muted hover:border-border/80",
            open && "bg-muted border-border/80",
            navigationCity ? "text-foreground" : "text-muted-foreground",
          )}
        >
          <MapPin className={cn("size-3 shrink-0 stroke-[1.5]", navigationCity ? "text-primary" : "text-muted-foreground")} />
          <span className="hidden sm:inline max-w-32 truncate">
            {navigationCity?.label ?? "Todas as cidades"}
          </span>
          <ChevronDown className={cn("size-3 shrink-0 stroke-[1.5] text-muted-foreground transition-transform duration-150", open && "rotate-180")} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0 gap-0 rounded-xl" align={align} sideOffset={6}>
        <div className="px-4 py-3 border-b border-border">
          <p className="text-xs font-semibold text-foreground">Filtrar por cidade</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {navigationCity ? (
              <>Vendo demandas de <span className="font-medium text-foreground">{navigationCity.label}</span></>
            ) : (
              "Selecione uma cidade para filtrar o feed e o mapa"
            )}
          </p>
        </div>
        <div className="px-3 py-3 flex flex-col gap-2">
          <CitySearchInput onSelect={handleSelect} autoFocus={open} placeholder="Buscar cidade..." />
          {navigationCity && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="justify-start gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
              Ver todas as cidades
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
