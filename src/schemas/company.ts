import z from "zod"

const fileSchema = z.custom<File>((v) => v instanceof File, {
  message: "Arquivo inválido.",
})

const companyFields = z.object({
  name: z.string().min(1, "Informe o nome da empresa."),
  email: z
    .string()
    .optional()
    .refine((v) => !v || z.string().email().safeParse(v).success, {
      message: "Digite um e-mail válido.",
    }),
  description: z.string().optional(),
  avatar: z.array(fileSchema).max(1, "Selecione apenas 1 imagem.").optional(),
})

export const createCompanyWithOwnerSchema = z
  .object({
    ownerUserId: z.string().uuid("Selecione um responsável."),
  })
  .and(companyFields)

export type CreateCompanyWithOwnerFormData = z.infer<typeof createCompanyWithOwnerSchema>
