import { QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { BrowserRouter } from "react-router-dom";
import { queryClient } from "./api/queryClient";
import { SplashScreen } from "./components/ui/splash-screen";
import { Toaster } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { useAuth } from "./hooks/use-auth";
import { PageTitleProvider } from "./contexts/page-title-context";
import { AppRouter } from "./routes/app-router";
import { AuthProvider } from "./contexts/auth-context";
import { SocketProvider } from "./contexts/socket-context";
import { NavigationCityProvider } from "./contexts/navigation-city-context";
import { usePageTracking } from "./hooks/use-page-tracking";

function AppContent() {
  const { isInitializing } = useAuth();
  const [splashDone, setSplashDone] = useState(false);

  usePageTracking();

  if (!splashDone || isInitializing) {
    return (
      <SplashScreen
        onFinish={() => setSplashDone(true)}
        loading={isInitializing}
      />
    );
  }

  return (
    <>
      <AppRouter />
      <Toaster closeButton position="top-right" />
    </>
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <SocketProvider>
            <NavigationCityProvider>
              <TooltipProvider>
                <PageTitleProvider>
                  <AppContent />
                </PageTitleProvider>
              </TooltipProvider>
            </NavigationCityProvider>
          </SocketProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
