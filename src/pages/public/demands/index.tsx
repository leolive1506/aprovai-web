import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { DemandsFeed } from "@/pages/private/demands/components/demands-feed";
import { DemandsForm } from "@/pages/private/demands/components/demands-form";
import { getFirstLettersFromNames } from "@/utils/get-first-letters-from-names";
import { ChevronDown, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "../../../assets/logo-new.png";

function PublicHeader() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="fixed bg-white top-0 inset-x-0 z-50 flex items-center justify-between px-4 sm:px-6 py-2 border-b border-muted shadow-sm">
      <img src={Logo} alt="Logo" className="w-24 sm:w-32 shrink-0" />

      <div className="flex items-center gap-2">
        <DemandsForm sizeTrigger="sm" />

        {isAuthenticated ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Menu do perfil"
                className="flex items-center gap-1 p-1.5 rounded-full hover:bg-muted transition-colors focus:outline-none shrink-0"
              >
                <Avatar size="default">
                  <AvatarFallback className="bg-primary text-white font-semibold text-xs">
                    {getFirstLettersFromNames(user?.name as string)}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="size-3.5 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56 mt-1 rounded-xl shadow-lg">
              <div className="flex items-center gap-3 px-3 py-3">
                <Avatar size="lg">
                  <AvatarFallback className="bg-primary text-white font-semibold">
                    {getFirstLettersFromNames(user?.name as string)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold truncate">{user?.name}</span>
                  <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
                </div>
              </div>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={logout}
                className="cursor-pointer gap-2 rounded-lg text-red-500 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30"
              >
                <LogOut className="size-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button asChild variant="outline" size="sm">
            <Link to="/login">Entrar</Link>
          </Button>
        )}
      </div>
    </header>
  );
}

export function PublicDemands() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main className="pt-16 px-4 sm:px-6 py-6 bg-[#F6F6F6] h-screen">
        <DemandsFeed />
      </main>
    </div>
  );
}
