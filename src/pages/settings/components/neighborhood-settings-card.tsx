import { useState } from "react"
import { Info, MapPin, Plus, Star, Trash2, Loader2, Navigation, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CitySelect } from "@/components/ui/city-select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  useListUserNeighborhoods, useAddUserNeighborhood,
  useRemoveUserNeighborhood, useSetPrimaryNeighborhood,
} from "@/api/neighborhood/hooks"
import { cn } from "@/lib/utils"
import { NeighborhoodSearchInput } from "@/components/ui/location-picker/neighborhood-search-input"
import type { NeighborhoodResult } from "@/components/ui/location-picker/neighborhood-search-input"
import { motion, AnimatePresence } from "framer-motion"

const BRAZIL_STATES = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA",
  "MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN",
  "RS","RO","RR","SC","SP","SE","TO",
]

const QUICK_LABELS = ["Casa", "Trabalho", "Outro"]
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

function normalizeStr(s: string) {
  return s.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
}

async function reverseGeocodeCity(lat: number, lng: number) {
  const key = import.meta.env.VITE_GOOGLE_PLACES_API_KEY
  const res = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${key}&language=pt-BR`,
  )
  const data = await res.json()
  if (data.status !== "OK" || !data.results?.length) return { city: "", state: "" }
  let city = ""; let state = ""
  for (const result of data.results) {
    for (const comp of result.address_components as Array<{ long_name: string; short_name: string; types: string[] }>) {
      if (!city && (comp.types.includes("administrative_area_level_2") || comp.types.includes("locality"))) city = comp.long_name
      if (!state && comp.types.includes("administrative_area_level_1")) state = comp.short_name
    }
    if (city && state) break
  }
  return { city, state }
}

const EMPTY_FORM = { neighborhood: "", city: "", state: "", label: "", customLabel: "" }

export function NeighborhoodSettingsCard() {
  const [open, setOpen] = useState(false)
  const [detecting, setDetecting] = useState(false)
  const [gpsDetected, setGpsDetected] = useState(false)
  const [gpsError, setGpsError] = useState<string | null>(null)
  const [locationBias, setLocationBias] = useState<{ lat: number; lng: number } | undefined>()
  const [cityAdjusted, setCityAdjusted] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)

  const { data: neighborhoods = [], isLoading } = useListUserNeighborhoods()
  const { mutateAsync: addNeighborhood, isPending: isAdding } = useAddUserNeighborhood()
  const { mutate: removeNeighborhood } = useRemoveUserNeighborhood()
  const { mutate: setPrimary } = useSetPrimaryNeighborhood()

  function closeDialog() {
    setOpen(false)
    setGpsError(null); setLocationBias(undefined); setGpsDetected(false)
    setCityAdjusted(null); setForm(EMPTY_FORM)
  }

  function handleNeighborhoodSelect(result: NeighborhoodResult) {
    const wasAdjusted = !!form.city && !!result.city && normalizeStr(result.city) !== normalizeStr(form.city)
    setCityAdjusted(wasAdjusted ? result.city : null)
    setForm((f) => ({
      ...f,
      neighborhood: result.neighborhood,
      city: result.city || f.city,
      state: result.state || f.state,
    }))
  }

  async function handleDetect() {
    if (!navigator.geolocation) { setGpsError("Geolocalização não suportada."); return }
    setDetecting(true); setGpsError(null)
    try {
      await new Promise<void>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const { latitude: lat, longitude: lng } = pos.coords
            try {
              const { city, state } = await reverseGeocodeCity(lat, lng)
              setLocationBias({ lat, lng }); setGpsDetected(true)
              setForm((f) => ({ ...f, city, state })); resolve()
            } catch { setLocationBias({ lat, lng }); resolve() }
          },
          (err) => reject(err),
          { timeout: 10000, enableHighAccuracy: false, maximumAge: 60000 },
        )
      })
    } catch (err: unknown) {
      const msg =
        err instanceof GeolocationPositionError && err.code === GeolocationPositionError.PERMISSION_DENIED
          ? "Permissão negada. Preencha manualmente."
          : err instanceof GeolocationPositionError && err.code === GeolocationPositionError.TIMEOUT
            ? "Tempo esgotado. Verifique o GPS do dispositivo."
            : "Não foi possível detectar a localização."
      setGpsError(msg)
    } finally { setDetecting(false) }
  }

  async function handleAdd() {
    const { neighborhood, city, state, label, customLabel } = form
    if (!neighborhood.trim() || !city.trim() || !state.trim()) return
    const effectiveLabel = label === "Outro" ? customLabel : label
    await addNeighborhood({
      neighborhood: neighborhood.trim(), city: city.trim(), state: state.trim(),
      label: effectiveLabel.trim() || undefined,
    })
    closeDialog()
  }

  const showCityFields = !gpsDetected || !form.city

  return (
    <>
      <Card className="animate-in fade-in duration-300">
        <CardHeader className="border-b border-border/60 px-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <MapPin className="size-4 stroke-[1.5] text-muted-foreground" />
              <CardTitle className="text-sm font-semibold text-foreground">Meus Bairros</CardTitle>
            </div>
            {neighborhoods.length < 3 && (
              <Button size="sm" variant="outline" className="gap-1.5 h-7 text-xs" onClick={() => setOpen(true)}>
                <Plus className="size-3" />
                Adicionar
              </Button>
            )}
          </div>
          <CardDescription className="text-sm text-muted-foreground">
            Salve até 3 bairros para acompanhar demandas na sua região.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-5">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            </div>
          ) : neighborhoods.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center gap-2.5">
              <div className="size-10 rounded-full bg-muted flex items-center justify-center">
                <MapPin className="size-4 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">Nenhum bairro salvo ainda.</p>
              <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setOpen(true)}>
                <Plus className="size-3.5" />
                Adicionar bairro
              </Button>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-border/40">
              {neighborhoods.map((n) => (
                <div key={n.id} className="flex items-center gap-3 py-3 group">
                  <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="size-3.5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold text-foreground truncate">{n.neighborhood}</p>
                      {n.label && (
                        <span className="text-2xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md shrink-0">
                          {n.label}
                        </span>
                      )}
                      {n.isPrimary && <Star className="size-3 text-amber-400 fill-amber-400 shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground">{n.city} · {n.state}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!n.isPrimary && (
                      <Button variant="ghost" size="icon-sm" onClick={() => setPrimary(n.id)}
                        title="Definir como principal" className="text-muted-foreground hover:text-amber-500">
                        <Star className="size-3.5" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon-sm" onClick={() => removeNeighborhood(n.id)}
                      className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
              {neighborhoods.length < 3 && (
                <div className="pt-3">
                  <button
                    onClick={() => setOpen(true)}
                    className={cn(
                      "flex items-center gap-2 w-full px-3 py-2.5 rounded-lg border border-dashed border-border",
                      "text-sm text-muted-foreground hover:text-foreground hover:border-border/80 hover:bg-muted/30",
                      "transition-colors",
                    )}
                  >
                    <Plus className="size-3.5 shrink-0" />
                    Adicionar outro bairro ({neighborhoods.length}/3)
                  </button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={(v) => { if (!v) closeDialog(); else setOpen(true) }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <MapPin className="size-4 text-primary" />
              Adicionar bairro
              {gpsDetected && (
                <span className="ml-auto inline-flex items-center gap-1 text-2xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-full px-2 py-0.5">
                  <Navigation className="size-2.5" />
                  GPS
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-1">
            <Button
              variant="outline" size="sm" className="w-full gap-2"
              onClick={handleDetect} disabled={detecting}
            >
              {detecting ? <Loader2 className="size-3.5 animate-spin" /> : <Navigation className="size-3.5" />}
              {detecting ? "Detectando..." : gpsDetected ? "Detectar novamente" : "Detectar localização"}
            </Button>

            <AnimatePresence>
              {gpsError && (
                <motion.p
                  key="gps-err"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-xs text-destructive"
                >
                  {gpsError}
                </motion.p>
              )}
            </AnimatePresence>

            {gpsDetected && form.city && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: EASE }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800"
              >
                <Navigation className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                  {form.city} · {form.state}
                </p>
              </motion.div>
            )}

            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Bairro</Label>
                <NeighborhoodSearchInput
                  value={form.neighborhood}
                  locationBias={locationBias}
                  onSelect={handleNeighborhoodSelect}
                  onValueChange={(v) => setForm((f) => ({ ...f, neighborhood: v }))}
                  onClear={() => { setForm((f) => ({ ...f, neighborhood: "" })); setCityAdjusted(null) }}
                  placeholder="Buscar bairro no Maps..."
                />
              </div>

              <AnimatePresence>
                {cityAdjusted && (
                  <motion.div
                    key="adjusted"
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.22, ease: EASE }}
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
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-3 gap-2"
                  >
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Estado</Label>
                      <select
                        value={form.state}
                        onChange={(e) => { setForm((f) => ({ ...f, state: e.target.value, city: "" })); setCityAdjusted(null) }}
                        className={cn(
                          "flex h-8 w-full rounded-md border border-input bg-background px-2",
                          "text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        )}
                      >
                        <option value="">UF</option>
                        {BRAZIL_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="col-span-2 space-y-1.5">
                      <Label className="text-xs font-semibold">Cidade</Label>
                      <CitySelect
                        state={form.state}
                        value={form.city}
                        onChange={(c) => { setForm((f) => ({ ...f, city: c })); setCityAdjusted(null) }}
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
                      key={opt} type="button"
                      onClick={() => {
                        setForm((f) => ({ ...f, label: f.label === opt ? "" : opt, customLabel: "" }))
                      }}
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium border transition-all duration-150",
                        form.label === opt
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-transparent text-muted-foreground border-border hover:border-primary/40 hover:text-foreground",
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                <AnimatePresence>
                  {form.label === "Outro" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.18 }}
                    >
                      <Input
                        placeholder="Ex: Faculdade, Academia..."
                        value={form.customLabel}
                        onChange={(e) => setForm((f) => ({ ...f, customLabel: e.target.value }))}
                        maxLength={30}
                        className="mt-1.5"
                        autoFocus
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={closeDialog}>
              <X className="size-3.5" />
              Cancelar
            </Button>
            <Button
              size="sm" onClick={handleAdd}
              disabled={isAdding || !form.neighborhood.trim() || !form.city.trim() || !form.state.trim()}
            >
              {isAdding && <Loader2 className="size-3.5 animate-spin mr-1" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
