/**
 * Central SEO configuration for gabineteapp.com.br
 *
 * All metadata is defined here — never hardcoded in individual components.
 * Usage: import { SEO_CONFIG, getPageSeo } from "@/seo.config"
 */

export const SITE_CONFIG = {
  name: "Gabinete App",
  domain: "https://www.gabineteapp.com.br",
  defaultOgImage: "/og-default.png",
  locale: "pt_BR",
  twitterHandle: "@gabineteapp",
  themeColor: "#2563EB",
} as const

export interface PageSeoConfig {
  title: string
  description: string
  canonical: string
  ogImage?: string
  ogType?: "website" | "article"
  noindex?: boolean
  keywords?: string
}

export const SEO_CONFIG: Record<string, PageSeoConfig> = {
  home: {
    title: "Gabinete App | Software de Gestão de Demandas para Políticos",
    description:
      "Organize demandas de constituintes, gerencie seu gabinete 100% online. Acompanhe solicitações, analise dados e responda mais rápido com Gabinete App. Teste grátis, sem cartão de crédito.",
    canonical: "https://www.gabineteapp.com.br/",
    ogImage: "/og-default.png",
    ogType: "website",
    keywords:
      "gabinete app, gestão de demandas, software gabinete, gerenciamento mandato, software político, demandas cidadãos, vereador, deputado",
  },
  termsOfUse: {
    title: "Termos de Uso — Gabinete App",
    description:
      "Leia os Termos de Uso da plataforma Gabinete App. Condições de uso, responsabilidades e diretrizes para gabinetes e cidadãos.",
    canonical: "https://www.gabineteapp.com.br/termos-de-uso",
    ogType: "website",
    noindex: true,
  },
  privacyPolicy: {
    title: "Política de Privacidade (LGPD) — Gabinete App",
    description:
      "Saiba como o Gabinete App coleta, usa e protege seus dados pessoais em conformidade com a LGPD — Lei nº 13.709/2018.",
    canonical: "https://www.gabineteapp.com.br/politica-de-privacidade",
    ogType: "website",
    noindex: true,
  },
  login: {
    title: "Entrar — Gabinete App",
    description: "Acesse sua conta no Gabinete App e gerencie as demandas do seu mandato.",
    canonical: "https://www.gabineteapp.com.br/login",
    ogType: "website",
    noindex: true,
  },
  signUp: {
    title: "Criar conta grátis — Gabinete App",
    description:
      "Cadastre-se gratuitamente no Gabinete App e comece a centralizar demandas do seu gabinete parlamentar. Sem cartão de crédito.",
    canonical: "https://www.gabineteapp.com.br/sign-up",
    ogType: "website",
    noindex: true,
  },
}

/**
 * Returns the SEO config for a given page key, falling back to the homepage config.
 */
export function getPageSeo(key: keyof typeof SEO_CONFIG): PageSeoConfig {
  return SEO_CONFIG[key] ?? SEO_CONFIG.home
}

/**
 * Builds the full `<title>` string applying the site suffix.
 * If the title already ends with the site name, returns it unchanged.
 */
export function buildTitle(title: string): string {
  const suffix = ` — ${SITE_CONFIG.name}`
  return title.endsWith(SITE_CONFIG.name) ? title : title.replace(suffix, "") + suffix
}
