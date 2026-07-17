import {
  useCreateDemand,
  useGeneratePresignedUploadUrl,
  useUploadToR2,
  useConfirmEvidenceUpload,
} from "@/api/demands/hooks";
import { queryClient } from "@/api/queryClient";
import { DemandForm } from "@/components/forms/demand";
import { UserAvatar } from "@/components/user-avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { defaultDemandValues, demandSchema, type DemandFormData } from "@/validation-schemas/demand";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export function DialogDemandForm() {
  const { isAuthenticated, user, cabinet } = useAuth()
  const [open, setOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 })

  const form = useForm({
    resolver: zodResolver(demandSchema),
    defaultValues: defaultDemandValues,
  })

  const { mutateAsync: createDemand, isPending: isPendingCreateDemand } = useCreateDemand();
  const { mutateAsync: generatePresignedUrl, isPending: isPendingPresignedUrl } =
    useGeneratePresignedUploadUrl();
  const { mutateAsync: uploadToR2, isPending: isPendingUpload } = useUploadToR2();
  const { mutateAsync: confirmEvidence, isPending: isPendingConfirm } =
    useConfirmEvidenceUpload();

  const { handleSubmit, reset } = form

  const onOpenChangeDialog = (next?: boolean) => {
    if (isUploading) return;
    setOpen(prev => next !== undefined ? next : !prev);
  }

  const onSubmit = handleSubmit(async (data: DemandFormData) => {
    if (!isAuthenticated && !data.guestEmail) {
      form.setError("guestEmail", { message: "Digite seu e-mail para continuar" });
      return;
    }

    try {
      setIsUploading(true);
      const demand = await createDemand({
        title: data.title,
        description: data.description,
        categoryId: data.categoryId,
        address: data.location?.address,
        zipcode: data.location?.zipcode,
        lat: data.location ? parseFloat(data.location.latitude) : undefined,
        long: data.location ? parseFloat(data.location.longitude) : undefined,
        neighborhood: data.location?.neighborhood,
        city: data.location?.city,
        state: data.location?.state,
        guestEmail: !isAuthenticated ? data.guestEmail : undefined,
        cabinetId: isAuthenticated && cabinet ? cabinet.id : undefined,
      });

      if (data.files?.length) {
        setUploadProgress({ current: 0, total: data.files.length });
        for (let i = 0; i < data.files.length; i++) {
          const file = data.files[i];
          try {
            const { uploadUrl, storageKey } = await generatePresignedUrl({
              demandId: demand.id,
              filename: file.name,
            });

            await uploadToR2({ uploadUrl, file });

            await confirmEvidence({
              demandId: demand.id,
              storageKey,
              size: file.size,
            });

            setUploadProgress({ current: i + 1, total: data.files.length });
          } catch (fileError: any) {
            console.error(`Erro ao fazer upload do arquivo ${file.name}:`, fileError);
            if (fileError?.status === 403) {
              toast.error(fileError.message ?? "Limite de armazenamento atingido. Entre em contato com um Consultor para fazer upgrade.");
              break;
            }
            toast.error(`Falha ao enviar ${file.name}`);
          }
        }
      }

      await queryClient.invalidateQueries({ queryKey: ["demands"] });
      await queryClient.invalidateQueries({ queryKey: ["demands-infinite"] });
      toast.success("Demanda criada com sucesso!");
      onOpenChangeDialog()
      form.reset();
    } catch (error: any) {
      console.error(error)
      if (error?.status === 403) {
        toast.error(error.message ?? "Limite do plano atingido. Entre em contato com um Consultor para fazer upgrade.")
      } else {
        toast.error("Erro ao criar demanda. Tente novamente.")
      }
    } finally {
      setIsUploading(false);
      setUploadProgress({ current: 0, total: 0 });
    }
  });

  useEffect(() => {
    reset()
  }, [open, reset])

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-4">

      {isAuthenticated && user ? (
        <Link to={`/profile/${user.id}`} className="shrink-0">
          <UserAvatar size="lg" name={user.name} avatarUrl={user.avatarUrl} />
        </Link>
      ) : (
        <UserAvatar size="lg" />
      )}

      <Dialog open={open} onOpenChange={onOpenChangeDialog}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="lg"
            className="h-10 flex-1 justify-start rounded-xl bg-card px-4 font-normal text-muted-foreground hover:text-foreground"
          >
            Registrar nova demanda
          </Button>
        </DialogTrigger>
        <DialogContent
          className="min-w-1/3 bg-white"
          onInteractOutside={(e) => { if (isUploading) e.preventDefault(); }}
          onEscapeKeyDown={(e) => { if (isUploading) e.preventDefault(); }}
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
            <DialogTitle>Criar demanda</DialogTitle>
          </DialogHeader>
          <FormProvider {...form}>
            <form onSubmit={onSubmit}>
              <div className="max-h-[60vh] no-scrollbar overflow-y-auto pb-4 p-1">
                <DemandForm isRequesting={isPendingCreateDemand || isPendingPresignedUrl || isPendingUpload || isPendingConfirm || isUploading} />
              </div>
              <DialogFooter>
                <Button type="button" variant="secondary" disabled={isUploading}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isUploading || isPendingCreateDemand || isPendingPresignedUrl || isPendingUpload || isPendingConfirm}>
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Criar demanda"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </FormProvider>
        </DialogContent>
      </Dialog>
    </div >
  )
}
