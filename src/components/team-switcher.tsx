"use client"

import * as React from "react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { ChevronsUpDownIcon } from "lucide-react"

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string
    logo: React.ReactNode
    plan: string
  }[]
}) {
  const { isMobile } = useSidebar()
  const [activeTeam, setActiveTeam] = React.useState(teams[0])

  if (!activeTeam) {
    return null
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="h-16 data-[state=open]:bg-zinc-100 rounded-md group-data-[collapsible=icon]:size-12! group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center transition-colors duration-150"
            >
              <div className="flex aspect-square size-9 items-center justify-center rounded-md bg-primary text-white shrink-0">
                {activeTeam.logo}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-semibold text-zinc-900 line-clamp-1">{activeTeam.name}</span>
                <span className="truncate text-xs text-zinc-500">{activeTeam.plan}</span>
              </div>
              <ChevronsUpDownIcon className="ml-auto size-4 text-zinc-400 group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-md"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-widest px-4 py-3">
              Workspaces
            </DropdownMenuLabel>
            {teams.map((team) => (
              <DropdownMenuItem
                key={team.name}
                onClick={() => setActiveTeam(team)}
                className="gap-3 p-3 text-sm font-medium focus:bg-zinc-100 cursor-pointer mx-1 rounded-md"
              >
                <div className="flex size-8 items-center justify-center rounded-md bg-primary text-white">
                  {team.logo}
                </div>
                {team.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
