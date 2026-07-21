import { AdminApi } from "@/api/admin"
import { useAdminCreateCabinetWithOwner } from "@/api/admin/hooks"
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
import { Loader2, PlusIcon } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

interface CabinetsFormProps {
  sizeTrigger:
    | "default"
    | "xs"
    | "sm"
    | "lg"
    | "icon"
    | "icon-xs"
    | "icon-sm"
    | "icon-lg"
    | null
    | undefined
}

export function CabinetsForm({ sizeTrigger }: CabinetsFormProps) {
  const [openSheet, setOpenSheet] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const { mutateAsync: createCabinetWithOwner, isPending } =
    useAdminCreateCabinetWithOwner()

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
    const result = await UsersApi.list({ page, limit, role: UserRole.COMPANY })
    const options = result.items.map((user) => ({
      value: user.id,
      label: `${user.name} (${user.email})`,
    }))

    return {
      options,
      hasNextPage: page * limit < result.total,
    }
  }, [])

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

      await createCabinetWithOwner({
        ownerUserId: data.ownerUserId,
        name: data.name.trim(),
        email: data.email?.trim() || undefined,
        description: data.description?.trim() || undefined,
        avatarUrl,
      })

      setOpenSheet(false)
      reset()
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Erro ao criar gabinete."))
    } finally {
      setIsUploadingAvatar(false)
    }
  })

  const isFormSubmitting = isPending || isUploadingAvatar

  const toggleOpenChange = useCallback(
    (next?: boolean) => {
      if (isFormSubmitting) return
      setOpenSheet((prev) => (next !== undefined ? next : !prev))
    },
    [isFormSubmitting],
  )

  useEffect(() => {
    if (!openSheet) return
    reset()
  }, [openSheet, reset])

  return (
    <Sheet open={openSheet} onOpenChange={toggleOpenChange}>
      <SheetTrigger asChild>
        <Button
          size={sizeTrigger}
          variant="default"
          className={sizeTrigger?.includes("icon") ? "rounded-full" : ""}
        >
          <PlusIcon className="size-4" />
          {sizeTrigger !== "icon" && "Novo Gabinete"}
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
          <SheetTitle>Novo gabinete</SheetTitle>
        </SheetHeader>

        <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <FieldGroup className="flex-1 min-h-0 overflow-y-auto px-4">
            <Field>
              <FieldLabel>Responsável</FieldLabel>
              <AsyncSelectForm
                name="ownerUserId"
                control={control}
                disabled={isFormSubmitting}
                placeholder="Selecione um usuário..."
                fetchOptions={fetchUserOptions}
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
              Criar gabinete
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

