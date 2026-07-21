import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'
import type { OnboardingData } from '../types'

const INDUSTRIES = [
	'Tecnologia',
	'Indústria',
	'Varejo e comércio',
	'Serviços financeiros',
	'Saúde',
	'Educação',
	'Construção',
	'Outro',
]

const TEAM_SIZES = ['1-10', '11-50', '51-200', '200+']

interface CompanyStepProps {
	data: OnboardingData
	onChange: (patch: Partial<OnboardingData>) => void
	onBack: () => void
	onNext: () => void
	isSubmitting?: boolean
}

export function CompanyStep({ data, onChange, onBack, onNext, isSubmitting }: CompanyStepProps) {
	const canContinue = data.companyName.trim().length > 0 && data.industry.length > 0 && data.teamSize.length > 0

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault()
				if (canContinue) onNext()
			}}
			className="flex flex-col gap-5"
		>
			<div>
				<h1 className="text-xl font-bold tracking-tight text-neutral-700 dark:text-neutral-200">
					Fale sobre sua empresa
				</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Usamos isso pra configurar os fluxos de aprovação certos pra você.
				</p>
			</div>

			<div className="flex flex-col gap-1.5">
				<Label htmlFor="companyName" className="text-xs font-medium text-foreground">
					Nome da empresa
				</Label>
				<Input
					id="companyName"
					autoFocus
					placeholder="Acme Ltda"
					value={data.companyName}
					onChange={(e) => onChange({ companyName: e.target.value })}
					className="h-11 rounded-xl border-border bg-card px-3.5 shadow-xs transition-shadow focus-visible:ring-2 focus-visible:ring-primary/40"
				/>
			</div>

			<div className="flex flex-col gap-1.5">
				<Label htmlFor="industry" className="text-xs font-medium text-foreground">
					Setor
				</Label>
				<Select value={data.industry} onValueChange={(value) => onChange({ industry: value })}>
					<SelectTrigger
						id="industry"
						className="h-11 w-full rounded-xl border-border bg-card px-3.5 text-sm shadow-xs data-placeholder:text-muted-foreground"
					>
						<SelectValue placeholder="Selecione o setor..." />
					</SelectTrigger>
					<SelectContent position="popper" sideOffset={6}>
						{INDUSTRIES.map((industry) => (
							<SelectItem key={industry} value={industry}>
								{industry}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="flex flex-col gap-1.5">
				<Label className="text-xs font-medium text-foreground">Tamanho aproximado da equipe</Label>
				<div className="flex flex-wrap gap-2">
					{TEAM_SIZES.map((size) => (
						<button
							key={size}
							type="button"
							onClick={() => onChange({ teamSize: size })}
							className={cn(
								'h-9 cursor-pointer rounded-full border px-4 text-sm font-medium transition-colors duration-150',
								data.teamSize === size
									? 'border-primary bg-primary/10 text-primary'
									: 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground',
							)}
						>
							{size}
						</button>
					))}
				</div>
			</div>

			<div className="mt-2 flex items-center justify-between border-t border-border pt-4">
				<button
					type="button"
					onClick={onBack}
					className="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
				>
					<ArrowLeft className="size-3" />
					Voltar
				</button>
				<button
					type="submit"
					disabled={!canContinue || isSubmitting}
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
