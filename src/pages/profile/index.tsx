import { useGetMyDemands } from "@/api/demands/hooks";
import { useGetUserById } from "@/api/users/hooks";
import { UserRole, UserRoleLabel } from "@/api/users/types";
import { Loading } from "@/components/loading";
import { Post } from "@/components/post";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { getFirstLettersFromNames } from "@/utils/get-first-letters-from-names";
import { FileText, Settings } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { Link, useParams } from "react-router-dom";

const ROLE_BADGE_STYLES: Record<UserRole, string> = {
  [UserRole.ADMIN]: "bg-red-50 text-red-600 border-red-100",
  [UserRole.MEMBER]: "bg-blue-50 text-blue-600 border-blue-100",
  [UserRole.CITIZEN]: "bg-slate-100 text-slate-500 border-slate-200",
}

export function Profile() {
  const { userId } = useParams() as { userId: string }
  const { user: currentUser } = useAuth()
  const isOwnProfile = currentUser?.id === userId

  const { data: profileUser, isLoading: isLoadingUser } = useGetUserById(userId)

  const {
    data,
    isLoading: isLoadingDemands,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useGetMyDemands({ limit: 10, enabled: isOwnProfile })

  const sentinelRef = useRef<HTMLDivElement>(null)
  const demands = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data])
  const totalDemands = data?.pages[0]?.meta.total ?? 0

  useEffect(() => {
    if (!isOwnProfile) return
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, isOwnProfile])

  if (isLoadingUser) {
    return (
      <div className="flex justify-center py-16">
        <Loading className="text-primary size-6" />
      </div>
    )
  }

  if (!profileUser) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <p className="text-muted-foreground text-sm">Usuário não encontrado.</p>
      </div>
    )
  }

  const roleLabel = UserRoleLabel[profileUser.role as UserRole] ?? profileUser.role
  const roleStyle = ROLE_BADGE_STYLES[profileUser.role as UserRole] ?? ROLE_BADGE_STYLES[UserRole.CITIZEN]

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-4">
      {/* Profile card */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        {/* Banner */}
        <div className="h-28 bg-linear-to-br from-primary/30 via-primary/15 to-primary/5" />

        {/* Avatar + actions row */}
        <div className="px-5 pb-5">
          <div className="flex items-end justify-between -mt-10 mb-4">
            <div className="ring-4 ring-card rounded-full">
              <Avatar className="size-20">
                <AvatarImage src={profileUser.avatarUrl} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-2xl">
                  {getFirstLettersFromNames(profileUser.name)}
                </AvatarFallback>
              </Avatar>
            </div>

            {isOwnProfile && (
              <Link to="/settings">
                <Button variant="outline" size="sm" className="gap-1.5 rounded-full">
                  <Settings className="size-3.5" />
                  Editar Perfil
                </Button>
              </Link>
            )}
          </div>

          {/* User info */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold text-foreground leading-none">
                {profileUser.name}
              </h1>
              <Badge
                variant="outline"
                className={roleStyle}
              >
                {roleLabel}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground">{profileUser.email}</p>

            {isOwnProfile && totalDemands > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                <span className="font-semibold text-foreground">{totalDemands}</span>{" "}
                {totalDemands === 1 ? "demanda enviada" : "demandas enviadas"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Demands section — only for own profile */}
      {isOwnProfile && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
              Minhas Demandas
            </span>
            <Separator className="flex-1" />
          </div>

          {isLoadingDemands ? (
            <div className="flex justify-center py-10">
              <Loading className="text-primary size-6" />
            </div>
          ) : demands.length === 0 ? (
            <div className="bg-card rounded-xl border border-border shadow-sm flex flex-col items-center justify-center py-14 gap-3 text-center">
              <div className="size-14 rounded-full bg-muted flex items-center justify-center">
                <FileText className="size-7 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Nenhuma demanda ainda</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Suas demandas aparecerão aqui assim que forem criadas.
                </p>
              </div>
              <Link to="/">
                <Button size="sm" className="mt-1 rounded-full">
                  Criar demanda
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {demands.map((demand) => (
                <Post key={demand.id} demand={demand} showStatus />
              ))}

              <div ref={sentinelRef} className="py-2 flex justify-center">
                {isFetchingNextPage && (
                  <div className="flex flex-col items-center gap-2 py-4">
                    <Loading className="text-primary size-5" />
                    <span className="text-xs text-muted-foreground">Carregando...</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Other user — no demands access */}
      {!isOwnProfile && (
        <div className="bg-card rounded-xl border border-border shadow-sm flex flex-col items-center justify-center py-12 gap-2 text-center">
          <p className="text-sm text-muted-foreground">
            Apenas o próprio usuário pode ver suas demandas.
          </p>
        </div>
      )}
    </div>
  )
}
