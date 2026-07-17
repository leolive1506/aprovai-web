import type { Demand } from "@/api/demands/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { getFirstLettersFromNames } from "@/utils/get-first-letters-from-names"
import type { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ArrowRight, CalendarIcon, MapPinIcon, TagsIcon } from "lucide-react"
import { Link } from "react-router-dom"
import { ActionsCell } from "./cells/actions-cell"
import { AssigneeCell } from "./cells/assignee-cell"
import { PriorityCell } from "./cells/priority-cell"
import { StatusCell } from "./cells/status-cell"

export const demandsColumns: ColumnDef<Demand>[] = [
  {
    accessorKey: "title",
    header: "Demanda",
    cell: ({ row }) => {
      const d = row.original
      return (
        <div className="flex flex-col gap-0.5 min-w-0">
          <Link
            to={`/demand/${d.id}`}
            className="group/title inline-flex items-center gap-1 font-semibold text-foreground hover:text-primary transition-colors leading-snug w-fit max-w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="line-clamp-1">{d.title}</span>
            <ArrowRight className="size-3 shrink-0 opacity-0 group-hover/title:opacity-100 transition-opacity" />
          </Link>
          <span className="text-muted-foreground text-xs line-clamp-1 max-w-md">{d.description}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "category",
    header: "Categoria",
    size: 140,
    cell: ({ row }) => {
      const category = row.original.category
      if (!category) return <span className="text-xs text-muted-foreground/50">—</span>
      return (
        <div className="flex items-center gap-1.5 text-foreground">
          <TagsIcon className="size-3.5 text-muted-foreground shrink-0" />
          <span className="text-sm">{category.name}</span>
        </div>
      )
    },
  },
  {
    id: "priority",
    header: "Prioridade",
    size: 130,
    cell: (props) => <PriorityCell {...props} />,
  },
  {
    id: "status",
    header: "Status",
    size: 150,
    cell: (props) => <StatusCell {...props} />,
  },
  {
    accessorKey: "reporter",
    header: "Relator",
    size: 180,
    cell: ({ row }) => {
      const r = row.original.reporter
      if (!r) return <span className="text-xs text-muted-foreground/50">—</span>
      return (
        <div className="flex items-center gap-2">
          <Avatar className="size-6 shrink-0">
            <AvatarImage src={r.avatarUrl ?? undefined} />
            <AvatarFallback className={cn("text-2xs font-semibold bg-muted text-muted-foreground")}>
              {getFirstLettersFromNames(r.name)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground truncate max-w-28">{r.name}</span>
        </div>
      )
    },
  },
  {
    id: "assignee",
    header: "Responsável",
    size: 140,
    cell: (props) => <AssigneeCell {...props} />,
  },
  {
    id: "date_location",
    header: "Data / Local",
    size: 180,
    cell: ({ row }) => {
      const d = row.original
      return (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
            <CalendarIcon className="size-3 shrink-0" />
            {d.createdAt && format(new Date(d.createdAt), "dd/MM/yyyy", { locale: ptBR })}
          </div>
          {d.address && (
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
              <MapPinIcon className="size-3 shrink-0" />
              <span className="truncate max-w-36">{d.address}</span>
            </div>
          )}
        </div>
      )
    },
  },
  {
    id: "actions",
    size: 52,
    cell: (props) => <ActionsCell {...props} />,
  },
]
