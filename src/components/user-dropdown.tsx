import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { LogOut, Settings, User } from "lucide-react";
import { UserRole, UserRoleLabel } from "@/api/users/types";
import { Link } from "react-router-dom";
import { UserAvatar } from "./user-avatar";

export function UserDropdown() {
  const { user, logout } = useAuth()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Menu do perfil"
          className="shrink-0 rounded-xl shadow-sm transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <UserAvatar
            size="default"
            name={user?.name}
            avatarUrl={user?.avatarUrl}
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <Link to={`/profile/${user?.id}`} className="flex p-1 gap-2 items-center rounded-sm hover:bg-muted transition-colors">
          <UserAvatar
            size="lg"
            name={user?.name}
            avatarUrl={user?.avatarUrl}
          />
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-sm font-semibold truncate">
                {user?.name}
              </span>
              ·
              <small className="text-xs font-normal text-muted-foreground">{UserRoleLabel[user?.role as UserRole]}</small>
            </div>
            <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
          </div>
        </Link>

        <DropdownMenuSeparator />

        <Link to={`/profile/${user?.id}`}>
          <DropdownMenuItem
            variant="default"
            className="cursor-pointer"
          >
            <User className="size-4" />
            Meu Perfil
          </DropdownMenuItem>
        </Link>

        <Link to="/settings">
          <DropdownMenuItem
            variant="default"
            className="cursor-pointer"
          >
            <Settings className="size-4" />
            Configurações
          </DropdownMenuItem>
        </Link>

        <DropdownMenuItem
          onClick={logout}
          variant="destructive"
          className="cursor-pointer"
        >
          <LogOut className="size-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}