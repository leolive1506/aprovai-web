import { useGetDemandsByCabinetSlug } from "@/api/demands/hooks"
import { UserRole, UserRoleLabel } from "@/api/users/types"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserAvatar } from "@/components/user-avatar"
import { useAuth } from "@/hooks/use-auth"
import { useCurrentMember } from "@/hooks/use-current-member"
import { cn } from "@/lib/utils"
import {
  BarChart3,
  Building2,
  CheckSquare,
  ChevronDown,
  ClipboardListIcon,
  ExternalLink,
  Flag,
  Globe,
  Home,
  LayoutDashboard,
  LogOut,
  Map,
  MapPin,
  Newspaper,
  PackageIcon,
  Settings,
  User as UserIcon,
  Users,
  type LucideIcon,
} from "lucide-react"
import type { ReactNode } from "react"
import { Link, useLocation } from "react-router-dom"
import IconLogo from "../../../assets/icon.svg"
import Logo from "../../../assets/aprovai.svg"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "../../ui/sidebar"

function MyTasksBadge() {
  const { cabinet } = useAuth()
  const { currentMember } = useCurrentMember()

  const { data } = useGetDemandsByCabinetSlug({
    slug: cabinet?.slug as string,
    assigneeMemberId: currentMember?.id,
    limit: 1,
    page: 1,
  })

  const total = data?.meta.total ?? 0
  if (!currentMember || total === 0) return null

  return (
    <span className="ml-auto inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-primary text-primary-foreground text-2xs font-bold leading-none group-data-[collapsible=icon]:hidden">
      {total > 99 ? "99+" : total}
    </span>
  )
}

function SidebarUserCard() {
  const { isMobile } = useSidebar()
  const { user, logout } = useAuth()

  if (!user) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex w-full items-center gap-2.5 rounded-xl border border-border/60 bg-card p-2 text-left transition-colors hover:bg-muted/40 data-[state=open]:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:border-0 group-data-[collapsible=icon]:p-0"
          )}
        >
          <UserAvatar size="default" name={user.name} avatarUrl={user.avatarUrl} />
          <div className="grid min-w-0 flex-1 leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate text-2xs text-muted-foreground">
              {UserRoleLabel[user.role as UserRole]}
            </span>
            <span className="truncate text-sm font-medium text-foreground">{user.name}</span>
          </div>
          <ChevronDown className="size-3.5 shrink-0 stroke-[1.5] text-muted-foreground/70 group-data-[collapsible=icon]:hidden" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
        side={isMobile ? "bottom" : "right"}
        align="start"
        sideOffset={6}
      >
        <div className="flex items-center gap-2 px-1.5 py-1.5">
          <UserAvatar size="default" name={user.name} avatarUrl={user.avatarUrl} />
          <div className="grid min-w-0 flex-1 leading-tight">
            <span className="truncate text-sm font-semibold">{user.name}</span>
            <span className="truncate text-xs text-muted-foreground">{user.email}</span>
          </div>
        </div>
        <DropdownMenuSeparator />
        <Link to={`/profile/${user.id}`}>
          <DropdownMenuItem className="cursor-pointer">
            <UserIcon className="size-4" />
            Meu Perfil
          </DropdownMenuItem>
        </Link>
        <Link to="/settings">
          <DropdownMenuItem className="cursor-pointer">
            <Settings className="size-4" />
            Configurações
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} variant="destructive" className="cursor-pointer">
          <LogOut className="size-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function NavGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <SidebarGroup className="px-3 py-2 group-data-[collapsible=icon]:px-2">
      <SidebarGroupLabel className="px-2.5 text-2xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </SidebarGroupLabel>
      <SidebarMenu className="gap-0.5">{children}</SidebarMenu>
    </SidebarGroup>
  )
}

interface NavItemProps {
  to: string
  label: string
  icon: LucideIcon
  children?: ReactNode
}

function NavItem({ to, label, icon: Icon, children }: NavItemProps) {
  const { pathname } = useLocation()
  const active = pathname === to

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        tooltip={label}
        isActive={active}
        className={cn(
          "h-9 gap-2.5 rounded-lg px-2.5 font-normal text-muted-foreground transition-colors",
          "[&_svg]:size-4 [&_svg]:stroke-[1.5]",
          "hover:bg-muted hover:text-foreground",
          "data-[active=true]:bg-primary/10 data-[active=true]:font-medium data-[active=true]:text-primary"
        )}
      >
        <Link to={to}>
          <Icon className="shrink-0" />
          <span>{label}</span>
          {children}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

export function AppSidebar() {
  const { hasRoleAdmin, cabinet, user } = useAuth()
  const isAdmin = hasRoleAdmin()
  const isCitizen = user?.role === UserRole.CITIZEN

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader className="gap-0 p-0">
        <div className="flex items-center justify-between gap-2 px-4 py-3 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:px-2">
          <img src={Logo} alt="Gabinete App" className="w-32 group-data-[collapsible=icon]:hidden" />
          <img src={IconLogo} alt="" className="hidden size-7 group-data-[collapsible=icon]:block" />
          <SidebarTrigger className="text-muted-foreground/70 hover:text-foreground [&_svg]:stroke-[1.5]" />
        </div>
        <div className="px-3 pt-3 group-data-[collapsible=icon]:px-2">
          <SidebarUserCard />
        </div>
      </SidebarHeader>

      <SidebarContent className="py-1">
        {isAdmin ? (
          <NavGroup label="Administração">
            <NavItem to="/admin" label="Gabinetes" icon={Building2} />
            <NavItem to="/admin/users" label="Usuários" icon={Users} />
            <NavItem to="/admin/denuncias" label="Denúncias" icon={Flag} />
            <NavItem to="/admin/plans" label="Planos" icon={PackageIcon} />
            <NavItem to="/mapa" label="Mapa" icon={Map} />
          </NavGroup>
        ) : (
          <>
            <NavGroup label="Principal">
              <NavItem to="/" label="Feed" icon={Newspaper} />
              <NavItem to="/mapa" label="Mapa" icon={Map} />
              <NavItem to="/my-neighborhood" label="Meu Bairro" icon={MapPin} />
              {isCitizen && (
                <NavItem to="/my-demands" label="Minhas Demandas" icon={LayoutDashboard} />
              )}
            </NavGroup>

            {!isCitizen && (
              <NavGroup label="Gabinete">
                <NavItem to="/home" label="Início" icon={Home} />
                <NavItem to="/demands" label="Demandas" icon={ClipboardListIcon} />
                <NavItem to="/minhas-tarefas" label="Minhas Tarefas" icon={CheckSquare}>
                  <MyTasksBadge />
                </NavItem>
                <NavItem to="/equipe" label="Equipe" icon={Users} />
                <NavItem to="/relatorios" label="Relatórios" icon={BarChart3} />
              </NavGroup>
            )}
          </>
        )}

        <NavGroup label="Conta">
          <NavItem to="/settings" label="Configurações" icon={Settings} />
        </NavGroup>
      </SidebarContent>

      {!isAdmin && cabinet?.slug && (
        <SidebarFooter className="p-3 group-data-[collapsible=icon]:p-2">
          <Link
            to={`/${cabinet.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            title={cabinet.name ?? "Perfil público"}
            className={cn(
              "flex items-center gap-2.5 rounded-xl border border-border/60 bg-card p-2 transition-colors hover:border-primary/40 hover:bg-primary/5",
              "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:border-0 group-data-[collapsible=icon]:p-1"
            )}
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Globe className="size-4 stroke-[1.5]" />
            </span>
            <div className="grid min-w-0 flex-1 leading-tight group-data-[collapsible=icon]:hidden">
              <span className="truncate text-sm font-medium text-primary">Perfil público</span>
              <span className="truncate text-xs text-muted-foreground">
                {cabinet.name ?? "Ver perfil"}
              </span>
            </div>
            <ExternalLink className="size-3.5 shrink-0 text-muted-foreground/60 group-data-[collapsible=icon]:hidden" />
          </Link>
        </SidebarFooter>
      )}
    </Sidebar>
  )
}
