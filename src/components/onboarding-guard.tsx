import { useAuth } from "@/hooks/use-auth";
import { Navigate } from "react-router-dom";
import { Loading } from "@/components/loading";

interface OnboardingGuardProps {
  children: React.ReactNode;
}

export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const { user, isInitializing, isLoading } = useAuth();

  if (isInitializing || isLoading) {
    return (
      <div className="w-full flex items-center justify-center py-10">
        <Loading className="text-primary size-6" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
