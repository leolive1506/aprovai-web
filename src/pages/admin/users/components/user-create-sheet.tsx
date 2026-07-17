import { AdminApi } from "@/api/admin"
import { useAdminCreateUser } from "@/api/admin/hooks"
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
import { adminUserCreateSchema, type AdminUserCreateFormData } from "@/validation-schemas/admin-user"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, PlusIcon } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

export function UserCreateSheet() {
  const [openSheet, setOpenSheet] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const { mutateAsync: createUser, isPending } = useAdminCreateUser()

  const form = useForm<AdminUserCreateFormData>({
    resolver: zodResolver(adminUserCreateSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: UserRole.CITIZEN,
      avatar: [],
    },
  })

  const { handleSubmit, control, reset } = form

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

      await createUser({
        name: data.name.trim(),
        email: data.email.trim(),
        password: data.password,
        role: data.role,
        avatarUrl,
      })

      setOpenSheet(false)
      reset()
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Erro ao criar usuário."))
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
        <Button variant="default">
          <PlusIcon className="size-4" />
          Novo Usuário
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
          <SheetTitle>Novo usuário</SheetTitle>
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
                placeholder="Digite a senha"
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
              Criar usuário
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
