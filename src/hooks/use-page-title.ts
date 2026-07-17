import { useContext } from "react"
import { PageTitleContext } from "@/contexts/page-title-context"

export function usePageTitle() {
  const context = useContext(PageTitleContext)

  if (context === undefined) {
      throw new Error("usePageTitle must be used within an PageTitleProvider");
  }

  return context;
}
