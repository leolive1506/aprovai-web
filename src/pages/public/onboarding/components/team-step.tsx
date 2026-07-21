import { CurrencyInput } from '@/components/ui/currency-input'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, ArrowRight, Loader2, Plus, X } from 'lucide-react'
import type { ApproverOption, OnboardingData, TeamRole } from '../types'

interface TeamStepProps {
	data: OnboardingData
	onChange: (patch: Partial<OnboardingData>) => void
	onBack: () => void
	onNext: () => void
	isSubmitting?: boolean
}

export function TeamStep({ data, onChange, onBack, onNext, isSubmitting }: TeamStepProps) {
	function updateInvite(index: number, patch: Partial<{ email: string; role: TeamRole }>) {
		const invites = data.invites.map((invite, i) => (i === index ? { ...invite, ...patch } : invite))
		onChange({ invites })
	}

	function addInvite() {
		onChange({ invites: [...data.invites, { email: '', role: 'collaborator' }] })
	}

	function removeInvite(index: number) {
		onChange({ invites: data.invites.filter((_, i) => i !== index) })
	}

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault()
				onNext()
			}}
			className="flex flex-col gap-6"
		>
			<div>
				<h1 className="text-xl font-bold tracking-tight text-neutral-700 dark:text-neutral-200">
					Convide sua equipe
				</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Adicione as pessoas que vão participar do fluxo de aprovação.
				</p>
			</div>

			<div className="flex flex-col gap-2.5">
				{data.invites.map((invite, index) => (
					<div key={index} className="flex items-center gap-2">
						<Input
							type="email"
							placeholder="nome@empresa.com"
							value={invite.email}
							onChange={(e) => updateInvite(index, { email: e.target.value })}
							className="h-10 flex-1 rounded-xl border-border bg-card px-3.5 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-primary/40"
						/>
						<Select value={invite.role} onValueChange={(value) => updateInvite(index, { role: value as TeamRole })}>
							<SelectTrigger className="h-10 w-36 shrink-0 rounded-xl border-border bg-card px-3 text-sm shadow-xs">
								<SelectValue />
							</SelectTrigger>
							<SelectContent position="popper" sideOffset={6}>
								<SelectItem value="collaborator">Colaborador</SelectItem>
								<SelectItem value="approver">Aprovador</SelectItem>
							</SelectContent>
						</Select>
						<button
							type="button"
							onClick={() => removeInvite(index)}
							disabled={data.invites.length === 1}
							className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-destructive disabled:pointer-events-none disabled:opacity-30"
							aria-label="Remover convite"
						>
							<X className="size-3.5" />
						</button>
					</div>
				))}

				<button
					type="button"
					onClick={addInvite}
					className="flex w-fit cursor-pointer items-center gap-1.5 text-xs font-medium text-primary transition-colors hover:text-primary/80"
				>
					<Plus className="size-3.5" />
					Adicionar outro
				</button>
			</div>

			<div className="flex flex-col gap-4 rounded-xl border border-border bg-muted/20 p-4">
				<div>
					<Label className="text-xs font-semibold text-foreground">Regra de valor sugerida</Label>
					<p className="mt-0.5 text-2xs text-muted-foreground">Ajuste conforme necessário. Você pode mudar isso depois.</p>
				</div>

				<div className="grid grid-cols-2 gap-3">
					<div className="flex flex-col gap-1.5">
						<Label htmlFor="threshold" className="text-2xs font-medium text-muted-foreground">
							Pedidos acima de
						</Label>
						<CurrencyInput
							id="threshold"
							value={data.rule.threshold}
							onValueChange={(threshold) => onChange({ rule: { ...data.rule, threshold } })}
							className="h-10 rounded-lg border-border bg-card shadow-xs"
						/>
					</div>

					<div className="flex flex-col gap-1.5">
						<Label htmlFor="approver" className="text-2xs font-medium text-muted-foreground">
							Precisam de aprovação de
						</Label>
						<Select value={data.rule.approver} onValueChange={(value) => onChange({ rule: { ...data.rule, approver: value as ApproverOption } })}>
							<SelectTrigger id="approver" className="h-10 w-full rounded-lg border-border bg-card px-2.5 text-sm shadow-xs">
								<SelectValue />
							</SelectTrigger>
							<SelectContent position="popper" sideOffset={6}>
								<SelectItem value="Gestor direto">Gestor direto</SelectItem>
								<SelectItem value="Financeiro">Financeiro</SelectItem>
								<SelectItem value="Diretoria">Diretoria</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
			</div>

			<div className="flex items-center justify-between border-t border-border pt-4">
				<button
					type="button"
					onClick={onBack}
					disabled={isSubmitting}
					className="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
				>
					<ArrowLeft className="size-3" />
					Voltar
				</button>
				<button
					type="submit"
					disabled={isSubmitting}
					className="flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-linear-to-b from-primary to-brand-deep px-5 text-sm font-semibold text-white shadow-xs transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{isSubmitting && <Loader2 className="size-3.5 animate-spin" />}
					Continuar
					{!isSubmitting && <ArrowRight className="size-3.5" />}
				</button>
			</div>
		</form>
	)
}
