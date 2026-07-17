import { AdvancedMarker, Map, useMap } from '@vis.gl/react-google-maps'
import { useEffect, useRef } from 'react'

const BRAZIL_CENTER = { lat: -14.235, lng: -51.9253 }
const DEFAULT_ZOOM = 4
const SELECTED_ZOOM = 15

function MapController({ position }: { position: google.maps.LatLngLiteral | null }) {
  const map = useMap()
  const prevPosition = useRef<google.maps.LatLngLiteral | null>(null)

  useEffect(() => {
    if (!map || !position) return
    if (prevPosition.current) {
      map.panTo(position)
      map.setZoom(SELECTED_ZOOM)
    } else {
      map.setCenter(position)
      map.setZoom(SELECTED_ZOOM)
    }
    prevPosition.current = position
  }, [map, position])

  return null
}

interface LocationPickerMapProps {
  position: [number, number] | null
  onPositionChange: (lat: number, lng: number) => void
  isReverseGeocoding?: boolean
  disabled?: boolean
}

export function LocationPickerMap({
  position,
  onPositionChange,
  isReverseGeocoding,
  disabled,
}: LocationPickerMapProps) {
  const latLng = position ? { lat: position[0], lng: position[1] } : null

  return (
    <div className="relative overflow-hidden rounded-md border border-border h-70">
      <Map
        mapId="DEMO_MAP_ID"
        defaultCenter={BRAZIL_CENTER}
        defaultZoom={DEFAULT_ZOOM}
        streetViewControl={false}
        mapTypeControl={false}
        fullscreenControl={false}
        gestureHandling={disabled ? 'none' : 'cooperative'}
        disableDefaultUI={false}
        onClick={(e) => {
          if (disabled) return
          if (e.detail.latLng) {
            onPositionChange(e.detail.latLng.lat, e.detail.latLng.lng)
          }
        }}
        style={{ height: '100%', width: '100%' }}
      >
        <MapController position={latLng} />

        {latLng && (
          <AdvancedMarker
            position={latLng}
            draggable={!disabled}
            onDragEnd={(e) => {
              if (disabled) return
              if (e.latLng) onPositionChange(e.latLng.lat(), e.latLng.lng())
            }}
          />
        )}
      </Map>

      {disabled && <div className="absolute inset-0 cursor-not-allowed" />}

      {!position && (
        <div className="pointer-events-none absolute inset-0 flex items-end justify-center pb-4">
          <p className="rounded-full bg-background/90 backdrop-blur-sm px-4 py-1.5 text-xs text-muted-foreground shadow-sm border border-border">
            Busque um endereço acima ou clique no mapa
          </p>
        </div>
      )}

      {isReverseGeocoding && (
        <div className="pointer-events-none absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full bg-background/90 backdrop-blur-sm px-3 py-1.5 text-xs text-muted-foreground shadow-sm border border-border">
          <span className="inline-block size-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Identificando endereço...
        </div>
      )}

      {position && (
        <div className="pointer-events-none absolute bottom-4 left-4 rounded-full bg-background/90 backdrop-blur-sm px-3 py-1.5 text-xs text-muted-foreground shadow-sm border border-border font-mono">
          {position[0].toFixed(5)}, {position[1].toFixed(5)}
        </div>
      )}
    </div>
  )
}
