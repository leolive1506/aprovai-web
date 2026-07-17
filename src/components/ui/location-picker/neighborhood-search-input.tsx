import { APIProvider, useMapsLibrary } from '@vis.gl/react-google-maps'
import { cn } from '@/lib/utils'
import { Loader2, MapPin, Search, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY as string

export interface NeighborhoodResult {
  neighborhood: string
  city: string
  state: string
}

interface Props {
  value: string
  onSelect: (result: NeighborhoodResult) => void
  onClear: () => void
  onValueChange?: (value: string) => void
  locationBias?: { lat: number; lng: number }
  placeholder?: string
}

function NeighborhoodSearchInner({ value, onSelect, onClear, onValueChange, locationBias, placeholder }: Props) {
  const [query, setQuery] = useState(value)
  const [suggestions, setSuggestions] = useState<google.maps.places.PlacePrediction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isSelected, setIsSelected] = useState(!!value)

  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const placesLib = useMapsLibrary('places')

  useEffect(() => {
    if (value && value !== query) {
      setQuery(value)
      setIsSelected(true)
    }
  }, [value])

  useEffect(() => {
    if (isSelected) return
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
            includedRegionCodes: ['br'],
            includedPrimaryTypes: ['neighborhood', 'sublocality'],
            ...(locationBias && { locationBias }),
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
  }, [query, isSelected, placesLib, locationBias])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  async function handleSelect(prediction: google.maps.places.PlacePrediction) {
    setIsSelected(true)
    setIsOpen(false)
    setSuggestions([])

    const fallbackName = prediction.text.text.split(',')[0].trim()

    try {
      const place = prediction.toPlace()
      await place.fetchFields({ fields: ['displayName', 'addressComponents'] })
      const components = place.addressComponents ?? []
      const get = (type: string, short = false) =>
        components.find((c) => c.types.includes(type))?.[short ? 'shortText' : 'longText'] ?? ''

      const neighborhood =
        get('neighborhood') ||
        get('sublocality_level_1') ||
        get('sublocality') ||
        fallbackName

      const city = get('administrative_area_level_2') || get('locality')
      const state = get('administrative_area_level_1', true)

      setQuery(neighborhood)
      onSelect({ neighborhood, city, state })
    } catch {
      setQuery(fallbackName)
      onSelect({ neighborhood: fallbackName, city: '', state: '' })
    }
  }

  function handleClear() {
    setQuery('')
    setIsSelected(false)
    setSuggestions([])
    setIsOpen(false)
    onClear()
    inputRef.current?.focus()
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative flex items-center">
        <Search className="absolute left-3 size-4 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            if (isSelected) setIsSelected(false)
            onValueChange?.(e.target.value)
          }}
          placeholder={placeholder ?? 'Buscar bairro no Maps...'}
          autoComplete="off"
          className={cn(
            'flex h-9 w-full rounded-md border border-input bg-background pl-9 pr-9 py-1 text-sm shadow-sm transition-colors',
            'placeholder:text-muted-foreground',
            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
            isSelected && 'border-primary/60',
          )}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 size-4 animate-spin text-muted-foreground pointer-events-none" />
        )}
        {isSelected && !isLoading && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 rounded-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-56 overflow-auto rounded-md border border-border bg-popover text-popover-foreground shadow-lg">
          {suggestions.map((prediction) => (
            <button
              key={prediction.placeId}
              type="button"
              onClick={() => handleSelect(prediction)}
              className="flex w-full items-start gap-2.5 px-3 py-2.5 text-left text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
              <span className="line-clamp-2 leading-snug">{prediction.text.text}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function NeighborhoodSearchInput(props: Props) {
  return (
    <APIProvider apiKey={API_KEY} language="pt-BR" region="BR">
      <NeighborhoodSearchInner {...props} />
    </APIProvider>
  )
}
