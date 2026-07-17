export interface DataTableFilterOption {
	label: string
	value: string
}

export interface DataTableFilterField {
	id: string
	label: string
	placeholder?: string
	type: 'search' | 'select' | 'multiple'
	options?: DataTableFilterOption[]
}
