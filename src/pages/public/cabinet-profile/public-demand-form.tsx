import { useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import {
  useCreateDemand,
  useGeneratePresignedUploadUrl,
  useUploadToR2,
  useConfirmEvidenceUpload,
} from "@/api/demands/hooks"
import { queryClient } from "@/api/queryClient"
import type { Cabinet } from "@/api/cabinets/types"
import { DemandForm } from "@/components/forms/demand"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { defaultDemandValues, demandSchema, type DemandFormData } from "@/validation-schemas/demand"
import type { DemandPriority } from "@/api/demands/types"

interface PublicDemandFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cabinet: Cabinet
  accent: string
}

export function PublicDemandForm({ open, onOpenChange, cabinet, accent }: PublicDemandFormProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 })

  const form = useForm<DemandFormData>({
    resolver: zodResolver(demandSchema),
    defaultValues: defaultDemandValues,
  })

  const { mutateAsync: createDemand, isPending: isPendingCreate } = useCreateDemand()
  const { mutateAsync: generatePresignedUrl, isPending: isPendingPresigned } = useGeneratePresignedUploadUrl()
  const { mutateAsync: uploadToR2, isPending: isPendingUpload } = useUploadToR2()
  const { mutateAsync: confirmEvidence, isPending: isPendingConfirm } = useConfirmEvidenceUpload()

  const handleOpenChange = (next: boolean) => {
    if (isUploading) return
    if (!next) form.reset()
    onOpenChange(next)
  }

  const onSubmit = form.handleSubmit(async (data: DemandFormData) => {
    try {
      setIsUploading(true)

      const demand = await createDemand({
        title: data.title,
        description: data.description,
        categoryId: data.categoryId,
        priority: data.priority as DemandPriority | undefined,
        address: data.location?.address,
        zipcode: data.location?.zipcode,
        lat: data.location ? parseFloat(data.location.latitude) : undefined,
        long: data.location ? parseFloat(data.location.longitude) : undefined,
        neighborhood: data.location?.neighborhood,
        city: data.location?.city,
        state: data.location?.state,
        guestEmail: data.guestEmail || undefined,
        guestPhone: data.guestPhone || undefined,
        cabinetId: cabinet.id,
      })

      if (data.files?.length) {
        setUploadProgress({ current: 0, total: data.files.length })
        for (let i = 0; i < data.files.length; i++) {
          const file = data.files[i]
          try {
            const { uploadUrl, storageKey } = await generatePresignedUrl({ demandId: demand.id, filename: file.name })
            await uploadToR2({ uploadUrl, file })
            await confirmEvidence({ demandId: demand.id, storageKey, size: file.size })
            setUploadProgress({ current: i + 1, total: data.files.length })
          } catch {
            toast.error(`Falha ao enviar ${file.name}`)
          }
        }
      }

      await queryClient.invalidateQueries({ queryKey: ["demands"] })
      await queryClient.invalidateQueries({ queryKey: ["demands-infinite"] })

      toast.success(
        cabinet.postDemandMessage ?? "Demanda registrada com sucesso!",
        { duration: 6000 },
      )

      handleOpenChange(false)
    } catch {
      toast.error("Erro ao registrar demanda. Tente novamente.")
    } finally {
      setIsUploading(false)
      setUploadProgress({ current: 0, total: 0 })
    }
  })

  const isBusy = isUploading || isPendingCreate || isPendingPresigned || isPendingUpload || isPendingConfirm

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="min-w-1/3 bg-white"
        onInteractOutside={(e) => { if (isUploading) e.preventDefault() }}
        onEscapeKeyDown={(e) => { if (isUploading) e.preventDefault() }}
      >
        {isUploading && (
          <div className="fixed inset-0 bg-black/50 flex flex-col items-center justify-center z-50 rounded-lg">
            <Loader2 className="h-12 w-12 animate-spin text-white mb-4" />
            <p className="text-white font-semibold mb-2">Enviando arquivos...</p>
            <p className="text-white/80 text-sm">
              {uploadProgress.current} de {uploadProgress.total}
            </p>
            <div className="w-48 h-2 bg-white/20 rounded-full mt-4 overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-300"
                style={{
                  width: uploadProgress.total
                    ? `${(uploadProgress.current / uploadProgress.total) * 100}%`
                    : "0%",
                }}
              />
            </div>
          </div>
        )}

        <DialogHeader>
          <DialogTitle>Nova demanda</DialogTitle>
        </DialogHeader>

        <FormProvider {...form}>
          <form onSubmit={onSubmit}>
            <div className="max-h-[60vh] no-scrollbar overflow-y-auto pb-4 p-1">
              <DemandForm isRequesting={isBusy} />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                disabled={isUploading}
                onClick={() => handleOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isBusy}
                style={{ backgroundColor: accent, borderColor: accent }}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Registrar demanda"
                )}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
