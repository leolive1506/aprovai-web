import { useAuth } from "@/hooks/use-auth"
import { BrandLogo } from "@/components/brand-logo"
import { Building2Icon, HomeIcon, PackageIcon, SettingsIcon, UsersIcon } from "lucide-react"
import IconLogo from "../../../assets/icon.svg"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
} from "../../ui/sidebar"
import { CompanyHeader } from "./company-header"
import { NavMain } from "./nav-main"
import { NavUser } from "./nav-user"

const companyNavItems = [
  { title: "Início", url: "/home", icon: HomeIcon },
  { title: "Equipe", url: "/equipe", icon: UsersIcon },
]

const adminNavItems = [
  { title: "Empresas", url: "/admin", icon: Building2Icon },
  { title: "Usuários", url: "/admin/users", icon: UsersIcon },
  { title: "Planos", url: "/admin/plans", icon: PackageIcon },
]

const accountNavItems = [{ title: "Configurações", url: "/settings", icon: SettingsIcon }]

export function AppSidebar() {
  const { hasRoleAdmin } = useAuth()
  const isAdmin = hasRoleAdmin()

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader className="gap-0.5 px-2 pt-3 pb-1">
        <div className="flex items-center gap-2 px-1 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-1.5 group-data-[collapsible=icon]:px-0">
          <BrandLogo className="shrink-0 group-data-[collapsible=icon]:hidden" />
          <img src={IconLogo} alt="AprovIA" className="hidden size-5 shrink-0 group-data-[collapsible=icon]:block" />
          <SidebarTrigger className="ml-auto text-muted-foreground/50 hover:text-foreground [&_svg]:size-3.5 [&_svg]:stroke-[1.5] group-data-[collapsible=icon]:ml-0" />
        </div>
        {!isAdmin && <CompanyHeader />}
      </SidebarHeader>

      <SidebarContent className="gap-1 py-1">
        {isAdmin ? (
          <NavMain label="Administração" items={adminNavItems} />
        ) : (
          <NavMain label="Principal" items={companyNavItems} />
        )}
        <NavMain label="Conta" items={accountNavItems} />
      </SidebarContent>

      <SidebarFooter className="p-2">
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
