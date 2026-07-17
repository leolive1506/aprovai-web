import { useState } from "react"
import { Info, Loader2, MapPin, Navigation, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CitySelect } from "@/components/ui/city-select"
import { useAddUserNeighborhood } from "@/api/neighborhood/hooks"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { NeighborhoodSearchInput } from "@/components/ui/location-picker/neighborhood-search-input"
import type { NeighborhoodResult } from "@/components/ui/location-picker/neighborhood-search-input"

const BRAZIL_STATES = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA",
  "MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN",
  "RS","RO","RR","SC","SP","SE","TO",
]

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]
const QUICK_LABELS = ["Casa", "Trabalho", "Outro"]

function normalizeStr(s: string) {
  return s.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
}

async function reverseGeocodeCity(lat: number, lng: number): Promise<{ city: string; state: string }> {
  const key = import.meta.env.VITE_GOOGLE_PLACES_API_KEY
  const res = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${key}&language=pt-BR`,
  )
  const data = await res.json()
  if (data.status !== "OK" || !data.results?.length) return { city: "", state: "" }

  let city = ""
  let state = ""
  for (const result of data.results) {
    for (const comp of result.address_components as Array<{ long_name: string; short_name: string; types: string[] }>) {
      if (!city && (comp.types.includes("administrative_area_level_2") || comp.types.includes("locality")))
        city = comp.long_name
      if (!state && comp.types.includes("administrative_area_level_1"))
        state = comp.short_name
    }
    if (city && state) break
  }
  return { city, state }
}

interface NeighborhoodSetupProps {
  onSuccess?: () => void
}

export function NeighborhoodSetup({ onSuccess }: NeighborhoodSetupProps) {
  const [step, setStep] = useState<"choose" | "detecting" | "form">("choose")
  const [locationBias, setLocationBias] = useState<{ lat: number; lng: number } | undefined>()
  const [gpsDetected, setGpsDetected] = useState(false)
  const [gpsError, setGpsError] = useState<string | null>(null)
  const [cityAdjusted, setCityAdjusted] = useState<string | null>(null)

  const [neighborhood, setNeighborhood] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [label, setLabel] = useState("")
  const [customLabel, setCustomLabel] = useState("")

  const { mutateAsync: addNeighborhood, isPending } = useAddUserNeighborhood()

  const effectiveLabel = label === "Outro" ? customLabel : label

  function resetForm() {
    setNeighborhood(""); setCity(""); setState(""); setLabel(""); setCustomLabel("")
    setLocationBias(undefined); setGpsDetected(false); setGpsError(null); setCityAdjusted(null)
  }

  function handleNeighborhoodSelect(result: NeighborhoodResult) {
    setNeighborhood(result.neighborhood)
    if (result.city) {
      const wasAdjusted = !!city && normalizeStr(result.city) !== normalizeStr(city)
      setCity(result.city)
      setCityAdjusted(wasAdjusted ? result.city : null)
    }
    if (result.state) setState(result.state)
  }

  async function handleDetectGPS() {
    setGpsError(null)
    setStep("detecting")
    if (!navigator.geolocation) {
      setGpsError("Geolocalização não suportada neste navegador.")
      setStep("form")
      return
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        try {
          const { city: c, state: s } = await reverseGeocodeCity(lat, lng)
          setLocationBias({ lat, lng }); setCity(c); setState(s); setGpsDetected(true)
        } catch {
          setLocationBias({ lat, lng })
        }
        setStep("form")
      },
      () => { setGpsError("Permissão negada. Busque manualmente."); setStep("form") },
      { timeout: 10000, enableHighAccuracy: false, maximumAge: 60000 },
    )
  }

  async function handleConfirm() {
    if (!neighborhood.trim() || !city.trim() || !state.trim()) return
    await addNeighborhood({
      neighborhood: neighborhood.trim(), city: city.trim(), state: state.trim(),
      label: effectiveLabel.trim() || undefined, isPrimary: true,
    })
    onSuccess?.()
  }

  const showCityFields = !gpsDetected || !city

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <AnimatePresence mode="wait">

        {step === "choose" && (
          <motion.div
            key="choose"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="w-full max-w-sm flex flex-col items-center text-center gap-8"
          >
            <div className="relative">
              <div className="size-20 rounded-3xl bg-primary/10 flex items-center justify-center">
                <MapPin className="size-9 text-primary" />
              </div>
              <div
                className="absolute inset-0 rounded-3xl border-2 border-primary/15 animate-ping pointer-events-none"
                style={{ animationDuration: "2.5s" }}
              />
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Seu bairro</h2>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-[260px]">
                Veja o que está acontecendo perto de você — demandas, gabinetes e resoluções na sua região.
              </p>
            </div>

            <div className="w-full flex flex-col gap-3">
              <Button className="w-full h-11 gap-2.5 text-sm font-medium" onClick={handleDetectGPS}>
                <Navigation className="size-4" />
                Detectar minha localização
              </Button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">ou</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <Button variant="outline" className="w-full h-11 gap-2.5 text-sm" onClick={() => setStep("form")}>
                <Search className="size-4" />
                Buscar manualmente
              </Button>
            </div>
          </motion.div>
        )}

        {step === "detecting" && (
          <motion.div
            key="detecting"
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="relative size-20 flex items-center justify-center">
              <div
                className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping"
                style={{ animationDuration: "1.6s" }}
              />
              <div
                className="absolute inset-3 rounded-full border border-primary/30 animate-ping"
                style={{ animationDuration: "1.6s", animationDelay: "0.4s" }}
              />
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center relative z-10">
                <MapPin className="size-6 text-primary" />
              </div>
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-semibold text-foreground">Localizando você...</p>
              <p className="text-xs text-muted-foreground">Aguarde alguns segundos</p>
            </div>
          </motion.div>
        )}

        {step === "form" && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="w-full max-w-sm"
          >
            <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
              <div className="px-5 pt-5 pb-4 border-b border-border/60">
                <div className="flex items-center gap-2.5">
                  <div className="size-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="size-3.5 text-primary" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {gpsDetected ? "Confirme seu bairro" : "Adicionar bairro"}
                  </span>
                  {gpsDetected && (
                    <span className="ml-auto inline-flex items-center gap-1 text-2xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-full px-2 py-0.5">
                      <Navigation className="size-2.5" />
                      GPS
                    </span>
                  )}
                </div>
                {gpsDetected && city && (
                  <p className="text-xs text-muted-foreground mt-1.5 pl-9.5">
                    {city} · {state}
                  </p>
                )}
              </div>

              <div className="p-5 space-y-4">
                <AnimatePresence>
                  {gpsError && (
                    <motion.p
                      key="gps-error"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2"
                    >
                      {gpsError}
                    </motion.p>
                  )}
                </AnimatePresence>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Bairro</Label>
                  <NeighborhoodSearchInput
                    value={neighborhood}
                    locationBias={locationBias}
                    onSelect={handleNeighborhoodSelect}
                    onValueChange={setNeighborhood}
                    onClear={() => { setNeighborhood(""); setCityAdjusted(null) }}
                    placeholder="Buscar bairro no Maps..."
                  />
                </div>

                <AnimatePresence>
                  {cityAdjusted && (
                    <motion.div
                      key="adjusted"
                      initial={{ opacity: 0, y: -6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.98 }}
                      transition={{ duration: 0.25, ease: EASE }}
                      className="flex items-start gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2.5"
                    >
                      <Info className="size-3.5 text-primary shrink-0 mt-0.5" />
                      <p className="text-2xs text-muted-foreground leading-relaxed">
                        Cidade ajustada para{" "}
                        <span className="font-semibold text-foreground">{cityAdjusted}</span>, de acordo com o bairro selecionado.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {showCityFields && (
                    <motion.div
                      key="city-fields"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="grid grid-cols-3 gap-2.5"
                    >
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Estado</Label>
                        <select
                          value={state}
                          onChange={(e) => { setState(e.target.value); setCity(""); setCityAdjusted(null) }}
                          className={cn(
                            "flex h-8 w-full rounded-md border border-input bg-background px-2",
                            "text-sm ring-offset-background focus-visible:outline-none",
                            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                          )}
                        >
                          <option value="">UF</option>
                          {BRAZIL_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div className="col-span-2 space-y-1.5">
                        <Label className="text-xs font-semibold">Cidade</Label>
                        <CitySelect
                          state={state}
                          value={city}
                          onChange={(c) => { setCity(c); setCityAdjusted(null) }}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold">
                    Apelido <span className="font-normal text-muted-foreground">(opcional)</span>
                  </Label>
                  <div className="flex gap-1.5 flex-wrap">
                    {QUICK_LABELS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => { setLabel(label === opt ? "" : opt); if (opt !== "Outro") setCustomLabel("") }}
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-medium border transition-all duration-150",
                          label === opt
                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                            : "bg-transparent text-muted-foreground border-border hover:border-primary/40 hover:text-foreground",
                        )}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                  <AnimatePresence>
                    {label === "Outro" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.18 }}
                      >
                        <Input
                          placeholder="Ex: Faculdade, Academia..."
                          value={customLabel}
                          onChange={(e) => setCustomLabel(e.target.value)}
                          maxLength={30}
                          className="mt-1.5"
                          autoFocus
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="px-5 pb-5 pt-1 flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-muted-foreground hover:text-foreground"
                  onClick={() => { resetForm(); setStep("choose") }}
                >
                  <X className="size-3.5" />
                  Voltar
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleConfirm}
                  disabled={isPending || !neighborhood.trim() || !city.trim() || !state.trim()}
                >
                  {isPending && <Loader2 className="size-3.5 animate-spin mr-1" />}
                  Salvar bairro
                </Button>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
