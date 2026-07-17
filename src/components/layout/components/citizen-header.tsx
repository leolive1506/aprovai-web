import { Button } from "@/components/ui/button"
import { NotificationPopover } from "@/components/layout/components/notification-popover"
import { UserDropdown } from "@/components/user-dropdown"
import { useAuth } from "@/hooks/use-auth"
import { Building2, LayoutDashboard, LogIn, MapPin, MapPinHouse } from "lucide-react"
import { Link, NavLink } from "react-router-dom"
import GIcon from '@/assets/icon.svg'
import { cn } from "@/lib/utils"
import { CityIndicator } from "@/components/city-picker/city-indicator"

const PUBLIC_NAV_LINKS = [
  { to: "/gabinetes", label: "Gabinetes", icon: Building2 },
  { to: "/mapa", label: "Mapa", icon: MapPin },
]

const CITIZEN_NAV_LINKS = [
  { to: "/my-neighborhood", label: "Meu Bairro", icon: MapPinHouse },
  { to: "/my-demands", label: "Minhas Demandas", icon: LayoutDashboard },
]

export function CitizenHeader() {
  const { isAuthenticated } = useAuth()

  return (
    <header className="fixed top-0 inset-x-0 z-50 flex h-14 items-center justify-between border-b border-border/60 bg-background px-4 sm:px-6">
      <div className="flex items-center gap-3 min-w-0">
        <Link to="/" className="shrink-0">
          <img src={GIcon} alt="Ícone do Gabinete" className="size-9" />
        </Link>

        <nav className="flex items-center gap-1">
          {[...PUBLIC_NAV_LINKS, ...(isAuthenticated ? CITIZEN_NAV_LINKS : [])].map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to}>
              {({ isActive }) => (
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 gap-2 rounded-lg px-2.5 text-sm transition-colors",
                    isActive
                      ? "bg-primary/10 font-medium text-primary hover:bg-primary/10 hover:text-primary"
                      : "font-normal text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="size-4 stroke-[1.5]" />
                  <span className="hidden sm:inline">{label}</span>
                </Button>
              )}
            </NavLink>
          ))}
        </nav>

        <CityIndicator />
      </div>

      <div className="flex items-center gap-2">
        {isAuthenticated && <NotificationPopover />}
        {isAuthenticated ? (
          <UserDropdown />
        ) : (
          <Link to="/login">
            <Button variant="default">
              Entrar
              <LogIn className="size-4" />
            </Button>
          </Link>
        )}
      </div>
    </header>
  )
}
