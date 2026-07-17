import z from "zod";

const locationSchema = z.object({
  address: z.string().min(1, "Selecione um endereço no mapa"),
  latitude: z.string().min(1, ""),
  longitude: z.string().min(1, ""),
  zipcode: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
});

export const demandSchema = z.object({
  title: z.string().min(3, "O título deve conter no mínimo 3 caracteres"),
  description: z
    .string()
    .min(10, "A descrição deve conter no mínimo 10 caracteres"),
  categoryId: z.string({
    error: "Selecione uma categoria",
  }),
  location: locationSchema,
  files: z
    .array(z.instanceof(File), { error: "Envie pelo menos um arquivo" })
    .min(1, "Envie pelo menos um arquivo"),
  guestEmail: z
    .email("Digite um e-mail válido")
    .optional()
    .or(z.literal("")),
  guestPhone: z.string().max(20).optional().or(z.literal("")),
});

export type DemandFormData = z.infer<typeof demandSchema>;

export const defaultDemandValues: DemandFormData = {
  title: "",
  description: "",
  categoryId: "",
  location: {
    address: "",
    latitude: "",
    longitude: "",
    zipcode: "",
    neighborhood: "",
    city: "",
    state: "",
  },
  files: [],
  guestEmail: "",
  guestPhone: "",
};
