import { z } from "zod";

export const personalInfoSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  phone: z.string(),
});

export interface PersonalInfoData {
  name: string;
  phone: string;
}

const optionalUrl = z
  .string()
  .url("URL inválida (inclua https://)")
  .or(z.literal(""))
  .optional()

export const cabinetInfoSchema = z.object({
  name: z.string().min(3, "O nome do gabinete deve ter pelo menos 3 caracteres"),
  description: z.string().max(1000, "A descrição deve ter no máximo 1000 caracteres"),
  email: z.string().email("E-mail inválido").or(z.literal("")),
  tagline: z.string().max(120, "Máximo 120 caracteres").optional(),
  postDemandMessage: z.string().max(500, "Máximo 500 caracteres").optional(),
  instagramUrl: optionalUrl,
  facebookUrl: optionalUrl,
  websiteUrl: optionalUrl,
  twitterUrl: optionalUrl,
  whatsappUrl: optionalUrl,
  youtubeUrl: optionalUrl,
  tiktokUrl: optionalUrl,
  heroTitle: z.string().max(120, "Máximo 120 caracteres").optional(),
  heroSubtitle: z.string().max(300, "Máximo 300 caracteres").optional(),
  heroVideoUrl: optionalUrl,
  biographyContent: z.string().max(5000, "Máximo 5000 caracteres").optional(),
});

export interface CabinetInfoData {
  name: string;
  description: string;
  email: string;
  tagline?: string;
  postDemandMessage?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  websiteUrl?: string;
  twitterUrl?: string;
  whatsappUrl?: string;
  youtubeUrl?: string;
  tiktokUrl?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroVideoUrl?: string;
  biographyContent?: string;
}

export const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8, "A nova senha deve ter pelo menos 8 caracteres"),
});

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}
