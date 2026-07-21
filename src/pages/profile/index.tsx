import { useGetUserById } from "@/api/users/hooks";
import { UserRole, UserRoleLabel } from "@/api/users/types";
import { Loading } from "@/components/loading";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { getFirstLettersFromNames } from "@/utils/get-first-letters-from-names";
import { Settings } from "lucide-react";
import { Link, useParams } from "react-router-dom";

const ROLE_BADGE_STYLES: Record<UserRole, string> = {
  [UserRole.ADMIN]: "bg-red-50 text-red-600 border-red-100",
  [UserRole.COMPANY]: "bg-blue-50 text-blue-600 border-blue-100",
}

export function Profile() {
  const { userId } = useParams() as { userId: string }
  const { user: currentUser } = useAuth()
  const isOwnProfile = currentUser?.id === userId

  const { data: profileUser, isLoading: isLoadingUser } = useGetUserById(userId)

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
  const roleStyle = ROLE_BADGE_STYLES[profileUser.role as UserRole] ?? ROLE_BADGE_STYLES[UserRole.COMPANY]

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-4">
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="h-28 bg-linear-to-br from-primary/30 via-primary/15 to-primary/5" />

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
          </div>
        </div>
      </div>
    </div>
  )
}
