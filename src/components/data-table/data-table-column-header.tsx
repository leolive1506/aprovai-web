import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Column } from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react'

interface DataTableColumnHeaderProps<TData, TValue> {
	column: Column<TData, TValue>
	title: string
	className?: string
}

export function DataTableColumnHeader<TData, TValue>({
	column,
	title,
	className,
}: DataTableColumnHeaderProps<TData, TValue>) {
	if (!column.getCanSort()) {
		return (
			<span className={cn('h-10 font-semibold uppercase tracking-[0.09em] text-muted-foreground/60', className)}>
				{title}
			</span>
		)
	}

	return (
		<Button
			variant="ghost"
			className={cn(
				"px-0 text-left align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0 *:[[role=checkbox]]:translate-y-0.5",
				column.getIsSorted() && 'text-primary',
				className,
			)}
			onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
		>
			{title}
			{column.getIsSorted() === 'asc' ? (
				<ArrowUp data-icon="inline-end" className="size-4 text-primary" />
			) : column.getIsSorted() === 'desc' ? (
				<ArrowDown data-icon="inline-end" className="size-4 text-primary" />
			) : (
				<ChevronsUpDown
					data-icon="inline-end"
					className="size-3 text-muted-foreground/30 transition-opacity group-hover:opacity-100"
				/>
			)}
		</Button>
	)
}
