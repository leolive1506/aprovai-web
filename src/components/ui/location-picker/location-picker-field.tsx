import { APIProvider, useMapsLibrary } from '@vis.gl/react-google-maps'
import { AlertCircle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import {
  Controller,
  type Control,
  type FieldError,
  type FieldValues,
  type Path,
} from 'react-hook-form'
import { AddressSearchInput, type GooglePlaceResult } from './address-search-input'
import { LocationPickerMap } from './location-picker-map'

const API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY as string

export interface LocationPickerValue {
  address: string
  latitude: string
  longitude: string
  zipcode?: string
  neighborhood?: string
  city?: string
  state?: string
}


interface InnerProps {
  value: LocationPickerValue | undefined
  onChange: (value: LocationPickerValue | undefined) => void
  error?: FieldError
  disabled?: boolean
}

function buildAddress(base: string, number: string) {
  return number.trim() ? `${number.trim()}, ${base}` : base
}

function LocationPickerInner({ value, onChange, error, disabled }: InnerProps) {
  const [baseAddress, setBaseAddress] = useState(value?.address ?? '')
  const [houseNumber, setHouseNumber] = useState('')
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false)

  const geocodingLib = useMapsLibrary('geocoding')
  const geocoderRef = useRef<google.maps.Geocoder | null>(null)

  useEffect(() => {
    if (geocodingLib) geocoderRef.current = new geocodingLib.Geocoder()
  }, [geocodingLib])

  const position: [number, number] | null =
    value?.latitude && value?.longitude
      ? [parseFloat(value.latitude), parseFloat(value.longitude)]
      : null

  const handleAddressSelect = (result: GooglePlaceResult) => {
    setBaseAddress(result.displayName)
    onChange({
      address: buildAddress(result.displayName, houseNumber),
      latitude: String(result.lat),
      longitude: String(result.lng),
      zipcode: result.zipcode,
      neighborhood: result.neighborhood,
      city: result.city,
      state: result.state,
    })
  }

  const handlePositionChange = async (lat: number, lng: number) => {
    onChange({
      address: buildAddress(baseAddress, houseNumber),
      latitude: String(lat),
      longitude: String(lng),
    })

    if (!geocoderRef.current) return
    setIsReverseGeocoding(true)
    try {
      const { results } = await geocoderRef.current.geocode({ location: { lat, lng } })
      if (results[0]) {
        const addr = results[0].formatted_address
        const components = results[0].address_components
        const get = (type: string, useShort = false) =>
          components.find((c) => c.types.includes(type))?.[useShort ? 'short_name' : 'long_name'] ?? undefined

        setBaseAddress(addr)
        onChange({
          address: buildAddress(addr, houseNumber),
          latitude: String(lat),
          longitude: String(lng),
          zipcode: get('postal_code'),
          neighborhood: get('sublocality_level_1') ?? get('sublocality') ?? get('neighborhood'),
          city: get('administrative_area_level_2') ?? get('locality'),
          state: get('administrative_area_level_1', true),
        })
      }
    } catch {
    } finally {
      setIsReverseGeocoding(false)
    }
  }

  const handleClear = () => {
    setBaseAddress('')
    setHouseNumber('')
    onChange(undefined)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <div className="flex-1 min-w-0">
          <AddressSearchInput
            value={baseAddress}
            onSelect={handleAddressSelect}
            onClear={handleClear}
            disabled={disabled}
            hasError={!!error}
          />
        </div>
      </div>

      <LocationPickerMap
        position={position}
        onPositionChange={handlePositionChange}
        isReverseGeocoding={isReverseGeocoding}
        disabled={disabled}
      />

      {error && (
        <span className="flex items-center gap-1 text-xs text-destructive">
          <AlertCircle className="size-3 shrink-0" />
          {error.message}
        </span>
      )}
    </div>
  )
}

interface LocationPickerFieldProps<T extends FieldValues> {
  name: Path<T>
  control: Control<T>
  disabled?: boolean
}

export function LocationPickerField<T extends FieldValues>({
  name,
  control,
  disabled,
}: LocationPickerFieldProps<T>) {
  return (
    <APIProvider apiKey={API_KEY} language="pt-BR" region="BR">
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => (
          <LocationPickerInner
            value={field.value as LocationPickerValue | undefined}
            onChange={field.onChange}
            error={fieldState.error}
            disabled={disabled}
          />
        )}
      />
    </APIProvider>
  )
}
