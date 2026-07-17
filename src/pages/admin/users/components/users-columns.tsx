import type { User } from "@/api/users"
import { UserRole, UserRoleLabel } from "@/api/users/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { getFirstLettersFromNames } from "@/utils/get-first-letters-from-names"
import type { ColumnDef } from "@tanstack/react-table"
import { UserEditSheet } from "./user-edit-sheet"
import { UserEnableButton, UserDisableButton } from "./user-action-buttons"

export function getUsersColumns(currentUserId: string): ColumnDef<User>[] { return [
  {
    accessorKey: "name",
    header: "Usuário",
    cell: ({ row }) => {
      const u = row.original
      return (
        <div className="flex items-center gap-2.5 min-w-0">
          <Avatar className="size-7 shrink-0">
            <AvatarImage src={u.avatarUrl ?? undefined} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-2xs">
              {getFirstLettersFromNames(u.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-0.5 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-foreground truncate">{u.name}</span>
              {u.disabledAt && (
                <Badge variant="secondary" className="text-2xs px-1.5 py-0 shrink-0">Inativo</Badge>
              )}
            </div>
            <span className="text-xs text-muted-foreground truncate">{u.id}</span>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    size: 240,
    cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.email}</span>,
  },
  {
    accessorKey: "role",
    header: "Role",
    size: 140,
    cell: ({ row }) => {
      const role = row.original.role as UserRole
      const label = UserRoleLabel[role] ?? row.original.role
      return <span className="text-sm text-muted-foreground">{label}</span>
    },
  },
  {
    accessorKey: "isCabinetMember",
    header: "Membro",
    size: 90,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.isCabinetMember ? "Sim" : "Não"}
      </span>
    ),
  },
  {
    id: "actions",
    header: "Ações",
    size: 160,
    cell: ({ row }) => {
      const u = row.original
      return (
        <div className="flex items-center justify-end gap-1.5">
          {u.disabledAt ? (
            <UserEnableButton userId={u.id} />
          ) : (
            <>
              {u.id !== currentUserId && <UserDisableButton userId={u.id} />}
              <UserEditSheet userId={u.id} />
            </>
          )}
        </div>
      )
    },
  }
]}
