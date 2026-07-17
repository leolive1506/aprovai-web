import type { Table } from '@tanstack/react-table'
import {
	ChevronFirst,
	ChevronLast,
	ChevronLeft,
	ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'

const PAGE_SIZE_OPTIONS = ['10', '20', '50', '100']

interface DataTablePaginationProps<TData> {
	table: Table<TData>
}

export function DataTablePagination<TData>({
	table,
}: DataTablePaginationProps<TData>) {
	const { pageIndex, pageSize } = table.getState().pagination
	const pageCount = table.getPageCount()
	const rowCount = table.getRowCount()

	return (
		<div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4 text-xs text-muted-foreground/70">
			<p className="shrink-0 tabular-nums">
				{rowCount > 0
					? `${pageIndex * pageSize + 1}–${Math.min((pageIndex + 1) * pageSize, rowCount)} de ${rowCount} ${rowCount !== 1 ? 'registros' : 'registro'}`
					: 'Sem resultados'}
			</p>

			<div className="flex flex-wrap items-center gap-2 sm:gap-4">
				<div className="flex items-center gap-2">
					<span className="hidden sm:inline shrink-0">Linhas por página</span>
					<Select
						value={String(pageSize)}
						onValueChange={(value) => table.setPageSize(Number(value))}
					>
						<SelectTrigger size="sm" className="h-7 w-16 text-xs">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								{PAGE_SIZE_OPTIONS.map((size) => (
									<SelectItem key={size} value={size}>
										{size}
									</SelectItem>
								))}
							</SelectGroup>
						</SelectContent>
					</Select>
				</div>

				<span className="hidden sm:inline shrink-0 tabular-nums">
					Página {pageIndex + 1} de {Math.max(1, pageCount)}
				</span>

				<div className="flex items-center gap-0.5">
					<Button
						variant="ghost"
						size="icon-sm"
						className="hidden sm:flex size-7 text-muted-foreground/60 hover:text-foreground disabled:opacity-30"
						onClick={() => table.setPageIndex(0)}
						disabled={!table.getCanPreviousPage()}
						aria-label="First page"
					>
						<ChevronFirst className="size-3.5" />
					</Button>
					<Button
						variant="ghost"
						size="icon-sm"
						className="size-7 text-muted-foreground/60 hover:text-foreground disabled:opacity-30"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
						aria-label="Previous page"
					>
						<ChevronLeft className="size-3.5" />
					</Button>
					<Button
						variant="ghost"
						size="icon-sm"
						className="size-7 text-muted-foreground/60 hover:text-foreground disabled:opacity-30"
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
						aria-label="Next page"
					>
						<ChevronRight className="size-3.5" />
					</Button>
					<Button
						variant="ghost"
						size="icon-sm"
						className="hidden sm:flex size-7 text-muted-foreground/60 hover:text-foreground disabled:opacity-30"
						onClick={() => table.setPageIndex(pageCount - 1)}
						disabled={!table.getCanNextPage()}
						aria-label="Last page"
					>
						<ChevronLast className="size-3.5" />
					</Button>
				</div>
			</div>
		</div>
	)
}
