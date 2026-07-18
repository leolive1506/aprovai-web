import { AdminApi } from "@/api/admin"
import { useAdminUpdateCabinet } from "@/api/admin/hooks"
import { UsersApi } from "@/api/users"
import { UserRole } from "@/api/users/types"
import { AsyncSelectForm } from "@/components/form/async-select-form"
import { ImageDropzoneForm } from "@/components/form/image-dropzone-form"
import { InputForm } from "@/components/form/input-form"
import { TextareaForm } from "@/components/form/textarea-form"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { getApiErrorMessage } from "@/lib/utils"
import {
  createCompanyWithOwnerSchema,
  type CreateCompanyWithOwnerFormData,
} from "@/schemas/company"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, PencilIcon } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

export function CabinetEditSheet({ cabinetId }: { cabinetId: string }) {
  const [openSheet, setOpenSheet] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [ownerValueLabel, setOwnerValueLabel] = useState<string | undefined>(undefined)
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(null)

  const { mutateAsync: updateCabinet, isPending } = useAdminUpdateCabinet()

  const form = useForm<CreateCompanyWithOwnerFormData>({
    resolver: zodResolver(createCompanyWithOwnerSchema),
    defaultValues: {
      ownerUserId: "",
      name: "",
      email: "",
      description: "",
      avatar: [],
    },
  })

  const { handleSubmit, control, reset } = form

  const fetchUserOptions = useCallback(async ({ page }: { page: number }) => {
    const limit = 20
    const result = await UsersApi.list({ page, limit, role: UserRole.MEMBER })
    const options = result.items.map((user) => ({
      value: user.id,
      label: `${user.name} (${user.email})`,
    }))

    return {
      options,
      hasNextPage: page * limit < result.total,
    }
  }, [])

  useEffect(() => {
    if (!openSheet) return

    let cancelled = false
    setIsLoading(true)

    AdminApi.getCabinetDetails(cabinetId)
      .then((data) => {
        if (cancelled) return
        reset({
          ownerUserId: data.ownerUser?.id ?? "",
          name: data.cabinet.name ?? "",
          email: data.cabinet.email ?? "",
          description: data.cabinet.description ?? "",
          avatar: [],
        })
        setOwnerValueLabel(
          data.ownerUser ? `${data.ownerUser.name} (${data.ownerUser.email})` : undefined,
        )
        setCurrentAvatarUrl(data.cabinet.avatarUrl ?? null)
      })
      .catch((error) => {
        toast.error(getApiErrorMessage(error, "Erro ao carregar gabinete."))
        setOpenSheet(false)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [cabinetId, openSheet, reset])

  const onSubmit = handleSubmit(async (data) => {
    try {
      const avatarFile = data.avatar?.[0]
      let avatarUrl: string | undefined

      if (avatarFile) {
        setIsUploadingAvatar(true)
        const presign = await AdminApi.presignCabinetAvatarUpload({
          filename: avatarFile.name,
          mimetype: avatarFile.type || "image/jpeg",
        })
        await AdminApi.uploadToR2(presign.uploadUrl, avatarFile)
        avatarUrl = presign.avatarUrl
      }

      await updateCabinet({
        id: cabinetId,
        data: {
          ownerUserId: data.ownerUserId,
          name: data.name.trim(),
          email: data.email?.trim() || undefined,
          description: data.description?.trim() || undefined,
          avatarUrl,
        },
      })

      setOpenSheet(false)
      reset()
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Erro ao atualizar gabinete."))
    } finally {
      setIsUploadingAvatar(false)
    }
  })

  const isFormSubmitting = isPending || isUploadingAvatar || isLoading

  const toggleOpenChange = useCallback(
    (next?: boolean) => {
      if (isFormSubmitting) return
      setOpenSheet((prev) => (next !== undefined ? next : !prev))
    },
    [isFormSubmitting],
  )

  return (
    <Sheet open={openSheet} onOpenChange={toggleOpenChange}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 text-muted-foreground hover:text-foreground"
          aria-label="Editar gabinete"
        >
          <PencilIcon className="size-4" />
        </Button>
      </SheetTrigger>

      <SheetContent
        className="min-w-2xl"
        onInteractOutside={(e) => {
          if (isFormSubmitting) e.preventDefault()
        }}
        onEscapeKeyDown={(e) => {
          if (isFormSubmitting) e.preventDefault()
        }}
      >
        <SheetHeader className="border-b">
          <SheetTitle>Editar gabinete</SheetTitle>
        </SheetHeader>

        <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <FieldGroup className="flex-1 min-h-0 overflow-y-auto px-4">
            <FieldSeparator>Responsável</FieldSeparator>

            <Field>
              <FieldLabel>Responsável</FieldLabel>
              <AsyncSelectForm
                name="ownerUserId"
                control={control}
                disabled={isFormSubmitting}
                placeholder="Selecione um usuário..."
                fetchOptions={fetchUserOptions}
                valueLabel={ownerValueLabel}
              />
            </Field>

            <FieldSeparator>Gabinete</FieldSeparator>

            <Field>
              <FieldLabel>Nome</FieldLabel>
              <InputForm
                name="name"
                control={control}
                disabled={isFormSubmitting}
                placeholder="Digite o nome do gabinete"
              />
            </Field>

            <Field>
              <FieldLabel>E-mail</FieldLabel>
              <InputForm
                name="email"
                control={control}
                disabled={isFormSubmitting}
                type="email"
                placeholder="Digite o e-mail do gabinete (opcional)"
              />
            </Field>

            <Field>
              <FieldLabel>Descrição</FieldLabel>
              <TextareaForm
                name="description"
                control={control}
                disabled={isFormSubmitting}
                placeholder="Descreva o gabinete (opcional)"
              />
            </Field>

            <Field>
              <FieldLabel>Avatar</FieldLabel>
              {currentAvatarUrl ? (
                <div className="mb-2 flex items-center justify-center">
                  <img
                    src={currentAvatarUrl}
                    alt=""
                    className="size-20 rounded-full border border-border object-cover"
                  />
                </div>
              ) : null}
              <ImageDropzoneForm
                name="avatar"
                control={control}
                disabled={isFormSubmitting}
                maxFiles={1}
                maxSize={5 * 1024 * 1024}
              />
            </Field>
          </FieldGroup>

          <SheetFooter className="border-t">
            <Button
              type="button"
              variant="outline"
              disabled={isFormSubmitting}
              onClick={() => toggleOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isFormSubmitting}>
              {isFormSubmitting && <Loader2 className="size-4 animate-spin" />}
              Salvar
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

