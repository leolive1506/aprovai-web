import z from "zod";

export const registerFormSchema = z.object({
  name: z
    .string({ error: "Campo obrigatório." })
    .min(4, { error: "Nome deve ter no mínimo 4 caracteres." })
    .max(100, { error: "Nome muito longo." }),
  email: z
    .email({ error: "Digite um e-mail válido." })
    .max(254, { error: "E-mail muito longo." }),
  password: z
    .string({ error: "Campo obrigatório." })
    .min(8, { error: "Senha deve ter no mínimo 8 caracteres." })
    .max(72, { error: "Senha muito longa." }),
  termsAccepted: z.literal(true, {
    error: "Você deve aceitar os termos de uso.",
  }),
});

export type RegisterFormData = z.infer<typeof registerFormSchema>;
