import { CategoriesApi } from "@/api/categories";
import {
  useCreateDemand,
  useGeneratePresignedUploadUrl,
  useUploadToR2,
  useConfirmEvidenceUpload,
} from "@/api/demands/hooks";
import { queryClient } from "@/api/queryClient";
import { AsyncSelectForm } from "@/components/form/async-select-form";
import { ImageDropzoneForm } from "@/components/form/image-dropzone-form";
import { InputForm } from "@/components/form/input-form";
import { TextareaForm } from "@/components/form/textarea-form";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { LocationPickerField } from "@/components/ui/location-picker/location-picker-field";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet';
import { useAuth } from "@/hooks/use-auth";
import { demandSchema, type DemandFormData } from "@/validation-schemas/demand";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, PlusIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface DemandFormProps {
  sizeTrigger: "default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg" | null | undefined;
}

export function DemandsForm({ sizeTrigger }: DemandFormProps) {
  const [openSheet, setOpenSheet] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const { isAuthenticated, cabinet } = useAuth();

  const form = useForm<DemandFormData>({
    resolver: zodResolver(demandSchema),
    defaultValues: {
      title: "",
      description: "",
      location: undefined,
      categoryId: undefined,
    },
  });

  const { handleSubmit, control, reset } = form;

  const { mutateAsync: createDemand } = useCreateDemand();
  const { mutateAsync: generatePresignedUrl } = useGeneratePresignedUploadUrl();
  const { mutateAsync: uploadToR2 } = useUploadToR2();
  const { mutateAsync: confirmEvidence } = useConfirmEvidenceUpload();

  const fetchCategoryOptions = useCallback(
    async ({ page }: { page: number }) => {
      const result = await CategoriesApi.getCategories({ page, limit: 10 });
      return {
        options: result.items.map((option) => ({
          value: option.id,
          label: option.name,
        })),
        hasNextPage: page < result.meta.totalPages,
      };
    },
    [],
  );

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
        priority: data.priority as import("@/api/demands/types").DemandPriority | undefined,
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
      setOpenSheet(false);
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

  const toggleOpenChange = (next?: boolean) => {
    if (isUploading) return;
    setOpenSheet(prev => next !== undefined ? next : !prev);
  };

  useEffect(() => {
    reset();
  }, [openSheet, reset])

  const isFormSubmitting = isUploading;

  return (
    <Sheet open={openSheet} onOpenChange={toggleOpenChange}>
      <SheetTrigger asChild>
        <Button size={sizeTrigger} variant="default" className={sizeTrigger?.includes('icon') ? "rounded-full" : ""}>
          <PlusIcon className="size-4" />
          {sizeTrigger !== "icon" && <span className="hidden sm:inline">Nova Demanda</span>}
          {sizeTrigger !== "icon" && <span className="sm:hidden">Nova</span>}
        </Button>
      </SheetTrigger>

      <SheetContent
        className="min-w-2xl"
        onInteractOutside={(e) => { if (isUploading) e.preventDefault(); }}
        onEscapeKeyDown={(e) => { if (isUploading) e.preventDefault(); }}
      >
        {isUploading && (
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center z-50 rounded-lg">
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
        <SheetHeader className="border-b">
          <SheetTitle>Nova demanda</SheetTitle>
        </SheetHeader>
        <form onSubmit={onSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <FieldGroup className="flex-1 min-h-0 overflow-y-auto px-4">
            {!isAuthenticated && (
              <Field>
                <FieldLabel>Seu e-mail</FieldLabel>
                <InputForm
                  name="guestEmail"
                  control={control}
                  disabled={isFormSubmitting}
                  placeholder="Digite seu e-mail"
                  type="email"
                />
              </Field>
            )}

            <Field>
              <FieldLabel>Título</FieldLabel>
              <InputForm
                name="title"
                control={control}
                disabled={isFormSubmitting}
                placeholder="Digite aqui o título da sua demanda"
              />
            </Field>

            <Field>
              <FieldLabel>Descrição</FieldLabel>
              <TextareaForm
                name="description"
                control={control}
                disabled={isFormSubmitting}
                placeholder="Digita aqui a sua descrição"
              />
            </Field>

            <Field>
              <FieldLabel>Categoria</FieldLabel>
              <AsyncSelectForm
                name="categoryId"
                control={control}
                disabled={isFormSubmitting}
                fetchOptions={fetchCategoryOptions}
                placeholder="Selecione uma categoria"
              />
            </Field>

            <Field>
              <FieldLabel>Localização</FieldLabel>
              <LocationPickerField
                name="location"
                control={control}
                disabled={isFormSubmitting}
              />
            </Field>

            <Field>
              <FieldLabel>Evidências</FieldLabel>
              <ImageDropzoneForm name="files" control={control} />
            </Field>
          </FieldGroup>

          <SheetFooter>
            <SheetClose asChild>
              <Button variant="outline" disabled={isUploading}>Cancelar</Button>
            </SheetClose>
            <Button type="submit" disabled={isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Criar demanda"
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
