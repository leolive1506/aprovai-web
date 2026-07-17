import { useAuth } from "@/hooks/use-auth";
import { UserRole } from "@/api/users/types";
import { Navigate, useNavigate } from "react-router-dom";
import { Loading } from "@/components/loading";
import { useEffect } from "react";

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallback?: string;
}

export function ProtectedRoute({
  allowedRoles,
  children,
  fallback = "/",
}: ProtectedRouteProps) {
  const { user, isInitializing, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    function handleSessionExpired() {
      navigate("/login", { replace: true });
    }
    window.addEventListener("auth:unauthorized", handleSessionExpired);
    return () => window.removeEventListener("auth:unauthorized", handleSessionExpired);
  }, [navigate]);

  if (isInitializing || isLoading) {
    return (
      <div className="w-full flex items-center justify-center py-10">
        <Loading className="text-primary size-6" />
      </div>
    );
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
}
