import {
  useCancelInvite,
  useCompanyInvites,
  useCompanyMembers,
  useMyCompany,
  useRemoveCompanyMember,
  useUpdateCompanyMemberDepartment,
  useUpdateCompanyMemberRole,
} from "@/api/companies/hooks"
import { CompanyMemberRole, type CompanyInvite, type CompanyMember } from "@/api/companies/types"
import { InviteMemberDialog } from "@/components/invite-member-dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuth } from "@/hooks/use-auth"
import { usePageTitle } from "@/hooks/use-page-title"
import { cn } from "@/lib/utils"
import { formatDateToNow } from "@/utils/date"
import { getFirstLettersFromNames } from "@/utils/get-first-letters-from-names"
import { AnimatePresence, motion } from "framer-motion"
import {
  Building2Icon,
  CrownIcon,
  Loader2Icon,
  MoreHorizontalIcon,
  PencilIcon,
  SearchIcon,
  ShieldIcon,
  SlidersHorizontalIcon,
  Trash2Icon,
  UserCheckIcon,
  UserPlusIcon,
  UsersIcon,
  XIcon,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

const ROLE_CONFIG = {
  OWNER: { label: "Responsável", icon: CrownIcon },
  COLLABORATOR: { label: "Colaborador", icon: ShieldIcon },
  APPROVER: { label: "Aprovador", icon: UserCheckIcon },
} as const

const ROLE_FILTERS = ["all", ...Object.keys(ROLE_CONFIG)] as const
type RoleFilter = (typeof ROLE_FILTERS)[number]

const STATUS_FILTERS = ["all", "active", "pending"] as const
type StatusFilter = (typeof STATUS_FILTERS)[number]

const rowFade = {
  hidden: { opacity: 0, y: 6 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.26, delay: Math.min(i, 10) * 0.03, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
  exit: { opacity: 0, height: 0, transition: { duration: 0.18 } },
}

function RolePill({ role }: { role: CompanyMemberRole }) {
  const config = ROLE_CONFIG[role]
  const Icon = config.icon
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground">
      <Icon className="size-3.5 text-muted-foreground" />
      {config.label}
    </span>
  )
}

function StatusPill({ pending }: { pending: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className={cn("size-1.5 rounded-full", pending ? "bg-amber-500" : "bg-emerald-500")} />
      {pending ? "Convite pendente" : "Ativo"}
    </span>
  )
}

function DepartmentCell({ member, canEdit, companyId }: { member: CompanyMember; canEdit: boolean; companyId: string }) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(member.department ?? "")
  const { mutate: updateDepartment, isPending } = useUpdateCompanyMemberDepartment(companyId)

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = value.trim()
    updateDepartment(
      { memberUserId: member.userId, department: trimmed || null },
      { onSuccess: () => setOpen(false) },
    )
  }

  if (!canEdit) {
    return member.department ? (
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <Building2Icon className="size-3.5" />
        {member.department}
      </span>
    ) : (
      <span className="text-xs text-muted-foreground/40">—</span>
    )
  }

  return (
    <Popover open={open} onOpenChange={(next) => { setOpen(next); if (next) setValue(member.department ?? "") }}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "group/dept inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 -mx-1.5 text-xs transition-colors hover:bg-muted",
            member.department ? "text-muted-foreground" : "text-muted-foreground/40",
          )}
        >
          <Building2Icon className="size-3.5" />
          {member.department ?? "Adicionar"}
          <PencilIcon className="size-3 text-muted-foreground/0 transition-colors group-hover/dept:text-muted-foreground/60" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <form onSubmit={handleSave} className="flex flex-col gap-2">
          <label className="text-xs font-medium text-foreground">Departamento</label>
          <Input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Ex: Financeiro"
            className="h-8 text-sm"
            maxLength={60}
          />
          <div className="flex justify-end gap-1.5">
            <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" className="h-7 text-xs" disabled={isPending}>
              {isPending ? <Loader2Icon className="size-3 animate-spin" /> : "Salvar"}
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  )
}

interface MemberActionsProps {
  member: CompanyMember
  isCurrentUser: boolean
  isOwner: boolean
  companyId: string
}

function MemberActions({ member, isCurrentUser, isOwner, companyId }: MemberActionsProps) {
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false)
  const { mutate: removeMember, isPending: isRemoving } = useRemoveCompanyMember(companyId)
  const { mutate: updateRole, isPending: isUpdatingRole } = useUpdateCompanyMemberRole(companyId)
  const canManage = isOwner && !isCurrentUser

  function handleRemove() {
    removeMember(member.userId, {
      onSuccess: () => {
        toast.success(`${member.userName} foi removido da equipe.`)
        setRemoveDialogOpen(false)
      },
    })
  }

  function handleRoleChange(role: CompanyMemberRole) {
    updateRole(
      { memberUserId: member.userId, role },
      { onSuccess: () => toast.success(`Cargo de ${member.userName} atualizado.`) },
    )
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:text-foreground disabled:opacity-0"
            disabled={!canManage || isRemoving || isUpdatingRole}
          >
            {isRemoving || isUpdatingRole ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <MoreHorizontalIcon className="size-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        {canManage && (
          <DropdownMenuContent align="end" className="w-52">
            {(Object.keys(ROLE_CONFIG) as CompanyMemberRole[])
              .filter((role) => role !== member.role)
              .map((role) => {
                const config = ROLE_CONFIG[role]
                const Icon = config.icon
                return (
                  <DropdownMenuItem key={role} onClick={() => handleRoleChange(role)}>
                    <Icon className="size-3.5" />
                    Tornar {config.label.toLowerCase()}
                  </DropdownMenuItem>
                )
              })}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setRemoveDialogOpen(true)} variant="destructive">
              <Trash2Icon className="size-3.5" />
              Remover da equipe
            </DropdownMenuItem>
          </DropdownMenuContent>
        )}
      </DropdownMenu>

      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover membro da equipe?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{member.userName}</strong> perderá imediatamente o acesso ao painel da empresa. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleRemove()
              }}
              disabled={isRemoving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRemoving ? "Removendo..." : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function InviteActions({ invitation, companyId, canManage }: { invitation: CompanyInvite; companyId: string; canManage: boolean }) {
  const { mutate: cancelInvite, isPending } = useCancelInvite(companyId)

  function handleCancel() {
    cancelInvite(invitation.id, { onSuccess: () => toast.success("Convite cancelado.") })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground hover:text-foreground disabled:opacity-0"
          disabled={!canManage || isPending}
        >
          {isPending ? <Loader2Icon className="size-4 animate-spin" /> : <MoreHorizontalIcon className="size-4" />}
        </Button>
      </DropdownMenuTrigger>
      {canManage && (
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem onClick={handleCancel} variant="destructive">
            <XIcon className="size-3.5" />
            Cancelar convite
          </DropdownMenuItem>
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  )
}

type Row =
  | { kind: "member"; key: string; role: CompanyMemberRole; data: CompanyMember }
  | { kind: "invite"; key: string; role: CompanyMemberRole; data: CompanyInvite }

function TeamRow({
  row,
  index,
  currentUserId,
  isOwner,
  companyId,
}: {
  row: Row
  index: number
  currentUserId: string | undefined
  isOwner: boolean
  companyId: string
}) {
  const isMember = row.kind === "member"
  const name = isMember ? row.data.userName : row.data.email
  const email = isMember ? row.data.userEmail : row.data.email
  const isCurrentUser = isMember && row.data.userId === currentUserId

  return (
    <motion.tr
      custom={index}
      variants={rowFade}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="group border-b border-border/70 transition-colors last:border-0 hover:bg-muted/40"
    >
      <TableCell className="py-3">
        <div className="flex items-center gap-3">
          <Avatar className="size-8 shrink-0">
            {isMember && <AvatarImage src={row.data.userAvatarUrl ?? undefined} />}
            <AvatarFallback className="bg-muted text-xs font-medium text-muted-foreground">
              {isMember ? getFirstLettersFromNames(name) : name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-sm font-medium text-foreground">
                {isMember ? name : email}
              </span>
              {isCurrentUser && (
                <span className="shrink-0 text-2xs font-medium text-muted-foreground/60">(você)</span>
              )}
            </div>
            {isMember && <span className="truncate text-xs text-muted-foreground">{email}</span>}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <RolePill role={row.role} />
      </TableCell>
      <TableCell>
        {isMember ? (
          <DepartmentCell member={row.data} canEdit={isOwner} companyId={companyId} />
        ) : (
          <span className="text-xs text-muted-foreground/40">—</span>
        )}
      </TableCell>
      <TableCell>
        <StatusPill pending={!isMember} />
      </TableCell>
      <TableCell className="text-xs text-muted-foreground">
        {formatDateToNow(row.data.createdAt)}
      </TableCell>
      <TableCell className="w-10 text-right">
        {isMember ? (
          <MemberActions member={row.data} isCurrentUser={isCurrentUser} isOwner={isOwner} companyId={companyId} />
        ) : (
          <InviteActions invitation={row.data} companyId={companyId} canManage={isOwner} />
        )}
      </TableCell>
    </motion.tr>
  )
}

export function Team() {
  const { setTitle } = usePageTitle()
  const { user } = useAuth()
  const { data: company } = useMyCompany()
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [inviteOpen, setInviteOpen] = useState(false)

  const { data: members = [], isLoading } = useCompanyMembers(company?.id)
  const { data: invitations = [] } = useCompanyInvites(company?.id)

  const currentMember = members.find((m) => m.userId === user?.id)
  const isOwner = currentMember?.role === CompanyMemberRole.OWNER

  useEffect(() => {
    setTitle({ title: "Equipe", description: "Membros da empresa" })
  }, [setTitle])

  const allRows = useMemo<Row[]>(() => {
    const memberRows: Row[] = members.map((m) => ({ kind: "member", key: m.id, role: m.role, data: m }))
    const inviteRows: Row[] = invitations.map((i) => ({ kind: "invite", key: i.id, role: i.role, data: i }))
    return [...memberRows, ...inviteRows]
  }, [members, invitations])

  const rows = useMemo(() => {
    return allRows.filter((row) => {
      if (roleFilter !== "all" && row.role !== roleFilter) return false
      if (statusFilter === "active" && row.kind !== "member") return false
      if (statusFilter === "pending" && row.kind !== "invite") return false
      if (search.trim()) {
        const q = search.toLowerCase()
        const name = row.kind === "member" ? row.data.userName : row.data.email
        const email = row.kind === "member" ? row.data.userEmail : row.data.email
        const department = row.kind === "member" ? row.data.department ?? "" : ""
        if (
          !name.toLowerCase().includes(q) &&
          !email.toLowerCase().includes(q) &&
          !department.toLowerCase().includes(q)
        ) {
          return false
        }
      }
      return true
    })
  }, [allRows, roleFilter, statusFilter, search])

  const total = members.length + invitations.length
  const hasActiveFilters = roleFilter !== "all" || statusFilter !== "all"

  return (
    <motion.div
      className="flex flex-col gap-5"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Equipe</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {company?.name}
            {!isLoading && total > 0 && (
              <span> · {total} {total === 1 ? "pessoa" : "pessoas"}</span>
            )}
          </p>
        </div>
        {isOwner && (
          <Button onClick={() => setInviteOpen(true)} className="gap-1.5">
            <UserPlusIcon className="size-4" />
            Convidar membro
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-50 max-w-sm flex-1">
          <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
          <Input
            placeholder="Buscar por nome, e-mail ou departamento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-9 text-sm shadow-none"
          />
        </div>

        <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as RoleFilter)}>
          <SelectTrigger className="h-9 w-37.5 text-sm shadow-none">
            <SelectValue placeholder="Cargo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os cargos</SelectItem>
            {(Object.keys(ROLE_CONFIG) as CompanyMemberRole[]).map((role) => (
              <SelectItem key={role} value={role}>
                {ROLE_CONFIG[role].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
          <SelectTrigger className="h-9 w-35 text-sm shadow-none">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todo status</SelectItem>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 gap-1 text-xs text-muted-foreground"
            onClick={() => {
              setRoleFilter("all")
              setStatusFilter("all")
            }}
          >
            <XIcon className="size-3.5" />
            Limpar filtros
          </Button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {isLoading ? (
          <div className="flex flex-col divide-y divide-border/60">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3.5">
                <div className="size-8 shrink-0 animate-pulse rounded-full bg-muted" />
                <div className="flex flex-1 flex-col gap-1.5">
                  <div className="h-3 w-32 animate-pulse rounded bg-muted" />
                  <div className="h-2.5 w-44 animate-pulse rounded bg-muted/70" />
                </div>
              </div>
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="flex size-11 items-center justify-center rounded-full bg-muted">
              {hasActiveFilters || search ? (
                <SlidersHorizontalIcon className="size-5 text-muted-foreground" />
              ) : (
                <UsersIcon className="size-5 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {search || hasActiveFilters ? "Nenhum resultado encontrado" : "Nenhum membro encontrado"}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {search || hasActiveFilters
                  ? "Ajuste a busca ou os filtros."
                  : "Convide pessoas para colaborar na sua empresa."}
              </p>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border hover:bg-transparent">
                <TableHead className="h-10 text-xs font-medium text-muted-foreground">Membro</TableHead>
                <TableHead className="h-10 text-xs font-medium text-muted-foreground">Cargo</TableHead>
                <TableHead className="h-10 text-xs font-medium text-muted-foreground">Departamento</TableHead>
                <TableHead className="h-10 text-xs font-medium text-muted-foreground">Status</TableHead>
                <TableHead className="h-10 text-xs font-medium text-muted-foreground">Entrou</TableHead>
                <TableHead className="h-10 w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence initial={false}>
                {rows.map((row, i) => (
                  <TeamRow
                    key={row.key}
                    row={row}
                    index={i}
                    currentUserId={user?.id}
                    isOwner={isOwner ?? false}
                    companyId={company?.id ?? ""}
                  />
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        )}
      </div>

      <InviteMemberDialog open={inviteOpen} onOpenChange={setInviteOpen} companyId={company?.id} />
    </motion.div>
  )
}
