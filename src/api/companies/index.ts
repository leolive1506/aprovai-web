import { apiClient } from "..";
import type {
	Company,
	CompanyInvite,
	CompanyMember,
	CompanyMemberRole,
	CreateCompanyRequest,
	InviteTeamMembersRequest,
	NotificationPreferencesRequest,
	OnboardingStep,
	SetApprovalRuleRequest,
} from "./types";

const baseURL = "/companies";

export const CompaniesApi = {
	create: async (data: CreateCompanyRequest): Promise<Company> => {
		const response = await apiClient.post(baseURL, data);
		return response.data;
	},
	getMine: async (): Promise<Company | null> => {
		const response = await apiClient.get(`${baseURL}/me`);
		return response.data;
	},
	updateOnboardingStep: async (companyId: string, step: OnboardingStep): Promise<Company> => {
		const response = await apiClient.patch(`${baseURL}/${companyId}/onboarding`, { step });
		return response.data;
	},
	inviteTeamMembers: async (companyId: string, data: InviteTeamMembersRequest): Promise<void> => {
		await apiClient.post(`${baseURL}/${companyId}/invites`, data);
	},
	setApprovalRule: async (companyId: string, data: SetApprovalRuleRequest): Promise<void> => {
		await apiClient.put(`${baseURL}/${companyId}/approval-rule`, data);
	},
	updateNotificationPreferences: async (
		companyId: string,
		data: NotificationPreferencesRequest,
	): Promise<Company> => {
		const response = await apiClient.patch(`${baseURL}/${companyId}/notification-preferences`, data);
		return response.data;
	},
	completeOnboarding: async (companyId: string): Promise<Company> => {
		const response = await apiClient.post(`${baseURL}/${companyId}/complete-onboarding`);
		return response.data;
	},
	listMembers: async (companyId: string): Promise<CompanyMember[]> => {
		const response = await apiClient.get(`${baseURL}/${companyId}/members`);
		return response.data;
	},
	listInvites: async (companyId: string): Promise<CompanyInvite[]> => {
		const response = await apiClient.get(`${baseURL}/${companyId}/invites`);
		return response.data;
	},
	cancelInvite: async (companyId: string, inviteId: string): Promise<void> => {
		await apiClient.delete(`${baseURL}/${companyId}/invites/${inviteId}`);
	},
	updateMemberRole: async (companyId: string, memberUserId: string, role: CompanyMemberRole): Promise<void> => {
		await apiClient.patch(`${baseURL}/${companyId}/members/${memberUserId}/role`, { role });
	},
	updateMemberDepartment: async (companyId: string, memberUserId: string, department: string | null): Promise<void> => {
		await apiClient.patch(`${baseURL}/${companyId}/members/${memberUserId}/department`, { department });
	},
	removeMember: async (companyId: string, memberUserId: string): Promise<void> => {
		await apiClient.delete(`${baseURL}/${companyId}/members/${memberUserId}`);
	},
};
