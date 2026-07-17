import { cn } from "@/lib/utils"
import { Loader2, Search, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"

interface IbgeCity { id: number; nome: string }

function normalize(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
}

interface CitySelectProps {
  state: string
  value: string
  onChange: (city: string) => void
  disabled?: boolean
}

export function CitySelect({ state, value, onChange, disabled }: CitySelectProps) {
  const [cities, setCities] = useState<IbgeCity[]>([])
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState(value)
  const [isOpen, setIsOpen] = useState(false)
  const [isSelected, setIsSelected] = useState(!!value)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!state) {
      setCities([])
      return
    }
    setLoading(true)
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${state}/municipios?orderBy=nome`)
      .then((r) => r.json())
      .then((data: IbgeCity[]) => setCities(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [state])

  useEffect(() => {
    if (value !== query) {
      setQuery(value)
      setIsSelected(!!value)
    }
  }, [value])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setIsOpen(false)
        if (!isSelected) setQuery("")
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [isSelected])

  const filtered = query && !isSelected
    ? cities.filter((c) => normalize(c.nome).includes(normalize(query)))
    : cities

  function handleSelect(city: IbgeCity) {
    setQuery(city.nome)
    setIsSelected(true)
    setIsOpen(false)
    onChange(city.nome)
  }

  const isDisabled = disabled || !state || loading

  return (
    <div ref={containerRef} className="relative">
      <div className="relative flex items-center">
        {loading
          ? <Loader2 className="absolute left-3 size-3.5 text-muted-foreground animate-spin pointer-events-none" />
          : <Search className="absolute left-3 size-3.5 text-muted-foreground pointer-events-none" />
        }
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setIsSelected(false); setIsOpen(true) }}
          onFocus={() => { if (!isSelected && cities.length > 0) setIsOpen(true) }}
          placeholder={!state ? "Selecione o estado primeiro" : loading ? "Carregando..." : "Buscar cidade..."}
          disabled={isDisabled}
          autoComplete="off"
          className={cn(
            "flex h-8 w-full rounded-md border border-input bg-background pl-9 pr-8 py-1 text-sm shadow-sm transition-colors",
            "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            "disabled:cursor-not-allowed disabled:opacity-50",
            isSelected && !isDisabled && "border-primary/60",
          )}
        />
        {isSelected && !isDisabled && (
          <button type="button" onClick={() => { setQuery(""); setIsSelected(false); onChange(""); inputRef.current?.focus() }}
            className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors">
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {isOpen && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-52 overflow-auto rounded-md border border-border bg-popover shadow-lg">
          {filtered.slice(0, 80).map((city) => (
            <button key={city.id} type="button" onClick={() => handleSelect(city)}
              className={cn(
                "flex w-full items-center px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground transition-colors",
                city.nome === value && "font-medium text-primary bg-primary/5",
              )}>
              {city.nome}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
