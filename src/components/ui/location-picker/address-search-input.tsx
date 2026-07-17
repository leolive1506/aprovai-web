import { cn } from '@/lib/utils'
import { useMapsLibrary } from '@vis.gl/react-google-maps'
import { Loader2, MapPin, Search, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

export interface GooglePlaceResult {
  placeId: string
  displayName: string
  lat: number
  lng: number
  zipcode?: string
  neighborhood?: string
  city?: string
  state?: string
}

interface AddressSearchInputProps {
  value: string
  onSelect: (result: GooglePlaceResult) => void
  onClear: () => void
  disabled?: boolean
  hasError?: boolean
}

export function AddressSearchInput({
  value,
  onSelect,
  onClear,
  disabled,
  hasError,
}: AddressSearchInputProps) {
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
    if (query.length < 3) {
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
            includedPrimaryTypes: ['street_address', 'route'],
          })
        const placePredictions = results
          .map((s) => s.placePrediction)
          .filter((p): p is google.maps.places.PlacePrediction => p !== null)
        setSuggestions(placePredictions)
        setIsOpen(placePredictions.length > 0)
      } catch {
        setSuggestions([])
        setIsOpen(false)
      } finally {
        setIsLoading(false)
      }
    }, 400)
  }, [query, isSelected, placesLib])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSelect = async (prediction: google.maps.places.PlacePrediction) => {
    setQuery(prediction.text.text)
    setIsSelected(true)
    setIsOpen(false)
    setSuggestions([])

    try {
      const place = prediction.toPlace()
      await place.fetchFields({ fields: ['location', 'formattedAddress', 'addressComponents'] })
      if (place.location) {
        const components = place.addressComponents ?? []
        const get = (type: string, useShort = false) =>
          components.find((c) => c.types.includes(type))?.[useShort ? 'shortText' : 'longText'] ?? undefined

        onSelect({
          placeId: prediction.placeId,
          displayName: place.formattedAddress ?? prediction.text.text,
          lat: place.location.lat(),
          lng: place.location.lng(),
          zipcode: get('postal_code'),
          neighborhood: get('sublocality_level_1') ?? get('sublocality') ?? get('neighborhood'),
          city: get('administrative_area_level_2') ?? get('locality'),
          state: get('administrative_area_level_1', true),
        })
      }
    } catch {
    }
  }

  const handleClear = () => {
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
          }}
          disabled={disabled}
          placeholder="Buscar endereço..."
          autoComplete="off"
          className={cn(
            'flex h-9 w-full rounded-md border bg-transparent pl-9 pr-9 py-1 text-sm shadow-sm transition-colors',
            'placeholder:text-muted-foreground',
            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
            'disabled:cursor-not-allowed disabled:opacity-50',
            hasError ? 'border-destructive focus-visible:ring-destructive/30' : 'border-input',
            isSelected && !hasError && 'border-primary/60',
          )}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 size-4 animate-spin text-muted-foreground pointer-events-none" />
        )}
        {isSelected && !isLoading && !disabled && (
          <button
            type="button"
            disabled={disabled}
            onClick={handleClear}
            className="absolute right-3 rounded-sm text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Limpar endereço"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-1000 mt-1 max-h-64 overflow-auto rounded-md border border-border bg-popover text-popover-foreground shadow-lg">
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
