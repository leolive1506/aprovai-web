import { usePageTitle } from "@/hooks/use-page-title"
import { useEffect } from "react"
import { ReportsTable } from "./components/reports-table"

export function AdminReports() {
  const { setTitle } = usePageTitle()

  useEffect(() => {
    setTitle({ title: "Denúncias", description: "Moderação de conteúdo" })
  }, [setTitle])

  return (
    <div className="flex flex-col gap-4">
      <ReportsTable />
    </div>
  )
}
