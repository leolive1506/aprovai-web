import { useState, useCallback } from "react"
import Cropper from "react-easy-crop"
import type { Area, Point } from "react-easy-crop"
import { ZoomIn, ZoomOut, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

const BANNER_ASPECT = 3
const OUTPUT_W = 1200
const OUTPUT_H = 400

async function cropToFile(imageSrc: string, pixelCrop: Area): Promise<File> {
  const response = await fetch(imageSrc)
  const blob = await response.blob()
  const bitmap = await createImageBitmap(blob)

  const canvas = document.createElement("canvas")
  canvas.width = OUTPUT_W
  canvas.height = OUTPUT_H
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas context unavailable")

  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = "high"
  ctx.drawImage(
    bitmap,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    OUTPUT_W,
    OUTPUT_H,
  )
  bitmap.close()

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (!result) { reject(new Error("Empty canvas")); return }
        resolve(new File([result], "banner.png", { type: "image/png" }))
      },
      "image/png",
    )
  })
}

interface BannerCropDialogProps {
  open: boolean
  imageSrc: string | null
  onConfirm: (file: File, previewUrl: string) => void
  onCancel: () => void
}

export function BannerCropDialog({ open, imageSrc, onConfirm, onCancel }: BannerCropDialogProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels)
  }, [])

  const handleConfirm = async () => {
    if (!imageSrc || !croppedAreaPixels) return
    setIsProcessing(true)
    try {
      const file = await cropToFile(imageSrc, croppedAreaPixels)
      const previewUrl = URL.createObjectURL(file)
      onConfirm(file, previewUrl)
    } finally {
      setIsProcessing(false)
    }
  }

  function handleOpenChange(next: boolean) {
    if (!next && !isProcessing) onCancel()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-4 border-b border-border shrink-0">
          <DialogTitle className="text-base">Ajustar banner</DialogTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Arraste para reposicionar · Scroll ou slider para zoom
          </p>
        </DialogHeader>

        <div className="px-5 pt-4 pb-2 space-y-4">
          <div
            className="relative w-full rounded-xl overflow-hidden bg-zinc-950"
            style={{ height: 224 }}
          >
            {imageSrc && (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                minZoom={1}
                maxZoom={4}
                aspect={BANNER_ASPECT}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                showGrid={false}
                style={{
                  cropAreaStyle: { color: "rgba(0,0,0,0.6)", border: "2px solid rgba(255,255,255,0.75)" },
                }}
              />
            )}
          </div>

          <div className="flex items-center gap-3 px-1">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(1, +(z - 0.1).toFixed(2)))}
              className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              <ZoomOut className="size-4" />
            </button>
            <input
              type="range"
              min={1}
              max={4}
              step={0.02}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 h-1.5 appearance-none rounded-full bg-muted cursor-pointer accent-primary"
            />
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(4, +(z + 0.1).toFixed(2)))}
              className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              <ZoomIn className="size-4" />
            </button>
            <span className="text-xs tabular-nums text-muted-foreground w-8 text-right shrink-0">
              {zoom.toFixed(1)}×
            </span>
          </div>

          <p className="text-2xs text-muted-foreground text-center pb-2">
            Saída: 1200 × 400 px · PNG · Sem perda de qualidade
          </p>
        </div>

        <DialogFooter className="px-5 py-4 border-t border-border">
          <Button variant="outline" size="sm" onClick={onCancel} disabled={isProcessing}>
            Cancelar
          </Button>
          <Button size="sm" onClick={handleConfirm} disabled={isProcessing || !croppedAreaPixels}>
            {isProcessing && <Loader2 className="size-3.5 animate-spin" />}
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
