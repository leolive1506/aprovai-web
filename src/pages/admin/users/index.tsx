import { usePageTitle } from "@/hooks/use-page-title"
import { useEffect } from "react"
import { UsersTable } from "./components/users-table"
import { UserCreateSheet } from "./components/user-create-sheet"

export function AdminUsers() {
  const { setTitle } = usePageTitle()

  useEffect(() => {
    setTitle({ title: "Usuários", description: "Listagem e gerenciamento" })
  }, [setTitle])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end">
        <UserCreateSheet />
      </div>
      <UsersTable />
    </div>
  )
}
