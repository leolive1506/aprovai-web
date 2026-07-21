import Icon from '@/assets/icon.svg'
import { ArrowRight } from 'lucide-react'

interface AccountStepProps {
	onNext: () => void
}

export function AccountStep({ onNext }: AccountStepProps) {
	return (
		<div className="flex flex-col items-center gap-7 text-center">
			<img src={Icon} alt="" className="h-10 w-auto animate-in fade-in zoom-in-95 duration-500" />

			<div>
				<h1 className="text-xl font-bold tracking-tight text-neutral-700 dark:text-neutral-200">
					Sua conta está aprovada
				</h1>
				<p className="mt-1.5 text-sm text-muted-foreground">
					Falta pouco. Agora vamos configurar a empresa que vai usar o AprovIA.
				</p>
			</div>

			<button
				type="button"
				onClick={onNext}
				className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-linear-to-b from-primary to-brand-deep text-sm font-semibold text-white shadow-xs transition-all hover:brightness-110"
			>
				Configurar minha empresa
				<ArrowRight className="size-3.5" />
			</button>
		</div>
	)
}
