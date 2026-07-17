import type { GetUserProfileResponse, LoginRequest, RegisterRequest } from "@/api/auth/types";
import type { Cabinet } from "@/api/cabinets/types";

export interface AuthContextType {
  user: GetUserProfileResponse | null;
  cabinet: Cabinet | null;
  isLoading: boolean;
  isInitializing: boolean;
  isAuthenticated: boolean;
  hasRoleAdmin: () => boolean;
  signUp: (data: RegisterRequest) => Promise<void>;
  login: (data: LoginRequest) => Promise<void>;
  handleGoogleLogin: () => Promise<void>;
  logout: () => void;
  updateLocalUser: (data: Partial<GetUserProfileResponse>) => void;
  refreshProfile: () => Promise<void>;
}
