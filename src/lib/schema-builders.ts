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
    name: "Aprovai",
    url: SITE_CONFIG.domain,
    logo: `${SITE_CONFIG.domain}/logo.svg`,
    description:
      "Plataforma SaaS de aprovação de compras. Centralize aprovações, automatize fluxos e tenha controle total do orçamento empresarial.",
    foundingDate: "2024",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      availableLanguage: "Portuguese",
      email: "suporte@aprovai.com.br",
    },
    sameAs: [
      "https://twitter.com/aprovai",
      "https://instagram.com/aprovai",
      "https://linkedin.com/company/aprovai",
    ],
  }
}

export function buildSoftwareApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Aprovai",
    operatingSystem: "Web",
    applicationCategory: "BusinessApplication",
    url: SITE_CONFIG.domain,
    description:
      "Plataforma SaaS de aprovação de compras. Centralize aprovações, automatize fluxos e tenha controle total do orçamento empresarial com analytics em tempo real.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "BRL",
      description: "Teste grátis 14 dias, sem cartão de crédito.",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "150",
      bestRating: "5",
      worstRating: "1",
    },
    featureList: [
      "Approval workflow automático",
      "Controle de orçamento",
      "Analytics e KPIs",
      "Relatórios em tempo real",
      "Notificações multi-canal",
      "Gestão de usuários com RBAC",
      "Integrações (Slack, Google)",
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
    name: "Aprovai",
    url: SITE_CONFIG.domain,
    inLanguage: "pt-BR",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_CONFIG.domain}/demands?q={search_term_string}`,
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
