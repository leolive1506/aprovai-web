import { useDeleteResult } from "@/api/results/hooks"
import type { Result, ResultImage, ResultType } from "@/api/results/types"
import { cn } from "@/lib/utils"
import { formatDateToNow } from "@/utils/date"
import { FileText, Trash2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

const LABELS: Record<ResultType, string> = {
  INFRASTRUCTURE: "Infraestrutura",
  SOCIAL: "Social",
  LEGISLATIVE: "Legislativo",
  OTHER: "Outro",
}

const TYPE_DOT: Record<ResultType, string> = {
  INFRASTRUCTURE: "bg-blue-500",
  SOCIAL: "bg-emerald-500",
  LEGISLATIVE: "bg-purple-500",
  OTHER: "bg-muted-foreground/40",
}

const TYPE_BORDER: Record<ResultType, string> = {
  INFRASTRUCTURE: "border-l-blue-400",
  SOCIAL: "border-l-emerald-400",
  LEGISLATIVE: "border-l-purple-400",
  OTHER: "border-l-border",
}

interface ResultEntryProps {
  result: Result
  index: number
  canDelete?: boolean
}

export function ResultEntry({ result, index, canDelete }: ResultEntryProps) {
  const { mutate: deleteResult, isPending: isDeleting } = useDeleteResult(result.demandId)
  const [confirming, setConfirming] = useState(false)
  const imageCount = result.images?.length ?? 0

  function handleDelete() {
    deleteResult(result.id, {
      onError: () => toast.error("Erro ao excluir resultado"),
    })
  }

  return (
    <article
      className={cn(
        "rounded-lg border border-border border-l-2 bg-card overflow-hidden animate-fade-slide-in",
        TYPE_BORDER[result.type],
      )}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="px-4 pt-4 pb-3.5">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-1.5">
            <span className={cn("size-1.5 rounded-full shrink-0", TYPE_DOT[result.type])} />
            <span className="text-xs font-medium text-muted-foreground">{LABELS[result.type]}</span>
          </div>

          {canDelete ? (
            confirming ? (
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setConfirming(false)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-xs text-destructive font-medium hover:text-destructive/70 transition-colors disabled:opacity-50"
                >
                  {isDeleting ? "Excluindo..." : "Excluir"}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <time className="text-xs text-muted-foreground shrink-0">
                  {formatDateToNow(result.createdAt)}
                </time>
                <button
                  onClick={() => setConfirming(true)}
                  className="text-muted-foreground/30 hover:text-destructive transition-colors"
                  title="Excluir resultado"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            )
          ) : (
            <time className="text-xs text-muted-foreground shrink-0">
              {formatDateToNow(result.createdAt)}
            </time>
          )}
        </div>

        <h3 className="text-sm font-semibold text-foreground leading-snug">{result.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mt-1.5">{result.description}</p>
      </div>

      {imageCount > 0 && <ResultImageMosaic images={result.images} />}

      {result.protocolFileUrl && (
        <div className="px-4 py-2.5 border-t border-border/50">
          <a
            href={result.protocolFileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
          >
            <FileText className="size-3.5" />
            {result.protocolFileName ?? "Protocolo oficial"}
          </a>
        </div>
      )}
    </article>
  )
}

function ResultImageMosaic({ images }: { images: ResultImage[] }) {
  const count = images.length
  const MAX_VISIBLE = 4
  const shown = images.slice(0, MAX_VISIBLE)
  const overflow = count - MAX_VISIBLE

  if (count === 1) {
    return <ImageSlot img={shown[0]} className="aspect-video" />
  }

  if (count === 2) {
    return (
      <div className="grid grid-cols-2 gap-0.5">
        {shown.map((img) => (
          <ImageSlot key={img.id} img={img} className="aspect-square" />
        ))}
      </div>
    )
  }

  if (count === 3) {
    return (
      <div className="grid grid-cols-2 gap-0.5">
        <ImageSlot img={shown[0]} className="row-span-2" />
        <ImageSlot img={shown[1]} className="aspect-square" />
        <ImageSlot img={shown[2]} className="aspect-square" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-0.5">
      {shown.map((img, i) => {
        const isLast = i === MAX_VISIBLE - 1 && overflow > 0
        return (
          <div key={img.id} className="relative aspect-square overflow-hidden">
            <a href={img.url} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
              <img
                src={img.url}
                alt=""
                className={cn(
                  "w-full h-full object-cover transition-opacity duration-150",
                  isLast ? "opacity-40" : "hover:opacity-90",
                )}
              />
            </a>
            {isLast && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-foreground text-lg font-semibold">+{overflow + 1}</span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function ImageSlot({ img, className }: { img: ResultImage; className?: string }) {
  return (
    <a
      href={img.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("block overflow-hidden bg-muted", className)}
    >
      <img
        src={img.url}
        alt=""
        className="w-full h-full object-cover hover:opacity-90 transition-opacity duration-150"
      />
    </a>
  )
}
