import { SidebarTrigger } from "@/components/ui/sidebar";
import { NotificationPopover } from "./notification-popover";
import { UserDropdown } from "@/components/user-dropdown";
import { CityIndicator } from "@/components/city-picker/city-indicator";

export function Header() {
  return (
    <header className="flex p-1 border-b border-muted items-center justify-between">
      <div className="flex items-center gap-2 min-w-0 shrink-0">
        <SidebarTrigger className="md:hidden hover:text-primary transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-full" />
        <CityIndicator />
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <NotificationPopover />
        <UserDropdown />
      </div>
    </header>
  );
}