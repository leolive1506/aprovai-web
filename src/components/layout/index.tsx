import { useAuth } from "@/hooks/use-auth";
import { Loading } from "@/components/loading";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { SidebarInset, SidebarProvider } from "../ui/sidebar";
import { AppSidebar } from "./components/app-sidebar";
import { ConsentOverlay } from "../auth/consent-overlay"
import { SubscriptionStatusBanner } from "../subscription-status-banner";

import { UserRole } from "@/api/users/types";

const rolesWithSidebar: UserRole[] = [UserRole.ADMIN, UserRole.MEMBER]

export function Layout() {
  const { user, isInitializing, hasRoleAdmin } = useAuth();
  const { pathname } = useLocation();

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loading className="text-primary size-6" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (hasRoleAdmin() && pathname === "/") {
    return <Navigate to="/admin" replace />;
  }

  if (user && rolesWithSidebar.includes(user.role)) {
    return (
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar />
        <SidebarInset className="sm:border sm:border-muted sm:shadow-2xl">
          <div className="p-3 sm:p-6">
            <SubscriptionStatusBanner />
            <Outlet />
          </div>
        </SidebarInset>
        <ConsentOverlay />
      </SidebarProvider>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="pt-20 px-3 pb-3 sm:px-6 sm:pb-6 min-h-screen bg-[#F8F8F8]">
        <Outlet />
      </div>
      <ConsentOverlay />
    </div>
  );
}
