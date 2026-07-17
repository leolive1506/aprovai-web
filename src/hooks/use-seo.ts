import { useEffect } from "react"
import type { PageSeoConfig } from "@/seo.config"
import { SITE_CONFIG } from "@/seo.config"

/**
 * useSeo — injects all SEO meta tags into <head> for the current page.
 *
 * This hook is the single source of truth for per-page SEO in this SPA.
 * Call it at the top of any page component:
 *
 * @example
 * useSeo(getPageSeo("home"))
 *
 * It manages: title, description, canonical, Open Graph, Twitter Card,
 * robots (noindex), and keywords. Each tag is removed or updated when the
 * page changes, so no stale meta-tags are left behind.
 */
export function useSeo(config: PageSeoConfig) {
  useEffect(() => {
    document.title = config.title

    const metas: { [key: string]: string } = {
      description: config.description,
      ...(config.keywords ? { keywords: config.keywords } : {}),
      robots: config.noindex ? "noindex, nofollow" : "index, follow",

      "og:title": config.title,
      "og:description": config.description,
      "og:url": config.canonical,
      "og:type": config.ogType ?? "website",
      "og:site_name": SITE_CONFIG.name,
      "og:locale": SITE_CONFIG.locale,
      "og:image": `${SITE_CONFIG.domain}${config.ogImage ?? SITE_CONFIG.defaultOgImage}`,
      "og:image:width": "1200",
      "og:image:height": "630",
      "og:image:alt": config.title,

      "twitter:card": "summary_large_image",
      "twitter:title": config.title,
      "twitter:description": config.description,
      "twitter:image": `${SITE_CONFIG.domain}${config.ogImage ?? SITE_CONFIG.defaultOgImage}`,
      "twitter:site": SITE_CONFIG.twitterHandle,
    }

    const createdNodes: Element[] = []

    Object.entries(metas).forEach(([key, value]) => {
      const isOg = key.startsWith("og:")
      const isTwitter = key.startsWith("twitter:")
      const attrName = isOg || isTwitter ? "property" : "name"

      let el = isOg || isTwitter
        ? (document.head.querySelector(`meta[property="${key}"]`) as HTMLMetaElement | null)
        : (document.head.querySelector(`meta[name="${key}"]`) as HTMLMetaElement | null)

      if (!el) {
        el = document.createElement("meta")
        el.setAttribute(attrName, key)
        document.head.appendChild(el)
        createdNodes.push(el)
      }

      el.setAttribute("content", value)
    })

    let canonicalEl = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
    if (!canonicalEl) {
      canonicalEl = document.createElement("link")
      canonicalEl.setAttribute("rel", "canonical")
      document.head.appendChild(canonicalEl)
      createdNodes.push(canonicalEl)
    }
    canonicalEl.setAttribute("href", config.canonical)

    return () => {
      // Restore title to site default on unmount
      document.title = SITE_CONFIG.name
      // Remove only the nodes we created (not pre-existing ones from index.html)
      createdNodes.forEach((node) => node.parentNode?.removeChild(node))
    }
  }, [config])
}
