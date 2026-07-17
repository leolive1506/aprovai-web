import { apiClient, ApiError } from "@/api";
import { AuthApi } from "@/api/auth";
import type { GetUserProfileResponse, LoginRequest, RegisterRequest } from "@/api/auth/types";
import { CabinetsApi } from "@/api/cabinets";
import { queryClient } from "@/api/queryClient";
import { useState, useEffect, useRef, type ReactNode, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AuthContext } from "./context";
import type { Cabinet } from "@/api/cabinets/types";
import { UserRole } from "@/api/users/types";

const USER_KEY = "@gabinete:user";
const ACCESS_TOKEN_KEY = "@gabinete:access_token";
const CABINET_KEY = "@gabinete:cabinet";

interface AuthProviderProps {
  children: ReactNode;
}

function getStoredAuth() {
  const storedUser = localStorage.getItem(USER_KEY);
  const storedCabinet = localStorage.getItem(CABINET_KEY);

  try {
    return {
      user: storedUser ? JSON.parse(storedUser) : null,
      cabinet: storedCabinet ? JSON.parse(storedCabinet) : null,
    };
  } catch {
    return { user: null, cabinet: null };
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const stored = getStoredAuth();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [cabinet, setCabinet] = useState<Cabinet | null>(() => stored.cabinet);
  const [user, setUser] = useState<GetUserProfileResponse | null>(() => stored.user);
  const [isInitializing, setIsInitializing] = useState<boolean>(() => !!stored.user);
  const isSyncingProfile = useRef(false);

  const navigate = useNavigate();

  const syncProfile = useCallback(async () => {
    if (isSyncingProfile.current) return;

    isSyncingProfile.current = true;
    try {
      const profile = await AuthApi.getUserProfile();
      setUser(profile);
      localStorage.setItem(USER_KEY, JSON.stringify(profile));

      try {
        const userCabinet = await CabinetsApi.me();
        setCabinet(userCabinet);
        if (userCabinet) {
          localStorage.setItem(CABINET_KEY, JSON.stringify(userCabinet));
        } else {
          localStorage.removeItem(CABINET_KEY);
        }
      } catch {
        setCabinet(null);
        localStorage.removeItem(CABINET_KEY);
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setUser(null);
        localStorage.removeItem(USER_KEY);
        setCabinet(null);
        localStorage.removeItem(CABINET_KEY);
      }
    } finally {
      isSyncingProfile.current = false;
      setIsInitializing(false);
    }
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem(USER_KEY);
    if (storedUser) {
      syncProfile();
    }
  }, [syncProfile]);

  const login = async (data: LoginRequest) => {
    setIsLoading(true);
    try {
      const response = await AuthApi.login(data);
      localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
      await syncProfile();
      toast.success("Login realizado com sucesso!");
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get("redirect");
      navigate(redirect?.startsWith("/") ? redirect : "/");
    } catch (error) {
      const apiError = error as { response?: { status?: number; data?: { message?: string | string[] } } };
      const status = apiError.response?.status;
      const rawMessage = apiError.response?.data?.message;
      const message = Array.isArray(rawMessage) ? rawMessage[0] : rawMessage;

      if (status === 403 && message) {
        toast.error(message, {
          description: "Não recebeu o e-mail? Verifique a caixa de spam ou cadastre-se novamente para reenviar.",
        });
      } else {
        toast.error("Erro ao realizar login. Verifique suas credenciais.");
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {

      const hashParams = new URLSearchParams(window.location.hash.slice(1));
      const hashRefreshToken = hashParams.get('rt');
      if (hashRefreshToken) {
        window.history.replaceState({}, '', window.location.pathname);
      }

      const refreshResponse = await apiClient.post(
        '/auth/refresh',
        hashRefreshToken ? { refreshToken: hashRefreshToken } : {},
      );
      if (refreshResponse.data?.accessToken) {
        localStorage.setItem(ACCESS_TOKEN_KEY, refreshResponse.data.accessToken);
      }
      await syncProfile();
      toast.success("Login com Google realizado com sucesso!");
      navigate("/");
    } catch (error) {
      toast.error("Erro ao concluir o login com Google.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (data: RegisterRequest) => {
    setIsLoading(true);
    try {
      await AuthApi.register(data);
      navigate("/");
    } catch (error) {
      toast.error("Erro ao realizar cadastro. Verifique suas credenciais.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AuthApi.logout();
    } catch (error) {
      console.error("Erro ao realizar logout no servidor", error);
    } finally {
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(CABINET_KEY);
      queryClient.clear();
      setUser(null);
      setCabinet(null);
      navigate("/login");
    }
  };

  const updateLocalUser = (data: Partial<GetUserProfileResponse>) => {
    if (user) {
      const updated = { ...user, ...data };
      setUser(updated);
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
    }
  };

  const hasRoleAdmin = useCallback(() => user?.role === UserRole.ADMIN, [user?.role]);

  return (
    <AuthContext.Provider
      value={{
        user,
        cabinet,
        isLoading,
        isInitializing,
        isAuthenticated: !!user,
        hasRoleAdmin,
        signUp,
        login,
        handleGoogleLogin,
        logout,
        updateLocalUser,
        refreshProfile: syncProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
