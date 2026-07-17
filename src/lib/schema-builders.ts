/**
 * Schema.org JSON-LD builders (Google-recommended format).
 *
 * Each function returns a plain object ready to be passed to useSchema().
 * Keep these pure — no side effects.
 */

import { SITE_CONFIG } from "@/seo.config"

export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Gabinete App",
    url: SITE_CONFIG.domain,
    logo: `${SITE_CONFIG.domain}/logo.svg`,
    description:
      "Software de gestão de demandas para gabinetes políticos. Organize solicitações de cidadãos, acompanhe andamento e prove resultados.",
    foundingDate: "2024",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      availableLanguage: "Portuguese",
      email: "suporte@gabineteapp.com.br",
    },
    sameAs: [
      "https://twitter.com/gabineteapp",
      "https://instagram.com/gabineteapp",
      "https://linkedin.com/company/gabineteapp",
    ],
  }
}

export function buildSoftwareApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Gabinete App",
    operatingSystem: "Web",
    applicationCategory: "BusinessApplication",
    url: SITE_CONFIG.domain,
    description:
      "Software de gestão de demandas para gabinetes políticos. Organize solicitações de cidadãos, acompanhe andamento e comprove resultados com analytics em tempo real.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "BRL",
      description: "Teste grátis, sem cartão de crédito.",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "150",
      bestRating: "5",
      worstRating: "1",
    },
    featureList: [
      "Gestão de demandas",
      "Analytics e KPIs",
      "Mapa de calor geolocalizado",
      "Relatórios em tempo real",
      "Notificações automáticas",
      "Gestão de equipe",
      "Portal para cidadãos",
    ],
  }
}

export interface FaqItem {
  q: string
  a: string
}

export function buildFaqSchema(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  }
}

export function buildWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Gabinete App",
    url: SITE_CONFIG.domain,
    inLanguage: "pt-BR",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_CONFIG.domain}/feed?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  }
}

export interface BreadcrumbItem {
  name: string
  url: string
}

export function buildBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}
