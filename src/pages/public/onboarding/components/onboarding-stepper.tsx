import { cn } from '@/lib/utils'
import type { OnboardingStep } from '../types'

const STEPS: { key: OnboardingStep; label: string }[] = [
	{ key: 'account', label: 'Conta' },
	{ key: 'company', label: 'Empresa' },
	{ key: 'team', label: 'Equipe' },
	{ key: 'review', label: 'Revisão' },
]

interface OnboardingStepperProps {
	current: OnboardingStep
}

export function OnboardingStepper({ current }: OnboardingStepperProps) {
	const currentIndex = STEPS.findIndex((step) => step.key === current)

	return (
		<div className="flex flex-col gap-2">
			<div className="flex gap-1.5">
				{STEPS.map((step, index) => {
					const isComplete = index < currentIndex
					const isCurrent = index === currentIndex

					return (
						<div key={step.key} className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
							<div
								className={cn(
									'h-full rounded-full bg-primary transition-all duration-500 ease-out',
									isComplete && 'w-full',
									isCurrent && 'w-1/2',
									!isComplete && !isCurrent && 'w-0',
								)}
							/>
						</div>
					)
				})}
			</div>
			<div className="flex items-baseline justify-between">
				<span className="text-xs font-semibold text-foreground">
					{STEPS[currentIndex].label}
				</span>
				<span className="text-2xs font-medium text-muted-foreground">
					Passo {currentIndex + 1} de {STEPS.length}
				</span>
			</div>
		</div>
	)
}
