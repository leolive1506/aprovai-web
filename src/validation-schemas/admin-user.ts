import z from "zod"
import { UserRole } from "@/api/users/types"

const fileSchema = z.custom<File>((v) => v instanceof File, {
  message: "Arquivo inválido.",
})

export const adminUserCreateSchema = z.object({
  name: z.string().min(2, { message: "Informe o nome." }),
  email: z.string().email({ message: "Digite um e-mail válido." }),
  password: z.string().min(8, { message: "Insira uma senha com no mínimo 8 caracteres." }),
  role: z.nativeEnum(UserRole),
  avatar: z.array(fileSchema).max(1, "Selecione apenas 1 imagem.").optional(),
})

export type AdminUserCreateFormData = z.infer<typeof adminUserCreateSchema>

export const adminUserUpdateSchema = z.object({
  name: z.string().min(2, { message: "Informe o nome." }),
  email: z.string().email({ message: "Digite um e-mail válido." }),
  password: z
    .string()
    .refine((v) => !v || v.length >= 8, {
      message: "Insira uma senha com no mínimo 8 caracteres.",
    }),
  role: z.nativeEnum(UserRole),
  avatar: z.array(fileSchema).max(1, "Selecione apenas 1 imagem.").optional(),
})

export type AdminUserUpdateFormData = z.infer<typeof adminUserUpdateSchema>
