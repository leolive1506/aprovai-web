import { APIProvider, useMapsLibrary } from "@vis.gl/react-google-maps"
import { cn } from "@/lib/utils"
import { Loader2, MapPin, Search, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import type { NavigationCity } from "@/contexts/navigation-city-context"

const API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY as string

interface Props {
  onSelect: (result: NavigationCity) => void
  placeholder?: string
  autoFocus?: boolean
}

function CitySearchInner({ onSelect, placeholder, autoFocus }: Props) {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<google.maps.places.PlacePrediction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const placesLib = useMapsLibrary("places")

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus()
  }, [autoFocus])

  useEffect(() => {
    clearTimeout(debounceRef.current)
    if (query.length < 2) {
      setSuggestions([])
      setIsOpen(false)
      return
    }
    debounceRef.current = setTimeout(async () => {
      if (!placesLib) return
      setIsLoading(true)
      try {
        const { suggestions: results } =
          await placesLib.AutocompleteSuggestion.fetchAutocompleteSuggestions({
            input: query,
            includedRegionCodes: ["br"],
            includedPrimaryTypes: ["locality", "administrative_area_level_2"],
          })
        const predictions = results
          .map((s) => s.placePrediction)
          .filter((p): p is google.maps.places.PlacePrediction => p !== null)
        setSuggestions(predictions)
        setIsOpen(predictions.length > 0)
      } catch {
        setSuggestions([])
        setIsOpen(false)
      } finally {
        setIsLoading(false)
      }
    }, 350)
  }, [query, placesLib])

  useEffect(() => {
    return () => clearTimeout(blurTimeoutRef.current)
  }, [])

  function handleInputBlur() {
    blurTimeoutRef.current = setTimeout(() => setIsOpen(false), 150)
  }

  async function handleSelect(prediction: google.maps.places.PlacePrediction) {
    clearTimeout(blurTimeoutRef.current)
    setIsOpen(false)
    setSuggestions([])
    setQuery("")
    try {
      const place = prediction.toPlace()
      await place.fetchFields({ fields: ["displayName", "addressComponents"] })
      const components = place.addressComponents ?? []
      const get = (type: string, short = false) =>
        components.find((c) => c.types.includes(type))?.[short ? "shortText" : "longText"] ?? ""

      const city =
        get("administrative_area_level_2") ||
        get("locality") ||
        place.displayName ||
        prediction.text.text

      const state = get("administrative_area_level_1", true)
      onSelect({ city, state, label: `${city}, ${state}` })
    } catch {
      setQuery("")
    }
  }

  function handleClear() {
    setQuery("")
    setSuggestions([])
    setIsOpen(false)
    inputRef.current?.focus()
  }

  return (
    <div className="relative">
      <div className="relative flex items-center">
        <Search className="absolute left-3 size-3.5 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onBlur={handleInputBlur}
          placeholder={placeholder ?? "Buscar cidade..."}
          autoComplete="off"
          className={cn(
            "flex h-8 w-full rounded-lg border border-input bg-background pl-8 pr-8 py-1 text-sm shadow-sm transition-colors",
            "placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          )}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 size-3.5 animate-spin text-muted-foreground pointer-events-none" />
        )}
        {query && !isLoading && (
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleClear}
            className="absolute right-2.5 rounded-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-56 overflow-auto rounded-xl border border-border bg-popover text-popover-foreground shadow-lg">
          {suggestions.map((prediction) => (
            <button
              key={prediction.placeId}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                handleSelect(prediction)
              }}
              className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm hover:bg-accent hover:text-accent-foreground transition-colors first:rounded-t-xl last:rounded-b-xl"
            >
              <MapPin className="size-3.5 shrink-0 text-primary" />
              <span className="line-clamp-1 leading-snug">{prediction.text.text}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function CitySearchInput(props: Props) {
  return (
    <APIProvider apiKey={API_KEY} language="pt-BR" region="BR">
      <CitySearchInner {...props} />
    </APIProvider>
  )
}
