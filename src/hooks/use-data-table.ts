import {
	type ColumnDef,
	type ColumnPinningState,
	type VisibilityState,
	getCoreRowModel,
	type PaginationState,
	type SortingState,
	useReactTable,
} from '@tanstack/react-table'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

export const TABLE_PARAM_KEYS = {
	SEARCH: 'search',
	PAGE: 'page',
	PER_PAGE: 'per_page',
	SORT: 'sort',
	ORDER: 'order',
} as const

const RESERVED_KEYS = new Set(Object.values(TABLE_PARAM_KEYS))

interface UseDataTableProps<TData> {
	data: TData[]
	columns: ColumnDef<TData, unknown>[]
	rowCount?: number
	defaultPageSize?: number
	defaultParams?: Record<string, string>
	columnPinning?: ColumnPinningState
}

export function useDataTable<TData>({
	data,
	columns,
	rowCount = 0,
	defaultPageSize = 10,
	defaultParams,
	columnPinning: initialColumnPinning = {},
}: UseDataTableProps<TData>) {
	const [searchParams, setSearchParams] = useSearchParams()
	const [columnVisibility, setColumnVisibility] =
		useState<VisibilityState>({})
	const [columnPinning] = useState<ColumnPinningState>(initialColumnPinning)
	const appliedDefaults = useRef(false)

	useEffect(() => {
		if (appliedDefaults.current || !defaultParams) return
		appliedDefaults.current = true
		setSearchParams(
			(prev) => {
				const next = new URLSearchParams(prev)
				let changed = false
				for (const [key, value] of Object.entries(defaultParams)) {
					if (!next.has(key)) {
						next.set(key, value)
						changed = true
					}
				}
				return changed ? next : prev
			},
			{ replace: true },
		)
	}, [])

	const search = searchParams.get(TABLE_PARAM_KEYS.SEARCH) ?? ''
	const page = Math.max(1, Number(searchParams.get(TABLE_PARAM_KEYS.PAGE) ?? 1))
	const pageSize = Number(
		searchParams.get(TABLE_PARAM_KEYS.PER_PAGE) ?? defaultPageSize,
	)
	const sortId = searchParams.get(TABLE_PARAM_KEYS.SORT) ?? ''
	const sortOrder = (searchParams.get(TABLE_PARAM_KEYS.ORDER) ?? 'asc') as
		| 'asc'
		| 'desc'

	const pagination: PaginationState = useMemo(
		() => ({ pageIndex: page - 1, pageSize }),
		[page, pageSize],
	)

	const sorting: SortingState = useMemo(
		() => (sortId ? [{ id: sortId, desc: sortOrder === 'desc' }] : []),
		[sortId, sortOrder],
	)

	const setParam = useCallback(
		(key: string, value: string | null) => {
			setSearchParams(
				(prev) => {
					const next = new URLSearchParams(prev)
					if (value === null || value === '') {
						next.delete(key)
					} else {
						next.set(key, value)
					}
					if (
						!RESERVED_KEYS.has(
							key as (typeof TABLE_PARAM_KEYS)[keyof typeof TABLE_PARAM_KEYS],
						)
					) {
						next.delete(TABLE_PARAM_KEYS.PAGE)
					}
					return next
				},
				{ replace: true },
			)
		},
		[setSearchParams],
	)

	const onSearchChange = useCallback(
		(value: string) => {
			setSearchParams(
				(prev) => {
					const next = new URLSearchParams(prev)
					if (value) {
						next.set(TABLE_PARAM_KEYS.SEARCH, value)
					} else {
						next.delete(TABLE_PARAM_KEYS.SEARCH)
					}
					next.delete(TABLE_PARAM_KEYS.PAGE)
					return next
				},
				{ replace: true },
			)
		},
		[setSearchParams],
	)

	const resetFilters = useCallback(() => {
		setSearchParams(new URLSearchParams(), { replace: true })
	}, [setSearchParams])

	const table = useReactTable({
		data,
		columns,
		rowCount,
		state: {
			pagination,
			sorting,
			globalFilter: search,
			columnVisibility,
			columnPinning,
		},
		manualPagination: true,
		manualSorting: true,
		manualFiltering: true,
		onPaginationChange: (updater) => {
			const next = typeof updater === 'function' ? updater(pagination) : updater
			setSearchParams(
				(prev) => {
					const params = new URLSearchParams(prev)
					params.set(TABLE_PARAM_KEYS.PAGE, String(next.pageIndex + 1))
					params.set(TABLE_PARAM_KEYS.PER_PAGE, String(next.pageSize))
					return params
				},
				{ replace: true },
			)
		},
		onSortingChange: (updater) => {
			const next = typeof updater === 'function' ? updater(sorting) : updater
			setSearchParams(
				(prev) => {
					const params = new URLSearchParams(prev)
					if (next.length > 0) {
						params.set(TABLE_PARAM_KEYS.SORT, next[0].id)
						params.set(TABLE_PARAM_KEYS.ORDER, next[0].desc ? 'desc' : 'asc')
					} else {
						params.delete(TABLE_PARAM_KEYS.SORT)
						params.delete(TABLE_PARAM_KEYS.ORDER)
					}
					params.delete(TABLE_PARAM_KEYS.PAGE)
					return params
				},
				{ replace: true },
			)
		},
		onColumnVisibilityChange: setColumnVisibility,
		getCoreRowModel: getCoreRowModel(),
	})

	return {
		table,
		search,
		onSearchChange,
		setParam,
		resetFilters,
		searchParams,
	}
}
