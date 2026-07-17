import { useEffect } from "react"

/**
 * useSchema — injects a JSON-LD structured data script tag into <head>.
 *
 * Accepts any valid Schema.org object. The script is removed on unmount,
 * so schema is always scoped to the active page.
 *
 * @example
 * useSchema(buildSoftwareApplicationSchema())
 * useSchema(buildOrganizationSchema())
 * useSchema(buildFaqSchema(FAQ_ITEMS))
 */
export function useSchema(schema: object) {
  useEffect(() => {
    const script = document.createElement("script")
    script.setAttribute("type", "application/ld+json")
    script.setAttribute("data-seo-schema", "true")
    script.textContent = JSON.stringify(schema)
    document.head.appendChild(script)

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [schema])
}
