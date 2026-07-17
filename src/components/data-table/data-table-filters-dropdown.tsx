import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Filter } from 'lucide-react'
import type { DataTableFilterField } from './types'

interface DataTableFiltersDropdownProps {
	filterFields: DataTableFilterField[]
	onAdd: (fieldId: string) => void
	activeCount: number
}

export function DataTableFiltersDropdown({
	filterFields,
	onAdd,
	activeCount,
}: DataTableFiltersDropdownProps) {
	if (filterFields.length === 0) return null

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					className="h-8 gap-1.5"
					data-active={activeCount > 0 || undefined}
				>
					<Filter data-icon="inline-start" className="size-3.5" />
					Ver filtros
					{activeCount > 0 && (
						<span className="-mr-0.5 flex size-4.5 items-center justify-center rounded-full bg-primary text-2xs font-semibold tabular-nums text-primary-foreground">
							{activeCount}
						</span>
					)}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start" className="min-w-50">
				{filterFields.map((field) => (
					<DropdownMenuItem key={field.id} onSelect={() => onAdd(field.id)}>
						{field.label}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
