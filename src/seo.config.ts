/**
 * Central SEO configuration for aprovai.com.br
 *
 * All metadata is defined here — never hardcoded in individual components.
 * Usage: import { SEO_CONFIG, getPageSeo } from "@/seo.config"
 */

export const SITE_CONFIG = {
  name: "Aprovai",
  domain: "https://www.aprovai.com.br",
  defaultOgImage: "/og-default.png",
  locale: "pt_BR",
  twitterHandle: "@aprovai",
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
    title: "Aprovai | Software de Aprovação de Compras",
    description:
      "Centralize aprovações de compras, automatize fluxos e tenha controle total do seu orçamento. Plataforma SaaS de approval workflow para empresas.",
    canonical: "https://www.aprovai.com.br/",
    ogImage: "/og-default.png",
    ogType: "website",
    keywords:
      "aprovação de compras, software approval, workflow de compras, controle de orçamento, automação de compras, SaaS empresarial",
  },
  termsOfUse: {
    title: "Termos de Uso — Aprovai",
    description:
      "Leia os Termos de Uso da plataforma Aprovai. Condições de uso, responsabilidades e diretrizes para usuários.",
    canonical: "https://www.aprovai.com.br/termos-de-uso",
    ogType: "website",
    noindex: true,
  },
  privacyPolicy: {
    title: "Política de Privacidade (LGPD) — Aprovai",
    description:
      "Saiba como o Aprovai coleta, usa e protege seus dados pessoais em conformidade com a LGPD — Lei nº 13.709/2018.",
    canonical: "https://www.aprovai.com.br/politica-de-privacidade",
    ogType: "website",
    noindex: true,
  },
  login: {
    title: "Entrar — Aprovai",
    description: "Acesse sua conta no Aprovai e centralize as aprovações de compras da sua empresa.",
    canonical: "https://www.aprovai.com.br/login",
    ogType: "website",
    noindex: true,
  },
  signUp: {
    title: "Criar conta grátis — Aprovai",
    description:
      "Cadastre-se gratuitamente no Aprovai e comece a automatizar aprovações de compras. Teste 14 dias, sem cartão de crédito.",
    canonical: "https://www.aprovai.com.br/sign-up",
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
