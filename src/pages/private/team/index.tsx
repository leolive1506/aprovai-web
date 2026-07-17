import {
  useCancelInvitation,
  useGetCabinetMembers,
  useListCabinetInvitations,
  useRemoveMember,
  useUpdateMemberRole,
} from "@/api/cabinets/hooks"
import type { CabinetInvitation, CabinetMember } from "@/api/cabinets/types"
import { InviteMemberDialog } from "@/components/invite-member-dialog"
import { Loading } from "@/components/loading"
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
import { useAuth } from "@/hooks/use-auth"
import { useCurrentMember } from "@/hooks/use-current-member"
import { usePageTitle } from "@/hooks/use-page-title"
import { useCabinetFeatures } from "@/hooks/use-cabinet-features"
import { PlanLimitBanner } from "@/components/plan-limit-banner"

import { cn } from "@/lib/utils"
import { getFirstLettersFromNames } from "@/utils/get-first-letters-from-names"
import {
  Clock,
  Crown,
  LayoutList,
  MailCheck,
  MoreHorizontal,
  Search,
  Shield,
  Trash2,
  UserPlus,
  UserRound,
  X,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

const ROLE_CONFIG = {
  OWNER: {
    label: "Responsável",
    icon: Crown,
    className:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800",
    iconClass: "text-amber-500",
  },
  STAFF: {
    label: "Membro",
    icon: Shield,
    className:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800",
    iconClass: "text-blue-500",
  },
} as const

interface MemberRowProps {
  member: CabinetMember
  isCurrentUser: boolean
  isOwner: boolean
  cabinetSlug: string
}

function MemberRow({ member, isCurrentUser, isOwner, cabinetSlug }: MemberRowProps) {
  const navigate = useNavigate()
  const config = ROLE_CONFIG[member.role]
  const Icon = config.icon
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false)

  const { mutate: removeMember, isPending: isRemoving } = useRemoveMember(cabinetSlug)
  const { mutate: updateRole, isPending: isUpdatingRole } = useUpdateMemberRole(cabinetSlug)

  const newRole = member.role === "OWNER" ? "STAFF" : "OWNER"

  function handleRemove() {
    removeMember(member.userId, {
      onSuccess: () => {
        toast.success(`${member.userName} foi removido da equipe.`)
        setRemoveDialogOpen(false)
      },
      onError: () => toast.error("Erro ao remover membro."),
    })
  }

  function handleRoleChange() {
    updateRole(
      { userId: member.userId, role: newRole },
      {
        onSuccess: () =>
          toast.success(
            `Cargo de ${member.userName} alterado para ${newRole === "OWNER" ? "Responsável" : "Membro"}.`,
          ),
        onError: (err: any) => {
          const msg = err?.response?.data?.message ?? "Erro ao alterar cargo."
          toast.error(msg)
        },
      },
    )
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <Avatar className="size-9 shrink-0">
        <AvatarImage src={member.userAvatarUrl ?? undefined} />
        <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
          {getFirstLettersFromNames(member.userName)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-foreground truncate">
            {member.userName}
          </span>
          {isCurrentUser && (
            <span className="text-2xs text-muted-foreground/60 font-medium">(você)</span>
          )}
          <span
            className={cn(
              "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-2xs font-medium border shrink-0",
              config.className,
            )}
          >
            <Icon className={cn("size-2.5", config.iconClass)} />
            {config.label}
          </span>
        </div>
        {member.userEmail && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{member.userEmail}</p>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:text-foreground shrink-0"
            onClick={(e) => e.stopPropagation()}
            disabled={isRemoving || isUpdatingRole}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem onClick={() => navigate(`/demands?assigneeMemberId=${member.id}`)}>
            <LayoutList className="size-3.5" />
            Ver demandas atribuídas
          </DropdownMenuItem>

          {isOwner && !isCurrentUser && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleRoleChange} disabled={isUpdatingRole}>
                {newRole === "OWNER" ? (
                  <Crown className="size-3.5 text-amber-500" />
                ) : (
                  <Shield className="size-3.5 text-blue-500" />
                )}
                Tornar {newRole === "OWNER" ? "Responsável" : "Membro"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setRemoveDialogOpen(true)}
                disabled={isRemoving}
                variant="destructive"
              >
                <Trash2 className="size-3.5" />
                Remover da equipe
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover membro da equipe?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{member.userName}</strong> perderá imediatamente o acesso ao painel do
              gabinete e às demandas atribuídas a ele. Esta ação não pode ser desfeita.
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
    </div>
  )
}

interface InvitationRowProps {
  invitation: CabinetInvitation
  cabinetSlug: string
}

function InvitationRow({ invitation, cabinetSlug }: InvitationRowProps) {
  const config = ROLE_CONFIG[invitation.role]
  const Icon = config.icon
  const { mutate: cancelInvite, isPending } = useCancelInvitation(cabinetSlug)

  function handleCancel() {
    cancelInvite(invitation.id, {
      onSuccess: () => toast.success("Convite cancelado."),
      onError: () => toast.error("Erro ao cancelar convite."),
    })
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3 opacity-75">
      <div className="size-9 shrink-0 rounded-full bg-muted flex items-center justify-center">
        <MailCheck className="size-4 text-muted-foreground" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-foreground truncate">
            {invitation.email}
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-2xs font-medium border shrink-0",
              config.className,
            )}
          >
            <Icon className={cn("size-2.5", config.iconClass)} />
            {config.label}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
          <Clock className="size-3" />
          Aguardando aceite
        </p>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="size-8 text-muted-foreground hover:text-destructive shrink-0"
        onClick={handleCancel}
        disabled={isPending}
        title="Cancelar convite"
      >
        <X className="size-4" />
      </Button>
    </div>
  )
}

export function Team() {
  const { setTitle } = usePageTitle()
  const { cabinet } = useAuth()
  const { currentMember } = useCurrentMember()
  const [search, setSearch] = useState("")
  const [inviteOpen, setInviteOpen] = useState(false)

  const isOwner = currentMember?.role === "OWNER"

  useEffect(() => {
    setTitle({ title: "Equipe", description: "Membros do gabinete" })
  }, [])

  const { data: members = [], isLoading } = useGetCabinetMembers(cabinet?.slug)
  const { data: invitations = [] } = useListCabinetInvitations(
    isOwner ? cabinet?.slug : undefined,
  )
  const { plans } = useCabinetFeatures()
  const { user } = useAuth()

  const filtered = useMemo(() => {
    if (!search.trim()) return members
    const q = search.toLowerCase()
    return members.filter(
      (m) =>
        m.userName.toLowerCase().includes(q) ||
        (m.userEmail ?? "").toLowerCase().includes(q),
    )
  }, [members, search])

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-base font-semibold text-foreground">Equipe</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          {cabinet?.name ?? ""}
          {!isLoading && members.length > 0 && (
            <span>
              {" "}· {members.length} {members.length === 1 ? "membro" : "membros"}
            </span>
          )}
        </p>
      </div>

      {plans?.limits.maxMembers !== null && plans?.limits.maxMembers !== undefined && (
        <div className="rounded-lg border border-border bg-card px-4 py-3">
          <PlanLimitBanner
            current={members.length}
            max={plans.limits.maxMembers}
            label="Membros da equipe"
          />
        </div>
      )}

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border/60">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar membro..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-sm"
            />
          </div>
          {!isLoading && members.length > 0 && (
            <span className="font-mono text-xs tabular-nums text-muted-foreground/40 shrink-0">
              {String(filtered.length).padStart(2, "0")}
            </span>
          )}
          <div className="ml-auto">
            {isOwner && (
              <Button
                size="sm"
                className="h-8 gap-1.5 text-xs"
                onClick={() => setInviteOpen(true)}
              >
                <UserPlus className="size-3.5" />
                Convidar
              </Button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loading className="text-primary size-5" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="size-10 rounded-lg bg-muted flex items-center justify-center mb-3">
              <UserRound className="size-4 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">
              {search ? "Nenhum resultado encontrado" : "Nenhum membro encontrado"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {search ? "Tente outro termo de busca." : "Convide membros usando o botão acima."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {filtered.map((member) => (
              <MemberRow
                key={member.id}
                member={member}
                isCurrentUser={member.userId === user?.id}
                isOwner={isOwner ?? false}
                cabinetSlug={cabinet?.slug ?? ""}
              />
            ))}
          </div>
        )}
      </div>

      {isOwner && invitations.length > 0 && (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border/60">
            <Clock className="size-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-foreground">Convites pendentes</span>
            <span className="ml-auto font-mono text-xs tabular-nums text-muted-foreground/40">
              {String(invitations.length).padStart(2, "0")}
            </span>
          </div>
          <div className="divide-y divide-border/60">
            {invitations.map((inv) => (
              <InvitationRow
                key={inv.id}
                invitation={inv}
                cabinetSlug={cabinet?.slug ?? ""}
              />
            ))}
          </div>
        </div>
      )}

      <InviteMemberDialog open={inviteOpen} onOpenChange={setInviteOpen} />
    </div>
  )
}
