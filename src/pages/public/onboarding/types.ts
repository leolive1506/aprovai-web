export type OnboardingStep = 'account' | 'company' | 'team' | 'review'

export type TeamRole = 'collaborator' | 'approver'

export interface TeamInvite {
	email: string
	role: TeamRole
}

export type NotificationChannel = 'slack' | 'email'

export type ApproverOption = 'Gestor direto' | 'Financeiro' | 'Diretoria'

export interface ApprovalRule {
	threshold: number
	approver: ApproverOption
}

export interface OnboardingData {
	companyName: string
	industry: string
	teamSize: string
	invites: TeamInvite[]
	notificationChannels: NotificationChannel[]
	rule: ApprovalRule
}
