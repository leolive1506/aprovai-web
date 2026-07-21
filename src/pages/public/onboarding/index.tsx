import Logo from '@/assets/aprovai.svg'
import { useCompleteOnboarding, useCreateCompany, useInviteTeamMembers, useMyCompany, useSetApprovalRule, useUpdateNotificationPreferences, useUpdateOnboardingStep } from '@/api/companies/hooks'
import { ApproverType, InviteRole, OnboardingStep as BackendOnboardingStep } from '@/api/companies/types'
import { cn } from '@/lib/utils'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { AccountStep } from './components/account-step'
import { CompanyStep } from './components/company-step'
import { OnboardingStepper } from './components/onboarding-stepper'
import { ReviewStep } from './components/review-step'
import { TeamStep } from './components/team-step'
import type { ApproverOption, OnboardingData, OnboardingStep, TeamRole } from './types'

const STEP_ORDER: OnboardingStep[] = ['account', 'company', 'team', 'review']

const INITIAL_DATA: OnboardingData = {
	companyName: '',
	industry: '',
	teamSize: '',
	invites: [{ email: '', role: 'collaborator' }],
	notificationChannels: ['email'],
	rule: { threshold: 1000, approver: 'Gestor direto' },
}

const BACKEND_STEP_BY_UI_STEP: Record<OnboardingStep, BackendOnboardingStep> = {
	account: BackendOnboardingStep.ACCOUNT,
	company: BackendOnboardingStep.COMPANY,
	team: BackendOnboardingStep.TEAM,
	review: BackendOnboardingStep.REVIEW,
}

const UI_STEP_BY_BACKEND_STEP: Partial<Record<BackendOnboardingStep, OnboardingStep>> = {
	[BackendOnboardingStep.ACCOUNT]: 'account',
	[BackendOnboardingStep.COMPANY]: 'company',
	[BackendOnboardingStep.TEAM]: 'team',
	[BackendOnboardingStep.REVIEW]: 'review',
}

const INVITE_ROLE_BY_TEAM_ROLE: Record<TeamRole, InviteRole> = {
	collaborator: InviteRole.COLLABORATOR,
	approver: InviteRole.APPROVER,
}

const APPROVER_TYPE_BY_OPTION: Record<ApproverOption, ApproverType> = {
	'Gestor direto': ApproverType.DIRECT_MANAGER,
	'Financeiro': ApproverType.FINANCE,
	'Diretoria': ApproverType.DIRECTORS,
}

export function Onboarding() {
	const navigate = useNavigate()
	const { data: myCompany, isLoading: isLoadingCompany } = useMyCompany()
	const [step, setStep] = useState<OnboardingStep>('account')
	const [data, setData] = useState<OnboardingData>(INITIAL_DATA)
	const [companyId, setCompanyId] = useState<string | null>(null)
	const [isFinishing, setIsFinishing] = useState(false)

	const { mutateAsync: createCompany, isPending: isCreatingCompany } = useCreateCompany()
	const { mutateAsync: updateOnboardingStep, isPending: isUpdatingStep } = useUpdateOnboardingStep()
	const { mutateAsync: inviteTeamMembers, isPending: isInvitingTeam } = useInviteTeamMembers(companyId ?? undefined)
	const { mutateAsync: setApprovalRule, isPending: isSavingRule } = useSetApprovalRule()
	const { mutateAsync: updateNotificationPreferences } = useUpdateNotificationPreferences()
	const { mutateAsync: completeOnboarding } = useCompleteOnboarding()

	const isSubmittingTeamStep = isInvitingTeam || isSavingRule || isUpdatingStep
	const hasResumedRef = useRef(false)

	useEffect(() => {
		if (!myCompany || hasResumedRef.current) return
		hasResumedRef.current = true
		if (myCompany.onboardingStep === BackendOnboardingStep.DONE) {
			navigate('/home', { replace: true })
			return
		}
		setCompanyId(myCompany.id)
		setData((prev) => ({
			...prev,
			companyName: myCompany.name,
			industry: myCompany.industry ?? '',
			teamSize: myCompany.teamSize ?? '',
		}))
		const resumedStep = UI_STEP_BY_BACKEND_STEP[myCompany.onboardingStep]
		if (resumedStep) setStep(resumedStep)
	}, [myCompany, navigate])

	function goTo(target: OnboardingStep) {
		setStep(target)
	}

	function updateData(patch: Partial<OnboardingData>) {
		setData((prev) => ({ ...prev, ...patch }))
	}

	function handleAccountNext() {
		goTo('company')
	}

	async function handleCompanyNext() {
		try {
			if (!companyId) {
				const company = await createCompany({
					name: data.companyName,
					industry: data.industry,
					teamSize: data.teamSize,
				})
				setCompanyId(company.id)
			} else {
				await updateOnboardingStep({ companyId, step: BACKEND_STEP_BY_UI_STEP.team })
			}
			goTo('team')
		} catch {
			return
		}
	}

	async function handleTeamNext() {
		if (!companyId) return
		try {
			const filledInvites = data.invites.filter((invite) => invite.email.trim().length > 0)
			if (filledInvites.length > 0) {
				await inviteTeamMembers({
					invites: filledInvites.map((invite) => ({
						email: invite.email,
						role: INVITE_ROLE_BY_TEAM_ROLE[invite.role],
					})),
				})
			}
			await setApprovalRule({
				companyId,
				data: {
					thresholdCents: Math.round(data.rule.threshold * 100),
					approverType: APPROVER_TYPE_BY_OPTION[data.rule.approver],
				},
			})
			await updateOnboardingStep({ companyId, step: BACKEND_STEP_BY_UI_STEP.review })
			goTo('review')
		} catch {
			return
		}
	}

	function goBackOffset() {
		const currentIndex = STEP_ORDER.indexOf(step)
		if (currentIndex > 0) setStep(STEP_ORDER[currentIndex - 1])
	}

	async function handleFinish() {
		if (!companyId) return
		setIsFinishing(true)
		try {
			await updateNotificationPreferences({
				companyId,
				data: {
					notifyByEmail: data.notificationChannels.includes('email'),
					notifySlack: data.notificationChannels.includes('slack'),
				},
			})
			await completeOnboarding(companyId)
			navigate('/home')
		} catch {
			toast.error('Erro ao concluir configuração. Tente novamente.')
		} finally {
			setIsFinishing(false)
		}
	}

	if (isLoadingCompany) {
		return null
	}

	return (
		<div className="flex min-h-screen w-full items-center justify-center bg-[#fbfaf9] p-4 dark:bg-neutral-950">
			<div className="w-full max-w-md">
				{step !== 'account' && (
					<div className="flex flex-col items-center">
						<img src={Logo} alt="AprovIA" className="h-7 w-auto" />
					</div>
				)}

				<div className={cn('rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8', step !== 'account' && 'mt-8')}>
					{step !== 'account' && (
						<div className="mb-8">
							<OnboardingStepper current={step} />
						</div>
					)}

					<div key={step} className="animate-in fade-in slide-in-from-right-2 duration-300 ease-out">
						{step === 'account' && <AccountStep onNext={handleAccountNext} />}

						{step === 'company' && (
							<CompanyStep
								data={data}
								onChange={updateData}
								onBack={() => goTo('account')}
								onNext={handleCompanyNext}
								isSubmitting={isCreatingCompany}
							/>
						)}

						{step === 'team' && (
							<TeamStep
								data={data}
								onChange={updateData}
								onBack={goBackOffset}
								onNext={handleTeamNext}
								isSubmitting={isSubmittingTeamStep}
							/>
						)}

						{step === 'review' && (
							<ReviewStep
								data={data}
								onChange={updateData}
								onBack={goBackOffset}
								onFinish={handleFinish}
								isFinishing={isFinishing}
							/>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}
