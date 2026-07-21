export const OnboardingStep = {
	ACCOUNT: "ACCOUNT",
	COMPANY: "COMPANY",
	TEAM: "TEAM",
	REVIEW: "REVIEW",
	DONE: "DONE",
} as const;

export type OnboardingStep = (typeof OnboardingStep)[keyof typeof OnboardingStep];

export const InviteRole = {
	COLLABORATOR: "COLLABORATOR",
	APPROVER: "APPROVER",
} as const;

export type InviteRole = (typeof InviteRole)[keyof typeof InviteRole];

export const CompanyMemberRole = {
	OWNER: "OWNER",
	COLLABORATOR: "COLLABORATOR",
	APPROVER: "APPROVER",
} as const;

export type CompanyMemberRole = (typeof CompanyMemberRole)[keyof typeof CompanyMemberRole];

export const InviteStatus = {
	PENDING: "PENDING",
	ACCEPTED: "ACCEPTED",
	EXPIRED: "EXPIRED",
} as const;

export type InviteStatus = (typeof InviteStatus)[keyof typeof InviteStatus];

export const ApproverType = {
	DIRECT_MANAGER: "DIRECT_MANAGER",
	FINANCE: "FINANCE",
	DIRECTORS: "DIRECTORS",
} as const;

export type ApproverType = (typeof ApproverType)[keyof typeof ApproverType];

export interface Company {
	id: string;
	name: string;
	slug: string;
	industry: string | null;
	teamSize: string | null;
	onboardingStep: OnboardingStep;
	onboardingDoneAt: string | null;
	notifyByEmail: boolean;
	notifySlack: boolean;
	createdAt: string;
}

export interface CreateCompanyRequest {
	name: string;
	industry?: string;
	teamSize?: string;
}

export interface TeamInviteRequest {
	email: string;
	role: InviteRole;
}

export interface InviteTeamMembersRequest {
	invites: TeamInviteRequest[];
}

export interface SetApprovalRuleRequest {
	thresholdCents: number;
	approverType: ApproverType;
}

export interface NotificationPreferencesRequest {
	notifyByEmail: boolean;
	notifySlack: boolean;
}

export interface CompanyMember {
	id: string;
	userId: string;
	role: CompanyMemberRole;
	userName: string;
	userEmail: string;
	userAvatarUrl: string | null;
	department: string | null;
	createdAt: string;
}

export interface CompanyInvite {
	id: string;
	email: string;
	role: InviteRole;
	status: InviteStatus;
	expiresAt: string;
	createdAt: string;
}
