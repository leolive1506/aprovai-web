import { Layout } from "@/components/layout";
import { ProtectedRoute } from "@/components/protected-route";
import { OnboardingGuard } from "@/components/onboarding-guard";
import { UserRole } from "@/api/users/types";
import { Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

import { Login } from "@/pages/public/login";
import { SignUp } from "@/pages/public/sign-up";
import { Onboarding } from "@/pages/public/onboarding";
import { ForgotPassword } from "@/pages/public/forgot-password";
import { ResetPassword } from "@/pages/public/reset-password";
import { VerifyEmail } from "@/pages/public/verify-email";
import { GoogleCallback } from "@/pages/public/google-callback";
import { ConfirmPasswordPage } from "@/pages/public/confirm-password";
import { Admin } from "@/pages/admin";
import { AdminUsers } from "@/pages/admin/users";
import { AdminPlans } from "@/pages/admin/plans";

const TermsOfUsePage = lazy(() => import("@/pages/public/terms-of-use").then((m) => ({ default: m.TermsOfUsePage })));
const PrivacyPolicyPage = lazy(() => import("@/pages/public/privacy-policy").then((m) => ({ default: m.PrivacyPolicyPage })));

const Settings = lazy(() => import("@/pages/settings").then((m) => ({ default: m.Settings })));
const Profile = lazy(() => import("@/pages/profile").then((m) => ({ default: m.Profile })));

const Home = lazy(() => import("@/pages/private/home").then((m) => ({ default: m.Home })));
const Team = lazy(() => import("@/pages/private/team").then((m) => ({ default: m.Team })));

const onlyCompanyUser = [UserRole.COMPANY];
const onlyAdmin = [UserRole.ADMIN];

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-32">
      <Loader2 className="size-5 animate-spin text-muted-foreground" />
    </div>
  );
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/sign-up" element={<SignUp />} />
      <Route
        path="/onboarding"
        element={
          <OnboardingGuard>
            <Onboarding />
          </OnboardingGuard>
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/auth/callback" element={<GoogleCallback />} />
      <Route path="/confirm-password" element={<ConfirmPasswordPage />} />
      <Route
        path="/termos-de-uso"
        element={<Suspense fallback={<PageLoader />}><TermsOfUsePage /></Suspense>}
      />
      <Route
        path="/politica-de-privacidade"
        element={<Suspense fallback={<PageLoader />}><PrivacyPolicyPage /></Suspense>}
      />
      <Route path="/" element={<Layout />}>
        <Route
          path="settings"
          element={<Suspense fallback={<PageLoader />}><Settings /></Suspense>}
        />
        <Route
          path="profile/:userId"
          element={<Suspense fallback={<PageLoader />}><Profile /></Suspense>}
        />

        <Route
          path="admin"
          element={
            <ProtectedRoute allowedRoles={onlyAdmin}>
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/users"
          element={
            <ProtectedRoute allowedRoles={onlyAdmin}>
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/plans"
          element={
            <ProtectedRoute allowedRoles={onlyAdmin}>
              <AdminPlans />
            </ProtectedRoute>
          }
        />

        <Route
          path="home"
          element={
            <ProtectedRoute allowedRoles={onlyCompanyUser}>
              <Suspense fallback={<PageLoader />}>
                <Home />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="equipe"
          element={
            <ProtectedRoute allowedRoles={onlyCompanyUser}>
              <Suspense fallback={<PageLoader />}>
                <Team />
              </Suspense>
            </ProtectedRoute>
          }
        />
      </Route>

    </Routes>
  );
}
