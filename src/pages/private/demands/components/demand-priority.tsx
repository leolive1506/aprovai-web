import { cn } from "@/lib/utils"
import { DemandPriority as DemandPriorityType } from "@/api/demands/types"
import { cva, type VariantProps } from "class-variance-authority"
import { ZapIcon } from "lucide-react"

export const variants = cva(
	"inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
	{
		variants: {
			variant: {
				[DemandPriorityType.URGENT]: "border-red-200 bg-red-50 text-red-600",
				[DemandPriorityType.HIGH]: "border-orange-200 bg-orange-50 text-orange-600",
				[DemandPriorityType.MEDIUM]: "border-blue-200 bg-blue-50 text-blue-600",
				[DemandPriorityType.LOW]: "border-zinc-200 bg-zinc-50 text-zinc-600",
			},
		},
		defaultVariants: {
			variant: DemandPriorityType.LOW,
		},
	}
)

export const PRIORITY_LABELS: Record<DemandPriorityType, string> = {
	[DemandPriorityType.URGENT]: "Urgente",
	[DemandPriorityType.HIGH]: "Alta",
	[DemandPriorityType.MEDIUM]: "Média",
	[DemandPriorityType.LOW]: "Baixa",
}

export const PRIORITY_OPTIONS = Object.entries(PRIORITY_LABELS).map(([value, label]) => ({
	value: value as DemandPriorityType,
	label,
}))

interface DemandPriorityProps extends VariantProps<typeof variants> {
	variant: DemandPriorityType
	className?: string
}

export function DemandPriority({ variant, className }: DemandPriorityProps) {
	return (
		<span className={cn(variants({ variant }), className)}>
			{variant === DemandPriorityType.URGENT && <ZapIcon className="size-2.5 animate-pulse" />}
			{PRIORITY_LABELS[variant]}
		</span>
	)
}
