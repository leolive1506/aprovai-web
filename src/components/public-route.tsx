import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import type { ReactNode } from "react";

interface PublicRouteProps {
    children: ReactNode;
}

export function PublicRoute({ children }: PublicRouteProps) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return null;
    }

    if (isAuthenticated) {
        return <Navigate to="/home" replace />;
    }

    return <>{children}</>;
}
