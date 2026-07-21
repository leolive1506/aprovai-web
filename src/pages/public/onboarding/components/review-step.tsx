import { cn, formatCurrencyBRL } from '@/lib/utils'
import { ArrowLeft, Building2, Loader2, Mail, ShieldCheck, Users } from 'lucide-react'
import type { NotificationChannel, OnboardingData } from '../types'

interface ReviewStepProps {
	data: OnboardingData
	onChange: (patch: Partial<OnboardingData>) => void
	onBack: () => void
	onFinish: () => void
	isFinishing: boolean
}

function SlackIcon({ className }: { className?: string }) {
	return (
		<svg viewBox="0 0 122.8 122.8" className={className} xmlns="http://www.w3.org/2000/svg">
			<path
				d="M25.8 77.6c0 7.1-5.8 12.9-12.9 12.9S0 84.7 0 77.6s5.8-12.9 12.9-12.9h12.9v12.9z"
				fill="#E01E5A"
			/>
			<path
				d="M32.3 77.6c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9v32.3c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V77.6z"
				fill="#E01E5A"
			/>
			<path
				d="M45.2 25.8c-7.1 0-12.9-5.8-12.9-12.9S38.1 0 45.2 0s12.9 5.8 12.9 12.9v12.9H45.2z"
				fill="#36C5F0"
			/>
			<path
				d="M45.2 32.3c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H12.9C5.8 58.1 0 52.3 0 45.2s5.8-12.9 12.9-12.9h32.3z"
				fill="#36C5F0"
			/>
			<path
				d="M97 45.2c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9-5.8 12.9-12.9 12.9H97V45.2z"
				fill="#2EB67D"
			/>
			<path
				d="M90.5 45.2c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V12.9C64.7 5.8 70.5 0 77.6 0s12.9 5.8 12.9 12.9v32.3z"
				fill="#2EB67D"
			/>
			<path
				d="M77.6 97c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9-12.9-5.8-12.9-12.9V97h12.9z"
				fill="#ECB22E"
			/>
			<path
				d="M77.6 90.5c-7.1 0-12.9-5.8-12.9-12.9s5.8-12.9 12.9-12.9h32.3c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H77.6z"
				fill="#ECB22E"
			/>
		</svg>
	)
}

function toggleChannel(channels: NotificationChannel[], channel: NotificationChannel) {
	return channels.includes(channel)
		? channels.filter((c) => c !== channel)
		: [...channels, channel]
}

export function ReviewStep({ data, onChange, onBack, onFinish, isFinishing }: ReviewStepProps) {
	const filledInvites = data.invites.filter((invite) => invite.email.trim().length > 0)

	return (
		<div className="flex flex-col gap-6">
			<div>
				<h1 className="text-xl font-bold tracking-tight text-neutral-700 dark:text-neutral-200">
					Revise antes de começar
				</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Confira o que vamos configurar. Nada aqui é definitivo.
				</p>
			</div>

			<div className="rounded-xl border border-border bg-card">
				<div className="flex items-center gap-3 border-b border-border px-4 py-3.5">
					<Building2 className="size-4 shrink-0 text-muted-foreground" />
					<div className="min-w-0">
						<p className="truncate text-sm font-semibold text-foreground">
							{data.companyName || 'Sua empresa'}
						</p>
						<p className="truncate text-xs text-muted-foreground">
							{[data.industry, data.teamSize && `${data.teamSize} pessoas`].filter(Boolean).join(' · ') || '—'}
						</p>
					</div>
				</div>

				<div className="flex items-center gap-3 border-b border-border px-4 py-3.5">
					<Users className="size-4 shrink-0 text-muted-foreground" />
					<div className="min-w-0">
						<p className="text-sm font-medium text-foreground">
							{filledInvites.length > 0
								? `${filledInvites.length} ${filledInvites.length === 1 ? 'convite' : 'convites'} pendente${filledInvites.length === 1 ? '' : 's'}`
								: 'Nenhum convite enviado ainda'}
						</p>
						<p className="text-xs text-muted-foreground">Podem entrar como colaborador ou aprovador</p>
					</div>
				</div>

				<div className="flex items-center gap-3 px-4 py-3.5">
					<ShieldCheck className="size-4 shrink-0 text-muted-foreground" />
					<div className="min-w-0">
						<p className="text-sm font-medium text-foreground">
							Acima de {formatCurrencyBRL(data.rule.threshold)}
						</p>
						<p className="text-xs text-muted-foreground">Precisa de aprovação de {data.rule.approver}</p>
					</div>
				</div>
			</div>

			<div>
				<span className="text-2xs font-semibold uppercase tracking-widest text-muted-foreground">
					Onde avisar sua equipe
				</span>

				<div className="mt-2.5 flex flex-col divide-y divide-border rounded-xl border border-border bg-card">
					<button
						type="button"
						onClick={() => onChange({ notificationChannels: toggleChannel(data.notificationChannels, 'slack') })}
						className="flex cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40"
					>
						<SlackIcon className="size-5 shrink-0" />
						<div className="min-w-0 flex-1">
							<p className="text-sm font-medium text-foreground">Slack</p>
							<p className="text-xs text-muted-foreground">Alertas direto nos canais da empresa</p>
						</div>
						<span
							className={cn(
								'flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors duration-200',
								data.notificationChannels.includes('slack') ? 'border-primary bg-primary' : 'border-border bg-muted',
							)}
						>
							<span
								className={cn(
									'size-3.5 rounded-full bg-white shadow-sm transition-transform duration-200',
									data.notificationChannels.includes('slack') ? 'translate-x-4.5' : 'translate-x-0.5',
								)}
							/>
						</span>
					</button>

					<button
						type="button"
						onClick={() => onChange({ notificationChannels: toggleChannel(data.notificationChannels, 'email') })}
						className="flex cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40"
					>
						<div className="flex size-5 shrink-0 items-center justify-center text-muted-foreground">
							<Mail className="size-4.5" />
						</div>
						<div className="min-w-0 flex-1">
							<p className="text-sm font-medium text-foreground">E-mail</p>
							<p className="text-xs text-muted-foreground">Enviado para o e-mail cadastrado</p>
						</div>
						<span
							className={cn(
								'flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors duration-200',
								data.notificationChannels.includes('email') ? 'border-primary bg-primary' : 'border-border bg-muted',
							)}
						>
							<span
								className={cn(
									'size-3.5 rounded-full bg-white shadow-sm transition-transform duration-200',
									data.notificationChannels.includes('email') ? 'translate-x-4.5' : 'translate-x-0.5',
								)}
							/>
						</span>
					</button>
				</div>
			</div>

			<div className="flex items-center justify-between border-t border-border pt-4">
				<button
					type="button"
					onClick={onBack}
					disabled={isFinishing}
					className="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
				>
					<ArrowLeft className="size-3" />
					Voltar
				</button>
				<button
					type="button"
					onClick={onFinish}
					disabled={isFinishing}
					className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-linear-to-b from-primary to-brand-deep px-5 text-sm font-semibold text-white shadow-xs transition-all hover:brightness-110 disabled:opacity-70"
				>
					{isFinishing && <Loader2 className="size-4 animate-spin" />}
					{isFinishing ? 'Preparando seu workspace...' : 'Concluir configuração'}
				</button>
			</div>
		</div>
	)
}
