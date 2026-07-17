import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { DemandsForm } from "@/pages/private/demands/components/demands-form";
import Logo from "../../../assets/logo-new.png";
import { ChevronDown, ClipboardListIcon, LogOut, Menu, Settings, User } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const navItems = [
  { to: "/", label: "Demandas", icon: ClipboardListIcon },
];

export function MemberHeader() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const initials = user?.name
    ? user.name
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase()
    : "U";

  return (
    <header className="flex fixed top-0 inset-x-0 z-50 shadow items-center justify-between px-4 sm:px-6 py-2 border-b border-muted bg-background">
      <img src={Logo} alt="Logo" className="w-24 sm:w-32 shrink-0" />

      <nav className="hidden md:flex items-center gap-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              pathname === to
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="hidden md:flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Menu do perfil"
              className="flex items-center gap-1 p-1.5 rounded-full hover:bg-muted transition-colors focus:outline-none shrink-0"
            >
              <Avatar size="default">
                <AvatarFallback className="bg-primary text-white font-semibold text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="size-3.5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56 mt-1 rounded-xl shadow-lg">
            <div className="flex items-center gap-3 px-3 py-3">
              <Avatar size="lg">
                <AvatarFallback className="bg-primary text-white font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold truncate">{user?.name}</span>
                <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
              </div>
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuItem className="cursor-pointer gap-2 rounded-lg">
              <User className="size-4" />
              Ver perfil
            </DropdownMenuItem>

            <DropdownMenuItem
              className="cursor-pointer gap-2 rounded-lg"
              onClick={() => navigate("/settings")}
            >
              <Settings className="size-4" />
              Configurações
            </DropdownMenuItem>

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
      </div>

      <div className="flex md:hidden items-center gap-2">
        <DemandsForm sizeTrigger="icon" />

        <Sheet>
          <SheetTrigger asChild>
            <button
              type="button"
              aria-label="Abrir menu"
              className="p-2 rounded-lg hover:bg-muted transition-colors focus:outline-none"
            >
              <Menu className="size-5 text-foreground" />
            </button>
          </SheetTrigger>

          <SheetContent side="right" className="w-72 p-0 flex flex-col">
            <div className="flex items-center gap-3 px-5 py-5 border-b border-muted">
              <Avatar size="lg">
                <AvatarFallback className="bg-primary text-white font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold truncate">{user?.name}</span>
                <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
              </div>
            </div>

            <nav className="flex flex-col gap-1 px-3 py-4">
              {navItems.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    pathname === to
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  {label}
                </Link>
              ))}
            </nav>

            <div className="h-px bg-muted mx-3" />

            <div className="flex flex-col gap-1 px-3 py-4">
              <button
                type="button"
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-left"
              >
                <User className="size-4 shrink-0" />
                Ver perfil
              </button>
              <button
                type="button"
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-left"
              >
                <Settings className="size-4 shrink-0" />
                Configurações
              </button>
            </div>

            <div className="mt-auto px-3 py-4 border-t border-muted">
              <button
                type="button"
                onClick={logout}
                className="flex w-full items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                <LogOut className="size-4 shrink-0" />
                Sair
              </button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
