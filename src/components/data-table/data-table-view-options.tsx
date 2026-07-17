import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { Table } from '@tanstack/react-table'
import { Check, Columns3 } from 'lucide-react'
import { DropdownMenu as DropdownMenuPrimitive } from 'radix-ui'

interface DataTableViewOptionsProps<TData> {
	table: Table<TData>
}

export function DataTableViewOptions<TData>({
	table,
}: DataTableViewOptionsProps<TData>) {
	const columns = table.getAllColumns().filter((col) => col.getCanHide())

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline">
					<Columns3 data-icon="inline-start" />
					Colunas
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="min-w-40">
				<DropdownMenuLabel>Personalizar colunas</DropdownMenuLabel>
				<DropdownMenuSeparator />
				{columns.map((column) => {
					const isChecked = column.getIsVisible()
					const header = column.columnDef.header
					const label = typeof header === 'string' && header ? header : column.id
					return (
						<DropdownMenuPrimitive.CheckboxItem
							key={column.id}
							checked={isChecked}
							onSelect={(e) => e.preventDefault()}
							onCheckedChange={(value) => column.toggleVisibility(value)}
							className="flex h-9 cursor-default select-none items-center gap-2 rounded-md px-1.5 py-1 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50"
						>
							<span
								className={cn(
									'flex size-3.5 shrink-0 items-center justify-center rounded-sm border transition-colors',
									isChecked
										? 'border-primary bg-primary'
										: 'border-muted-foreground/50',
								)}
							>
								{isChecked && (
									<Check className="size-3 text-primary-foreground" />
								)}
							</span>
							{label}
						</DropdownMenuPrimitive.CheckboxItem>
					)
				})}
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
