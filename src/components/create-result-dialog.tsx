import { useCreateResult } from "@/api/results/hooks"
import type { Demand } from "@/api/demands/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAuth } from "@/hooks/use-auth"
import { cn, formatBytes, getApiErrorMessage } from "@/lib/utils"
import { FileTextIcon, ImageIcon, Loader2, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

const MAX_PROTOCOL_SIZE_MB = 20
const MAX_IMAGES = 10
const MAX_FILE_SIZE_MB = 10


interface CreateResultDialogProps {
  demand: Demand
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: () => void
}

export function CreateResultDialog({ demand, open, onOpenChange, onCreated }: CreateResultDialogProps) {
  const { cabinet } = useAuth()
  const { mutate, isPending } = useCreateResult()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const protocolInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [protocol, setProtocol] = useState<File | null>(null)

  useEffect(() => {
    if (open) {
      setTitle("")
      setDescription("")
      setImages([])
      setPreviews([])
      setProtocol(null)
    }
  }, [open])

  useEffect(() => {
    const urls = images.map((f) => URL.createObjectURL(f))
    setPreviews(urls)
    return () => { urls.forEach((u) => URL.revokeObjectURL(u)) }
  }, [images])

  function handleFiles(files: FileList | null) {
    if (!files) return
    const valid: File[] = []
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) {
        toast.error(`"${file.name}" não é uma imagem válida.`)
        continue
      }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        toast.error(`"${file.name}" excede ${MAX_FILE_SIZE_MB}MB.`)
        continue
      }
      valid.push(file)
    }
    setImages((prev) => {
      const next = [...prev, ...valid].slice(0, MAX_IMAGES)
      if (prev.length + valid.length > MAX_IMAGES) toast.error(`Máximo de ${MAX_IMAGES} fotos.`)
      return next
    })
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    handleFiles(e.dataTransfer.files)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!cabinet?.slug || !title.trim() || !description.trim()) return
    mutate(
      {
        title: title.trim(),
        description: description.trim(),
        type: "OTHER",
        cabinetSlug: cabinet.slug,
        demandId: demand.id,
        images: images.length > 0 ? images : undefined,
        protocol: protocol ?? undefined,
      },
      {
        onSuccess: () => {
          toast.success("Resultado registrado com sucesso")
          onOpenChange(false)
          onCreated?.()
        },
        onError: (err: unknown) => {
          toast.error(getApiErrorMessage(err, "Erro ao registrar resultado"))
        },
      },
    )
  }

  const canSubmit = !isPending && title.trim().length > 0 && description.trim().length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-5 pt-5 pb-4 border-b border-border shrink-0">
          <DialogTitle className="text-base font-semibold">Registrar resultado</DialogTitle>
          <div className="mt-1.5 rounded-lg bg-muted/50 border border-border/60 px-3 py-2">
            <p className="text-2xs font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">
              Demanda
            </p>
            <p className="text-sm font-medium text-foreground line-clamp-1">{demand.title}</p>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <form id="create-result-form" onSubmit={handleSubmit} className="px-5 py-4 flex flex-col gap-4">

            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">
                O que foi feito?
                <span className="text-destructive ml-0.5">*</span>
              </label>
              <Input
                placeholder="Ex: Calçada reparada na Rua XV"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={120}
                required
                autoFocus
              />
            </div>

            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">
                Descreva com mais detalhes
                <span className="text-destructive ml-0.5">*</span>
              </label>
              <Textarea
                placeholder="O que foi realizado, quem executou, quando ficou pronto..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={1000}
                rows={3}
                className="resize-none text-sm"
                required
              />
              {description.length > 800 && (
                <p className="text-xs text-muted-foreground text-right tabular-nums">
                  {description.length}/1000
                </p>
              )}
            </div>

            
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">
                  Fotos
                  <span className="ml-1 font-normal text-muted-foreground">(opcional)</span>
                </label>
                {images.length > 0 && (
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {images.length}/{MAX_IMAGES}
                  </span>
                )}
              </div>

              {images.length > 0 ? (
                <div className="grid grid-cols-4 gap-1.5">
                  {previews.map((src, i) => (
                    <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-border bg-muted">
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                        className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="size-4 text-white" />
                      </button>
                    </div>
                  ))}
                  {images.length < MAX_IMAGES && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square rounded-lg border border-dashed border-border bg-muted/40 flex items-center justify-center hover:bg-muted/60 transition-colors"
                    >
                      <ImageIcon className="size-4 text-muted-foreground" />
                    </button>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  className="flex items-center gap-3 rounded-lg border border-dashed border-border bg-muted/20 px-4 py-3 hover:bg-muted/40 transition-colors text-left"
                >
                  <div className="size-7 rounded-md bg-muted flex items-center justify-center shrink-0">
                    <ImageIcon className="size-3.5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Adicionar fotos</p>
                    <p className="text-xs text-muted-foreground">
                      Arraste ou clique · até {MAX_IMAGES} fotos · max {MAX_FILE_SIZE_MB}MB cada
                    </p>
                  </div>
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </div>

            
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-foreground">
                Documento oficial
                <span className="ml-1 font-normal text-muted-foreground">(opcional)</span>
              </label>

              {protocol ? (
                <div className="flex items-center gap-2.5 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5">
                  <div className="size-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                    <FileTextIcon className="size-3.5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{protocol.name}</p>
                    <p className="text-xs text-muted-foreground">{formatBytes(protocol.size)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setProtocol(null)}
                    className="shrink-0 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => protocolInputRef.current?.click()}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg border border-dashed border-border",
                    "px-3 py-2.5 hover:bg-muted/30 transition-colors text-left",
                  )}
                >
                  <div className="size-7 rounded-md bg-muted flex items-center justify-center shrink-0">
                    <FileTextIcon className="size-3.5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Anexar documento</p>
                    <p className="text-xs text-muted-foreground">
                      PDF, DOC ou imagem · max {MAX_PROTOCOL_SIZE_MB}MB
                    </p>
                  </div>
                </button>
              )}

              <input
                ref={protocolInputRef}
                type="file"
                accept=".pdf,.doc,.docx,image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  if (file.size > MAX_PROTOCOL_SIZE_MB * 1024 * 1024) {
                    toast.error(`Arquivo muito grande. Máximo ${MAX_PROTOCOL_SIZE_MB}MB.`)
                    return
                  }
                  setProtocol(file)
                  e.target.value = ""
                }}
              />
            </div>
          </form>
        </div>

        <div className="px-5 py-4 border-t border-border shrink-0">
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" form="create-result-form" disabled={!canSubmit}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Registrar resultado
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
