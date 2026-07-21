import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/utils";
import { queryClient } from "../queryClient";
import { CompaniesApi } from ".";
import type {
	CompanyMemberRole,
	CreateCompanyRequest,
	InviteTeamMembersRequest,
	NotificationPreferencesRequest,
	OnboardingStep,
	SetApprovalRuleRequest,
} from "./types";

export function useMyCompany() {
	return useQuery({
		queryKey: ["my-company"],
		queryFn: CompaniesApi.getMine,
	});
}

export function useCreateCompany() {
	return useMutation({
		mutationFn: (data: CreateCompanyRequest) => CompaniesApi.create(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["my-company"] });
		},
		onError: () => toast.error("Erro ao criar empresa. Tente novamente."),
	});
}

export function useUpdateOnboardingStep() {
	return useMutation({
		mutationFn: ({ companyId, step }: { companyId: string; step: OnboardingStep }) =>
			CompaniesApi.updateOnboardingStep(companyId, step),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["my-company"] });
		},
		onError: () => toast.error("Erro ao salvar progresso. Tente novamente."),
	});
}

export function useInviteTeamMembers(companyId: string | undefined) {
	return useMutation({
		mutationFn: (data: InviteTeamMembersRequest) => CompaniesApi.inviteTeamMembers(companyId!, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["company-invites", companyId] });
		},
		onError: (error: unknown) => toast.error(getApiErrorMessage(error, "Erro ao enviar convites.")),
	});
}

export function useSetApprovalRule() {
	return useMutation({
		mutationFn: ({ companyId, data }: { companyId: string; data: SetApprovalRuleRequest }) =>
			CompaniesApi.setApprovalRule(companyId, data),
		onError: () => toast.error("Erro ao salvar regra de aprovação. Tente novamente."),
	});
}

export function useUpdateNotificationPreferences() {
	return useMutation({
		mutationFn: ({ companyId, data }: { companyId: string; data: NotificationPreferencesRequest }) =>
			CompaniesApi.updateNotificationPreferences(companyId, data),
		onError: () => toast.error("Erro ao salvar preferências de notificação. Tente novamente."),
	});
}

export function useCompleteOnboarding() {
	return useMutation({
		mutationFn: (companyId: string) => CompaniesApi.completeOnboarding(companyId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["my-company"] });
		},
		onError: () => toast.error("Erro ao concluir configuração. Tente novamente."),
	});
}

export function useCompanyMembers(companyId: string | undefined) {
	return useQuery({
		queryKey: ["company-members", companyId],
		queryFn: () => CompaniesApi.listMembers(companyId!),
		enabled: !!companyId,
	});
}

export function useCompanyInvites(companyId: string | undefined) {
	return useQuery({
		queryKey: ["company-invites", companyId],
		queryFn: () => CompaniesApi.listInvites(companyId!),
		enabled: !!companyId,
	});
}

export function useCancelInvite(companyId: string | undefined) {
	return useMutation({
		mutationFn: (inviteId: string) => CompaniesApi.cancelInvite(companyId!, inviteId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["company-invites", companyId] });
		},
		onError: (error: unknown) => toast.error(getApiErrorMessage(error, "Erro ao cancelar convite.")),
	});
}

export function useUpdateCompanyMemberRole(companyId: string | undefined) {
	return useMutation({
		mutationFn: ({ memberUserId, role }: { memberUserId: string; role: CompanyMemberRole }) =>
			CompaniesApi.updateMemberRole(companyId!, memberUserId, role),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["company-members", companyId] });
		},
		onError: (error: unknown) => toast.error(getApiErrorMessage(error, "Erro ao alterar cargo.")),
	});
}

export function useUpdateCompanyMemberDepartment(companyId: string | undefined) {
	return useMutation({
		mutationFn: ({ memberUserId, department }: { memberUserId: string; department: string | null }) =>
			CompaniesApi.updateMemberDepartment(companyId!, memberUserId, department),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["company-members", companyId] });
		},
		onError: (error: unknown) => toast.error(getApiErrorMessage(error, "Erro ao alterar departamento.")),
	});
}

export function useRemoveCompanyMember(companyId: string | undefined) {
	return useMutation({
		mutationFn: (memberUserId: string) => CompaniesApi.removeMember(companyId!, memberUserId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["company-members", companyId] });
		},
		onError: (error: unknown) => toast.error(getApiErrorMessage(error, "Erro ao remover membro.")),
	});
}
