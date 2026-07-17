import { DatePicker } from "@/components/ui/date-picker"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DemandPriority, DemandStatus } from "@/api/demands/types"
import {
    AlertCircleIcon,
    ChevronDownIcon,
    FilterIcon,
    XIcon,
} from "lucide-react"
import type { DateRange } from "react-day-picker"
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from "./demand-utils"

interface DemandsFilterProps {
    status: DemandStatus | null
    onStatusChange: (status: DemandStatus | null) => void
    priority: DemandPriority | null
    onPriorityChange: (priority: DemandPriority | null) => void
    dateRange: DateRange | undefined
    onDateRangeChange: (range: DateRange | undefined) => void
    onClearAll: () => void
}

export function DemandsFilter({
    status,
    onStatusChange,
    priority,
    onPriorityChange,
    dateRange,
    onDateRangeChange,
    onClearAll,
}: DemandsFilterProps) {
    const hasFilters = status || priority || dateRange?.from

    return (
        <div className="flex items-center gap-2 flex-wrap">
            <div className="h-5 w-px bg-zinc-200 mx-1" />

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className={`inline-flex items-center gap-1.5 px-3 rounded-lg text-sm font-medium border transition-all cursor-pointer ${status
                        ? "bg-primary/10 border-primary/25 text-primary"
                        : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"
                        }`}>
                        <FilterIcon className="size-3.5 shrink-0" />
                        {status ? STATUS_OPTIONS.find(o => o.value === status)?.label : "Status"}
                        {status ? (
                            <span
                                onClick={e => { e.stopPropagation(); onStatusChange(null) }}
                                className="ml-0.5 size-4 rounded-full flex items-center justify-center hover:bg-primary/20 transition-colors"
                            >
                                <XIcon className="size-2.5" />
                            </span>
                        ) : (
                            <ChevronDownIcon className="size-3.5 opacity-60" />
                        )}
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-40">
                    {STATUS_OPTIONS.map(opt => (
                        <DropdownMenuItem
                            key={opt.value}
                            onClick={() => onStatusChange(opt.value)}
                            className={`cursor-pointer ${status === opt.value ? "text-primary font-semibold" : ""}`}
                        >
                            {opt.label}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className={`inline-flex items-center gap-1.5 px-3 rounded-lg text-sm font-medium border transition-all cursor-pointer ${priority
                        ? "bg-primary/10 border-primary/25 text-primary"
                        : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"
                        }`}>
                        <AlertCircleIcon className="size-3.5 shrink-0" />
                        {priority ? PRIORITY_OPTIONS.find(o => o.value === priority)?.label : "Prioridade"}
                        {priority ? (
                            <span
                                onClick={e => { e.stopPropagation(); onPriorityChange(null) }}
                                className="ml-0.5 size-4 rounded-full flex items-center justify-center hover:bg-primary/20 transition-colors"
                            >
                                <XIcon className="size-2.5" />
                            </span>
                        ) : (
                            <ChevronDownIcon className="size-3.5 opacity-60" />
                        )}
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-40">
                    {PRIORITY_OPTIONS.map(opt => (
                        <DropdownMenuItem
                            key={opt.value}
                            onClick={() => onPriorityChange(opt.value)}
                            className={`cursor-pointer ${priority === opt.value ? "text-primary font-semibold" : ""}`}
                        >
                            {opt.label}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            <DatePicker
                placeholder="Data"
                selected={dateRange}
                onSelect={onDateRangeChange}
            />

            {hasFilters && (
                <button
                    onClick={onClearAll}
                    className="inline-flex items-center gap-1.5 px-3 rounded-lg text-sm font-medium text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                >
                    <XIcon className="size-3.5" />
                    Limpar
                </button>
            )}
        </div>
    )
}
