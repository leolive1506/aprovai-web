# DataTable

A server-side data table with URL-driven state: pagination, sorting, search, and filters are all synced to the URL via search params.

---

## Basic usage

```tsx
import { DataTable } from '@/components/data-table'
import { useDataTable } from '@/hooks/use-data-table'
import type { ColumnDef } from '@tanstack/react-table'
import { useSearchParams } from 'react-router-dom'
import { useMemo } from 'react'

interface User {
  id: string
  name: string
  email: string
}

const columns: ColumnDef<User, unknown>[] = [
  { accessorKey: 'name', header: 'Name', enableSorting: true },
  { accessorKey: 'email', header: 'Email', enableSorting: true },
]

export function UsersPage() {
  const [searchParams] = useSearchParams()

  // Fetch / filter your data using searchParams (see URL params section)
  const { data, rowCount } = useFetchUsers(searchParams)

  const { table, ...tableState } = useDataTable({ data, columns, rowCount })

  return <DataTable table={table} {...tableState} />
}
```

---

## `useDataTable` options

| Option            | Type                    | Default | Description                                              |
|-------------------|-------------------------|---------|----------------------------------------------------------|
| `data`            | `TData[]`               | —       | Current page rows                                        |
| `columns`         | `ColumnDef<TData>[]`    | —       | Column definitions                                       |
| `rowCount`        | `number`                | `0`     | Total rows across all pages (for pagination)             |
| `defaultPageSize` | `number`                | `10`    | Initial page size when no URL param is present           |
| `defaultParams`   | `Record<string, string>`| —       | URL params to apply on first load if not already present |
| `columnPinning`   | `ColumnPinningState`    | `{}`    | Pin columns to `left` or `right`                         |

---

## URL params

The hook reads and writes these search params automatically. Pass them to your server/filter logic.

| Param      | Description                        |
|------------|------------------------------------|
| `search`   | Global search string               |
| `page`     | Current page (1-based)             |
| `per_page` | Rows per page                      |
| `sort`     | Column id being sorted             |
| `order`    | Sort direction: `asc` or `desc`    |
| any other  | Custom filter params (see Filters) |

Changing any filter or search param automatically resets `page` to 1.

---

## Columns

### Sorting

Enable sorting on a column with `enableSorting: true`. Sorting is manual (server-side) — apply `sort` and `order` params in your data fetching logic.

```ts
{ accessorKey: 'name', header: 'Name', enableSorting: true }
```

### Hiding

Columns are hideable by default via the view options menu. To prevent a column from being hidden:

```ts
{ id: 'actions', enableHiding: false }
```

### Column width

Set a fixed width (in px) via `size`:

```ts
{ id: 'actions', size: 60 }
```

### Pinning

Pin columns to the left or right edge. The column only becomes sticky when the table overflows its container (i.e., on smaller screens).

```ts
useDataTable({
  columnPinning: {
    right: ['actions'],
    // left: ['name'],
  },
})
```

### Custom cell rendering

```ts
{
  accessorKey: 'status',
  header: 'Status',
  cell: ({ row }) => {
    const status = row.getValue<string>('status')
    return <Badge>{status}</Badge>
  },
}
```

---

## Filters

Pass `filterFields` to `DataTable` to render filter controls in the toolbar. Each field maps to a URL search param with the same `id`.

```tsx
import type { DataTableFilterField } from '@/components/data-table'

const filterFields: DataTableFilterField[] = [
  {
    id: 'status',           // becomes ?status=... in the URL
    label: 'Status',
    type: 'select',
    options: [
      { label: 'Active', value: 'active' },
      { label: 'Inactive', value: 'inactive' },
    ],
  },
  {
    id: 'role',
    label: 'Role',
    type: 'multiple',       // allows selecting multiple values (?role=admin,editor)
    options: [
      { label: 'Admin', value: 'admin' },
      { label: 'Editor', value: 'editor' },
    ],
  },
]

<DataTable table={table} {...tableState} filterFields={filterFields} />
```

### Filter types

| Type       | URL format              | Description                    |
|------------|-------------------------|--------------------------------|
| `select`   | `?status=active`        | Single value select            |
| `multiple` | `?role=admin,editor`    | Comma-separated multi-select   |

---

## Default params

Pre-apply filter values on first load (only if the param is not already in the URL):

```ts
useDataTable({
  defaultParams: {
    role: 'admin',   // ?role=admin on first visit
  },
})
```

---

## Full example

See `src/pages/private/home/index.tsx` for a complete working example with fake server-side filtering, sorting, pagination, and multiple filter types.
