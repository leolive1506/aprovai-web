import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { AuthApi } from ".";
import type { RegisterRequest, ChangePasswordRequest } from "./types";

export function useForgotPassword() {
	return useMutation({
		mutationFn: (email: string) => AuthApi.forgotPassword(email)
	})
}

export function useResetPassword() {
	return useMutation({
		mutationFn: (data: { token: string; password: string }) => AuthApi.resetPassword(data)
	})
}

export function useChangePassword() {
	return useMutation({
		mutationFn: (data: ChangePasswordRequest) => AuthApi.changePassword(data)
	})
}

export function useVerifyEmail() {
	return useMutation({
		mutationFn: (token: string) => AuthApi.verifyEmail(token)
	})
}

export function useRegister() {
	return useMutation({
		mutationFn: (data: RegisterRequest) => AuthApi.register(data),
		onSuccess: () => {
			toast.success("Conta criada! Vamos configurar sua empresa.");
		}
	})
}

export function useGetUserProfile() {
	return useQuery({
		queryKey: ["user-profile"],
		queryFn: () => AuthApi.getUserProfile()
	})
}
