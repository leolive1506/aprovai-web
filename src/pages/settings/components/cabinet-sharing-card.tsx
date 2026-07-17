import { FEATURES } from "@/api/plans/features"
import { FeatureGate } from "@/components/feature-gate"
import { useRef, useState } from "react"
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react"
import { QrCode, Code2, Copy, Check, Download, Loader2 } from "lucide-react"
import { useGetCabinets } from "@/api/cabinets/hooks"
import { Label } from "@/components/ui/label"
import { Field, FieldGroup } from "@/components/ui/field"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function CabinetSharingCard() {
  const { data: cabinets, isLoading } = useGetCabinets()
  const cabinet = cabinets?.[0]

  const [copied, setCopied] = useState(false)
  const downloadCanvasRef = useRef<HTMLCanvasElement>(null)

  const publicUrl = typeof window !== "undefined"
    ? `${window.location.origin}/${cabinet?.slug}`
    : `https://gabineteapp.com.br/${cabinet?.slug}`

  const widgetCode = cabinet
    ? `<script src="${import.meta.env.VITE_API_URL}/cabinets/${cabinet.slug}/widget.js"></script>`
    : ""

  const copyWidget = () => {
    navigator.clipboard.writeText(widgetCode).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const downloadQrCode = () => {
    const canvas = downloadCanvasRef.current
    if (!canvas || !cabinet) return
    const link = document.createElement("a")
    link.href = canvas.toDataURL("image/png")
    link.download = `qrcode-${cabinet.slug}.png`
    link.click()
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-20">
          <Loader2 className="size-5 text-muted-foreground/30 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  if (!cabinet) return null

  return (
    <Card className="animate-in fade-in duration-300">
      <CardHeader className="border-b border-border/60 px-5">
        <CardTitle className="text-sm font-semibold text-foreground">
          Divulgação do perfil
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          QR Code e widget para divulgar o perfil público do seu gabinete.
        </CardDescription>
      </CardHeader>

      <CardContent className="px-5 space-y-8">
        <FieldGroup>
          <div className="flex items-center gap-2 mb-3">
            <QrCode className="size-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">QR Code do perfil</span>
          </div>
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="p-3 bg-white rounded-xl border border-border shadow-sm shrink-0">
              <QRCodeSVG
                value={publicUrl}
                size={128}
                fgColor={cabinet.accentColor ?? "#0058F3"}
                bgColor="#ffffff"
                level="M"
              />
              <QRCodeCanvas
                ref={downloadCanvasRef}
                value={publicUrl}
                size={1024}
                fgColor={cabinet.accentColor ?? "#0058F3"}
                bgColor="#ffffff"
                level="M"
                className="hidden"
              />
            </div>
            <div className="flex flex-col gap-2 pt-1">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Imprima em panfletos, banners e cartões. Ao escanear, o cidadão é direcionado
                direto ao perfil do seu gabinete para registrar uma demanda.
              </p>
              <Field>
                <Label className="text-xs">URL do perfil público</Label>
                <div className="flex items-center h-9 rounded-md border border-border bg-muted/30 px-3 text-sm text-muted-foreground font-mono truncate">
                  {publicUrl}
                </div>
              </Field>
              <button
                type="button"
                onClick={downloadQrCode}
                className="flex items-center gap-1.5 w-fit text-xs font-medium bg-background border border-border rounded-md px-2.5 py-1.5 hover:bg-muted transition-colors"
              >
                <Download className="size-3" />
                Baixar QR Code
              </button>
            </div>
          </div>
        </FieldGroup>

        <FeatureGate feature={FEATURES.WIDGET} upgradePrompt upgradeClassName="mt-2">
          <FieldGroup>
            <div className="flex items-center gap-2 mb-3">
              <Code2 className="size-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">Widget para seu site</span>
            </div>
            <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
              Cole este código no site oficial. Um botão flutuante aparecerá para que os cidadãos
              enviem demandas diretamente.
            </p>
            <div className="relative">
              <pre className="bg-muted/50 border border-border rounded-lg px-4 py-3 text-xs font-mono text-foreground/80 overflow-x-auto whitespace-pre-wrap break-all">
                {widgetCode}
              </pre>
              <button
                type="button"
                onClick={copyWidget}
                className="absolute top-2 right-2 flex items-center gap-1.5 text-xs font-medium bg-background border border-border rounded-md px-2.5 py-1 hover:bg-muted transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="size-3 text-emerald-500" />
                    <span className="text-emerald-600">Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-3" />
                    Copiar
                  </>
                )}
              </button>
            </div>
          </FieldGroup>
        </FeatureGate>
      </CardContent>
    </Card>
  )
}
