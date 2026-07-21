import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { Link, useLocation } from "react-router-dom"
import type { LucideIcon } from "lucide-react"

interface NavMainItem {
  title: string
  url: string
  icon: LucideIcon
  badge?: React.ReactNode
}

interface NavMainProps {
  label: string
  items: NavMainItem[]
}

export function NavMain({ label, items }: NavMainProps) {
  const { pathname } = useLocation()

  return (
    <SidebarGroup className="px-2">
      <SidebarGroupLabel className="px-2 text-2xs font-medium tracking-wide text-muted-foreground/60">
        {label}
      </SidebarGroupLabel>
      <SidebarMenu className="gap-0.5">
        {items.map((item) => {
          const isActive = pathname === item.url
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                isActive={isActive}
                className={cn(
                  "h-8.5 gap-2.5 rounded-md px-2.5 text-[13px] font-normal text-muted-foreground transition-colors",
                  "[&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:stroke-[1.5] [&_svg]:text-muted-foreground/70",
                  "hover:bg-black/3 hover:text-foreground dark:hover:bg-white/4",
                  isActive &&
                    "bg-card font-medium text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.06)] ring-1 ring-border/60 [&_svg]:text-foreground",
                )}
              >
                <Link to={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                  {item.badge}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
