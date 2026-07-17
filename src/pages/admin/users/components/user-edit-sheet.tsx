import { AdminApi } from "@/api/admin"
import { useAdminUpdateUser } from "@/api/admin/hooks"
import { UserRole } from "@/api/users/types"
import { ImageDropzoneForm } from "@/components/form/image-dropzone-form"
import { InputForm } from "@/components/form/input-form"
import { SelectForm } from "@/components/form/select-form"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { getApiErrorMessage } from "@/lib/utils"
import { adminUserUpdateSchema, type AdminUserUpdateFormData } from "@/validation-schemas/admin-user"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, PencilIcon } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

export function UserEditSheet({ userId }: { userId: string }) {
  const [openSheet, setOpenSheet] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(null)

  const { mutateAsync: updateUser, isPending } = useAdminUpdateUser()

  const form = useForm<AdminUserUpdateFormData>({
    resolver: zodResolver(adminUserUpdateSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: UserRole.CITIZEN,
      avatar: [],
    },
  })

  const { handleSubmit, control, reset } = form

  useEffect(() => {
    if (!openSheet) return

    let cancelled = false
    setIsLoading(true)

    AdminApi.getUserDetails(userId)
      .then((data: Awaited<ReturnType<typeof AdminApi.getUserDetails>>) => {
        if (cancelled) return
        reset({
          name: data.name ?? "",
          email: data.email ?? "",
          password: "",
          role: (data.role as AdminUserUpdateFormData["role"]) ?? UserRole.CITIZEN,
          avatar: [],
        })
        setCurrentAvatarUrl(data.avatarUrl ?? null)
      })
      .catch((error: unknown) => {
        toast.error(getApiErrorMessage(error, "Erro ao carregar usuário."))
        setOpenSheet(false)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [openSheet, reset, userId])

  const onSubmit = handleSubmit(async (data) => {
    try {
      const avatarFile = data.avatar?.[0]
      let avatarUrl: string | undefined

      if (avatarFile) {
        setIsUploadingAvatar(true)
        const presign = await AdminApi.presignUserAvatarUpload({
          filename: avatarFile.name,
          mimetype: avatarFile.type || "image/jpeg",
        })
        await AdminApi.uploadToR2(presign.uploadUrl, avatarFile)
        avatarUrl = presign.avatarUrl
      }

      await updateUser({
        id: userId,
        data: {
          name: data.name.trim(),
          email: data.email.trim(),
          password: data.password.trim() || undefined,
          role: data.role,
          avatarUrl,
        },
      })

      setOpenSheet(false)
      reset()
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Erro ao atualizar usuário."))
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
          aria-label="Editar usuário"
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
          <SheetTitle>Editar usuário</SheetTitle>
        </SheetHeader>

        <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <FieldGroup className="flex-1 min-h-0 overflow-y-auto px-4">
            <Field>
              <FieldLabel>Nome</FieldLabel>
              <InputForm
                name="name"
                control={control}
                disabled={isFormSubmitting}
                placeholder="Digite o nome"
              />
            </Field>

            <Field>
              <FieldLabel>E-mail</FieldLabel>
              <InputForm
                name="email"
                control={control}
                disabled={isFormSubmitting}
                type="email"
                placeholder="Digite o e-mail"
              />
            </Field>

            <Field>
              <FieldLabel>Senha</FieldLabel>
              <InputForm
                name="password"
                control={control}
                disabled={isFormSubmitting}
                type="password"
                placeholder="Digite a nova senha (opcional)"
              />
            </Field>

            <Field>
              <FieldLabel>Role</FieldLabel>
              <SelectForm
                name="role"
                control={control}
                disabled={isFormSubmitting}
                placeholder="Selecione a role"
                options={[
                  { label: "Cidadão", value: UserRole.CITIZEN },
                  { label: "Membro", value: UserRole.MEMBER },
                  { label: "Admin", value: UserRole.ADMIN },
                ]}
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
