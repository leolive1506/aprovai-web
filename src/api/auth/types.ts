import type { Cabinet } from "../cabinets/types";
import type { UserRole } from "../users/types";

export interface LoginRequest {
	email: string;
	password: string;
}

export interface RegisterRequest {
	name: string;
	email: string;
	password: string;
	termsAccepted: boolean;
}

export interface LoginResponse {
	expiresIn: number;
	accessToken: string;
}

export interface RegisterResponse {
	expiresIn: number;
	accessToken: string;
}

export interface RegisterCabinetRequest {
	cabinetName: string;
	cabinetSlug: string;
	ownerName: string;
	ownerEmail: string;
	ownerPassword: string;
}

export interface RegisterCabinetResponse {
	cabinet: Cabinet;
	user: GetUserProfileResponse;
}
export interface ChangePasswordRequest {
	currentPassword: string;
	newPassword: string;
}

export interface GetUserProfileResponse {
	id: string;
	name: string;
	email: string;
	role: UserRole;
	avatarUrl: string;
	phone: string | null;
	hasSetPassword: boolean;
	isCabinetMember: boolean;
	termsAcceptedAt: string | null;
}