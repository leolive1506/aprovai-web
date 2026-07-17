import z from "zod";

export const loginFormSchema = z.object({
  email: z.email("Digite um e-mail válido."),
  password: z.string().min(6, "Insira uma senha com no mínimo 6 caracteres."),
});

export type LoginFormData = z.infer<typeof loginFormSchema>;