import { DemandStatus } from "@/api/demands/types"

export { PRIORITY_OPTIONS } from "./demand-priority"

export interface ConfigItem {
	label: string
	className: string
	dotClassName?: string
}

export const DEMAND_STATUS_CONFIG: Record<DemandStatus, ConfigItem> = {
	[DemandStatus.SUBMITTED]: {
		label: "Enviada",
		className: "border-slate-200 bg-slate-50 text-slate-600",
		dotClassName: "bg-slate-400",
	},
	[DemandStatus.IN_ANALYSIS]: {
		label: "Em análise",
		className: "border-blue-200 bg-blue-50 text-blue-600",
		dotClassName: "bg-blue-500",
	},
	[DemandStatus.IN_PROGRESS]: {
		label: "Em progresso",
		className: "border-amber-200 bg-amber-50 text-amber-700",
		dotClassName: "bg-amber-500",
	},
	[DemandStatus.RESOLVED]: {
		label: "Resolvida",
		className: "border-emerald-200 bg-emerald-50 text-emerald-700",
		dotClassName: "bg-emerald-500",
	},
	[DemandStatus.REJECTED]: {
		label: "Rejeitada",
		className: "border-red-200 bg-red-50 text-red-600",
		dotClassName: "bg-red-500",
	},
	[DemandStatus.CANCELED]: {
		label: "Cancelada",
		className: "border-zinc-200 bg-zinc-50 text-zinc-500",
		dotClassName: "bg-zinc-400",
	},
}

export const STATUS_OPTIONS = Object.entries(DEMAND_STATUS_CONFIG).map(([value, config]) => ({
	value: value as DemandStatus,
	label: config.label,
}))
