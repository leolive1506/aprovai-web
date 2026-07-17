import { usePageTitle } from "@/hooks/use-page-title"
import { useEffect } from "react"
import { CabinetsTable } from "./components/cabinets-table"
import { CabinetsForm } from "./components/cabinet-create-sheet"

export function Admin() {
  const { setTitle } = usePageTitle()

  useEffect(() => {
    setTitle({ title: "Gabinetes", description: "Listagem e gerenciamento" })
  }, [setTitle])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end">
        <CabinetsForm sizeTrigger="default" />
      </div>
      <CabinetsTable />
    </div>
  )
}
