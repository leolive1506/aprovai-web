import z from "zod";

export const resetPasswordSchema = z.object({
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres."),
})

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
