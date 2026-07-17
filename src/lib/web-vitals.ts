/**
 * Core Web Vitals monitoring.
 *
 * Measures LCP (Largest Contentful Paint), INP (Interaction to Next Paint),
 * and CLS (Cumulative Layout Shift) using the native PerformanceObserver API.
 *
 * No external library required — the web-vitals npm package is NOT installed
 * to avoid adding a dependency. This implementation covers the three Core
 * Web Vitals that affect Google Search ranking as of 2024.
 *
 * Usage: call reportWebVitals() once from main.tsx.
 *
 * Results are sent to GA4 via trackEvent() and also logged to console in dev.
 */

import { trackEvent } from "./analytics"

const IS_DEV = import.meta.env.DEV

type VitalRating = "good" | "needs-improvement" | "poor"

interface VitalEntry {
  name: string
  value: number
  rating: VitalRating
}

function getRating(name: string, value: number): VitalRating {
  // Thresholds from https://web.dev/vitals/
  const thresholds: Record<string, [number, number]> = {
    LCP: [2500, 4000],
    INP: [200, 500],
    CLS: [0.1, 0.25],
    FCP: [1800, 3000],
    TTFB: [800, 1800],
  }

  const t = thresholds[name]
  if (!t) return "good"
  if (value <= t[0]) return "good"
  if (value <= t[1]) return "needs-improvement"
  return "poor"
}

function report(entry: VitalEntry): void {
  if (IS_DEV) {
    const icon = entry.rating === "good" ? "✓" : entry.rating === "needs-improvement" ? "~" : "✗"
    console.log(`[Web Vitals] ${icon} ${entry.name}: ${entry.value.toFixed(1)} (${entry.rating})`)
  }

  trackEvent("web_vitals", {
    metric_name: entry.name,
    metric_value: Math.round(entry.value),
    metric_rating: entry.rating,
    event_category: "performance",
  })
}

export function reportWebVitals(): void {
  // LCP — Largest Contentful Paint
  try {
    let lcpValue = 0
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const last = entries[entries.length - 1] as PerformanceEntry & { startTime: number }
      lcpValue = last.startTime
    })
    lcpObserver.observe({ type: "largest-contentful-paint", buffered: true })

    // Report LCP on page hide/visibility change (stable value)
    const reportLcp = () => {
      if (lcpValue > 0) {
        report({ name: "LCP", value: lcpValue, rating: getRating("LCP", lcpValue) })
        lcpObserver.disconnect()
      }
    }
    document.addEventListener("visibilitychange", reportLcp, { once: true })
    window.addEventListener("pagehide", reportLcp, { once: true })
  } catch {}

  // CLS — Cumulative Layout Shift
  try {
    let clsValue = 0
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const ls = entry as PerformanceEntry & { hadRecentInput: boolean; value: number }
        if (!ls.hadRecentInput) clsValue += ls.value
      }
    })
    clsObserver.observe({ type: "layout-shift", buffered: true })

    const reportCls = () => {
      report({ name: "CLS", value: clsValue, rating: getRating("CLS", clsValue) })
      clsObserver.disconnect()
    }
    document.addEventListener("visibilitychange", reportCls, { once: true })
    window.addEventListener("pagehide", reportCls, { once: true })
  } catch {}

  // INP — Interaction to Next Paint
  try {
    let maxInp = 0
    const inpObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const e = entry as PerformanceEntry & { processingStart: number; startTime: number }
        const inp = e.processingStart - e.startTime
        if (inp > maxInp) maxInp = inp
      }
    })
    inpObserver.observe({ type: "event", buffered: true, durationThreshold: 40 } as PerformanceObserverInit)

    const reportInp = () => {
      if (maxInp > 0) {
        report({ name: "INP", value: maxInp, rating: getRating("INP", maxInp) })
      }
      inpObserver.disconnect()
    }
    document.addEventListener("visibilitychange", reportInp, { once: true })
    window.addEventListener("pagehide", reportInp, { once: true })
  } catch {}

  // FCP — First Contentful Paint
  try {
    const fcpObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === "first-contentful-paint") {
          report({
            name: "FCP",
            value: entry.startTime,
            rating: getRating("FCP", entry.startTime),
          })
          fcpObserver.disconnect()
        }
      }
    })
    fcpObserver.observe({ type: "paint", buffered: true })
  } catch {}
}
