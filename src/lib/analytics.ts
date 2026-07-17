/**
 * Google Analytics 4 integration.
 *
 * Setup:
 *  1. Set VITE_GA_MEASUREMENT_ID in your .env (e.g. G-XXXXXXXXXX).
 *  2. Call initAnalytics() once from main.tsx (after mount).
 *  3. Use trackPageView() on route changes (called automatically by usePageTracking hook).
 *  4. Use trackEvent() for custom conversion events.
 *
 * We load gtag lazily (no blocking) — script is injected with async attribute.
 */

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
  }
}

const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined

let initialized = false

export function initAnalytics(): void {
  if (initialized || !MEASUREMENT_ID) return
  initialized = true

  // Inject gtag.js script asynchronously — does NOT block rendering
  const script = document.createElement("script")
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`
  document.head.appendChild(script)

  window.dataLayer = window.dataLayer ?? []
  window.gtag = function (...args: unknown[]) {
    window.dataLayer.push(args)
  }

  window.gtag("js", new Date())
  window.gtag("config", MEASUREMENT_ID, {
    // Reduce PII exposure; GA4 anonymizes IP by default
    anonymize_ip: true,
    // Disable automatic page_view — we control this manually per SPA route
    send_page_view: false,
  })
}

/**
 * Call this on every route change to track page views in GA4.
 */
export function trackPageView(path: string, title: string): void {
  if (!initialized || !window.gtag) return
  window.gtag("event", "page_view", {
    page_path: path,
    page_title: title,
    page_location: window.location.href,
  })
}

/**
 * Generic event tracker.
 *
 * @example
 * trackEvent("cta_click", { label: "Começar grátis", location: "hero" })
 * trackEvent("form_submit", { form_name: "sign_up" })
 */
export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>,
): void {
  if (!initialized || !window.gtag) return
  window.gtag("event", eventName, params)
}

/** Track "Começar grátis" CTA clicks with source context */
export function trackCtaClick(location: "hero" | "hero_waitlist" | "cta_section" | "cta_bottom_waitlist" | "header" | "footer") {
  trackEvent("cta_click", {
    event_category: "conversion",
    event_label: "Começar grátis",
    location,
  })
}

/** Track "Falar com CEO" WhatsApp CTA */
export function trackWhatsappClick(location: string) {
  trackEvent("whatsapp_click", {
    event_category: "engagement",
    event_label: "Falar com CEO",
    location,
  })
}

/** Track successful sign-up form submission */
export function trackSignUp(method: "email" | "google") {
  trackEvent("sign_up", {
    method,
    event_category: "conversion",
  })
}

/** Track successful login */
export function trackLogin(method: "email" | "google") {
  trackEvent("login", { method })
}
