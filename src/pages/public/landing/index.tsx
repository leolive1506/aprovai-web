import { useMemo } from "react"
import { useSeo } from "@/hooks/use-seo"
import { useSchema } from "@/hooks/use-schema"
import { getPageSeo } from "@/seo.config"
import {
  buildSoftwareApplicationSchema,
  buildOrganizationSchema,
  buildWebSiteSchema,
  buildFaqSchema,
} from "@/lib/schema-builders"
import { LandingHeader } from "./components/landing-header"
import { HeroSection } from "./components/hero-section"
import { HowItWorksSection } from "./components/how-it-works-section"
import { FeaturesSection } from "./components/features-section"
import { StatsSection } from "./components/stats-section"
import { TestimonialsSection } from "./components/testimonials-section"
import { CTASection } from "./components/cta-section"
import { FAQSection, FAQ_ITEMS } from "./components/faq-section"
import { LandingFooter } from "./components/landing-footer"

export function LandingPage() {
  useSeo(getPageSeo("home"))

  const softwareSchema = useMemo(() => buildSoftwareApplicationSchema(), [])
  const orgSchema = useMemo(() => buildOrganizationSchema(), [])
  const websiteSchema = useMemo(() => buildWebSiteSchema(), [])
  const faqSchema = useMemo(() => buildFaqSchema(FAQ_ITEMS), [])

  useSchema(softwareSchema)
  useSchema(orgSchema)
  useSchema(websiteSchema)
  useSchema(faqSchema)

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      <main id="inicio">
        {/* 1. Hero — campo de waitlist + vídeo */}
        <HeroSection />
        {/* 2. Problema — dor concreta antes de mostrar solução */}
        <HowItWorksSection />
        {/* 3. Funcionalidades — resultado primeiro, feature depois */}
        <FeaturesSection />
        {/* 4. Como funciona — 3 passos simples */}
        <StatsSection />
        {/* 5. Prova social — quotes de discovery, sem dados falsos */}
        <TestimonialsSection />
        {/* 6. FAQ */}
        <FAQSection />
        {/* 7. CTA final forte */}
        <CTASection />
      </main>
      <LandingFooter />
    </div>
  )
}
