import { useLikeDemand, useUnlinkDemand } from "@/api/demands/hooks"
import type { Demand } from "@/api/demands/types"
import { ReportDemandDialog } from "@/components/report-demand-dialog"
import { Building2, ExternalLinkIcon, MapPinIcon, MessageCircle, MoreHorizontal, FlagIcon, Share2, Star, ThumbsUp, Unlink, UserCheck } from "lucide-react"
import type { ComponentProps } from "react"
import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { Gallery } from "./gallery"
import { UserAvatar } from "./user-avatar"
import { Separator } from "./ui/separator"
import { PostInfo } from "./post-info"
import { formatDateToNow } from "@/utils/date"
import { Button } from "./ui/button"
import { AuthRequiredModal } from "./auth-required-modal"
import { DemandStatusBadge } from "./demand-status-badge"
import { DemandStaleBadge } from "./demand-stale-badge"
import { ClaimDemandFlow } from "./claim-demand-flow"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { AssignMemberDialog } from "@/pages/private/demands/components/assign-member-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"
import { toast } from "sonner"

export interface PostProps extends ComponentProps<"article"> {
  demand: Demand
  hideComment?: boolean
  showStatus?: boolean
}

export function Post({ demand, className, hideComment = false, showStatus = false, children, ...props }: PostProps) {
  const navigate = useNavigate()
  const { isAuthenticated, user, cabinet } = useAuth()

  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authModalVariant, setAuthModalVariant] = useState<"like" | "comment">("like")
  const [showClaimFlow, setShowClaimFlow] = useState(false)
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [showUnlinkDialog, setShowUnlinkDialog] = useState(false)
  const [showReportDialog, setShowReportDialog] = useState(false)

  const isCabinetMember = user?.isCabinetMember ?? false
  const isUnlinked = !demand.cabinetId
  const userOwnsDemand = isCabinetMember && !!demand.cabinetId && cabinet?.id === demand.cabinetId

  const { mutate: likeDemand } = useLikeDemand()
  const { mutate: unlinkDemand, isPending: isUnlinking } = useUnlinkDemand()

  const [liked, setLiked] = useState(demand.isLiked)
  const [likeCount, setLikeCount] = useState(demand.likesCount)

  useEffect(() => {
    setLiked(demand.isLiked)
    setLikeCount(demand.likesCount)
  }, [demand.isLiked, demand.likesCount])

  const authorName = demand.reporter?.name || (demand.guestEmail as string)
  const profilePath = demand.reporterId ? `/profile/${demand.reporterId}` : null

  const mapsUrl =
    demand.lat && demand.long
      ? `https://www.google.com/maps?q=${demand.lat},${demand.long}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(demand.address ?? "")}`

  function handleLike(e: React.MouseEvent) {
    e.stopPropagation()
    if (!isAuthenticated) {
      setAuthModalVariant("like")
      setShowAuthModal(true)
      return
    }
    const wasLiked = liked
    setLiked(!wasLiked)
    setLikeCount((c) => (wasLiked ? c - 1 : c + 1))
    likeDemand(demand.id, {
      onError: () => {
        setLiked(wasLiked)
        setLikeCount(demand.likesCount)
      },
    })
  }

  function navigateToDemand() {
    navigate(`/demand/${demand.id}`)
  }

  function handleComment(e: React.MouseEvent) {
    e.stopPropagation()
    if (!isAuthenticated) {
      setAuthModalVariant("comment")
      setShowAuthModal(true)
      return
    }
    navigate(`/demand/${demand.id}`)
  }

  async function handleShare(e: React.MouseEvent) {
    e.stopPropagation()
    const ogBase = import.meta.env.VITE_OG_BASE_URL as string ?? ''
    const url = ogBase ? `${ogBase}/${demand.id}` : `${window.location.origin}/demand/${demand.id}`
    const shareData = {
      title: demand.title,
      text: demand.description ? `${demand.description.slice(0, 100)}…` : demand.title,
      url,
    }
    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          await navigator.clipboard.writeText(url)
          toast.success("Link copiado!")
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(url)
        toast.success("Link copiado!", { description: "Cole no WhatsApp ou onde quiser." })
      } catch {
        toast.error("Não foi possível compartilhar.")
      }
    }
  }

  function handleUnlink() {
    unlinkDemand(demand.id, {
      onSuccess: () => {
        toast.success("Demanda desvinculada do gabinete")
        setShowUnlinkDialog(false)
      },
      onError: () => {
        toast.error("Erro ao desvincular demanda")
      },
    })
  }

  return (
    <article
      className={cn("bg-card text-card-foreground rounded-lg border border-border overflow-hidden w-full", className)}
      {...props}
    >
      <PostHeader
        demand={demand}
        authorName={authorName}
        profilePath={profilePath}
        showStatus={showStatus}
        userOwnsDemand={userOwnsDemand}
        isAuthenticated={isAuthenticated}
        onAssign={() => setShowAssignDialog(true)}
        onUnlink={() => setShowUnlinkDialog(true)}
        onReport={() => {
          if (!isAuthenticated) {
            setAuthModalVariant("like")
            setShowAuthModal(true)
            return
          }
          setShowReportDialog(true)
        }}
      />

      <div
        className="px-4 pb-3 space-y-1 cursor-pointer"
        onClick={navigateToDemand}
      >
        <p className="text-sm font-semibold leading-snug">{demand.title}</p>
        <p className="text-sm text-muted-foreground leading-relaxed">{demand.description}</p>
      </div>

      {demand.evidences && demand.evidences.length > 0 && (
        <div className="cursor-pointer" onClick={navigateToDemand}>
          <Gallery images={demand.evidences} />
        </div>
      )}

      {demand.address && (
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-start gap-1.5 min-w-0">
            <MapPinIcon className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
            <span className="text-xs text-muted-foreground line-clamp-1">{demand.address}</span>
          </div>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="shrink-0 inline-flex items-center gap-1 text-xs text-primary hover:underline ml-3"
          >
            Ver mapa
            <ExternalLinkIcon className="size-3" />
          </a>
        </div>
      )}

      {user?.id && demand.reporterId === user.id && (
        <SurveyInviteBanner demand={demand} />
      )}

      {(likeCount > 0 || demand.commentsCount > 0) && (
        <div className="flex items-center gap-3 px-4 pb-2 text-xs text-muted-foreground">
          {likeCount > 0 && (
            <span className="flex items-center gap-1">
              <ThumbsUp className="size-3" />
              {likeCount}
            </span>
          )}
          {demand.commentsCount > 0 && (
            <button
              onClick={handleComment}
              className="hover:text-foreground hover:underline transition-colors"
            >
              {demand.commentsCount} {demand.commentsCount === 1 ? "comentário" : "comentários"}
            </button>
          )}
        </div>
      )}

      <Separator />

      <div className="flex">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "flex-1 gap-1.5 rounded-none h-9 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40",
            liked && "text-primary hover:text-primary",
          )}
          onClick={handleLike}
        >
          <ThumbsUp className={cn("size-3.5", liked && "fill-primary")} />
          Apoiar
        </Button>

        {isCabinetMember && isUnlinked && !hideComment && (
          <>
            <div className="w-px bg-border/60 self-stretch" />
            <Button
              size="sm"
              variant="ghost"
              className="flex-1 gap-1.5 rounded-none h-9 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40"
              onClick={(e) => {
                e.stopPropagation()
                setShowClaimFlow(true)
              }}
            >
              <Building2 className="size-3.5" />
              Vincular
            </Button>
          </>
        )}

        {!hideComment && (
          <>
            <div className="w-px bg-border/60 self-stretch" />
            <Button
              size="sm"
              variant="ghost"
              className="flex-1 gap-1.5 rounded-none h-9 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40"
              onClick={handleComment}
            >
              <MessageCircle className="size-3.5" />
              Comentar
            </Button>
          </>
        )}

        <div className="w-px bg-border/60 self-stretch" />
        <Button
          size="sm"
          variant="ghost"
          className="flex-1 gap-1.5 rounded-none h-9 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40"
          onClick={handleShare}
        >
          <Share2 className="size-3.5" />
          <span className="hidden sm:inline">Compartilhar</span>
        </Button>
      </div>

      {children && (
        <>
          <Separator />
          {children}
        </>
      )}

      <AuthRequiredModal open={showAuthModal} onOpenChange={setShowAuthModal} variant={authModalVariant} />

      <ReportDemandDialog
        demandId={demand.id}
        open={showReportDialog}
        onOpenChange={setShowReportDialog}
      />

      {isCabinetMember && (
        <ClaimDemandFlow demand={demand} open={showClaimFlow} onOpenChange={setShowClaimFlow} />
      )}

      {userOwnsDemand && (
        <>
          <AssignMemberDialog demand={demand} open={showAssignDialog} onOpenChange={setShowAssignDialog} />

          <Dialog open={showUnlinkDialog} onOpenChange={setShowUnlinkDialog}>
            <DialogContent className="sm:max-w-sm">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Unlink className="size-4 text-destructive" />
                  Desvincular demanda
                </DialogTitle>
                <DialogDescription>
                  A demanda será desvinculada do gabinete e o responsável será removido. Esta ação pode ser desfeita vinculando novamente.
                </DialogDescription>
              </DialogHeader>
              <div className="rounded-md border border-border bg-muted/40 px-4 py-3">
                <p className="text-xs text-muted-foreground mb-0.5">Demanda</p>
                <p className="text-sm font-medium text-foreground line-clamp-2">{demand.title}</p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowUnlinkDialog(false)} disabled={isUnlinking}>
                  Cancelar
                </Button>
                <Button variant="destructive" onClick={handleUnlink} disabled={isUnlinking}>
                  Desvincular
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </article>
  )
}

function SurveyInviteBanner({ demand }: { demand: Demand }) {
  if (demand.status !== "RESOLVED" || !demand.surveyToken) return null

  if (demand.surveySubmittedAt) {
    return (
      <div className="mx-4 mb-3 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 dark:border-emerald-800 dark:bg-emerald-950/30">
        <Star className="size-3.5 shrink-0 fill-amber-400 text-amber-400" />
        <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
          Você avaliou este atendimento
          {demand.surveyRating ? ` com nota ${demand.surveyRating}/5` : ""}
        </p>
      </div>
    )
  }

  return (
    <div className="mx-4 mb-3 flex items-center justify-between gap-3 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Star className="size-3.5 text-primary" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-foreground">Sua demanda foi resolvida!</p>
          <p className="text-xs text-muted-foreground">Conte como foi o atendimento do gabinete.</p>
        </div>
      </div>
      <Button asChild size="sm" className="h-7 shrink-0 gap-1.5 text-xs" onClick={(e) => e.stopPropagation()}>
        <Link to={`/pesquisa/${demand.surveyToken}`}>
          Avaliar
        </Link>
      </Button>
    </div>
  )
}

interface PostHeaderProps {
  demand: Demand
  authorName: string
  profilePath: string | null
  showStatus: boolean
  userOwnsDemand: boolean
  isAuthenticated: boolean
  onAssign: () => void
  onUnlink: () => void
  onReport: () => void
}

function PostHeader({ demand, authorName, profilePath, showStatus, userOwnsDemand , onAssign, onUnlink, onReport }: PostHeaderProps) {
  const avatarEl = profilePath ? (
    <Link to={profilePath} className="shrink-0" onClick={(e) => e.stopPropagation()}>
      <UserAvatar size="lg" name={authorName} avatarUrl={demand?.reporter?.avatarUrl} />
    </Link>
  ) : (
    <UserAvatar size="lg" name={authorName} avatarUrl={demand?.reporter?.avatarUrl} />
  )

  const postInfo = (
    <PostInfo authorName={authorName} category={demand?.category?.name} dateToNow={formatDateToNow(demand.createdAt)} />
  )

  return (
    <div className="flex items-start justify-between px-4 py-3 gap-2">
      <div className="flex items-start gap-3 min-w-0 flex-1" onClick={(e) => e.stopPropagation()}>
        {avatarEl}
        <div className="flex flex-col gap-0.5 min-w-0">
          {profilePath ? (
            <Link to={profilePath} className="min-w-0" onClick={(e) => e.stopPropagation()}>
              {postInfo}
            </Link>
          ) : (
            postInfo
          )}
          {demand.cabinet && (
            <Link
              to={`/${demand.cabinet.slug}`}
              onClick={(e) => e.stopPropagation()}
              className="text-xs text-primary/70 hover:text-primary hover:underline transition-colors w-fit leading-none"
            >
              {demand.cabinet.name}
            </Link>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
        <DemandStaleBadge status={demand.status} updatedAt={demand.updatedAt} />
        {showStatus && <DemandStatusBadge status={demand.status} />}

        {userOwnsDemand ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                aria-label="Mais opções"
                className="text-muted-foreground size-7"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem onClick={onAssign}>
                <UserCheck className="size-3.5" />
                Alterar responsável
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onUnlink} className="text-destructive focus:text-destructive">
                <Unlink className="size-3.5" />
                Desvincular demanda
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                aria-label="Mais opções"
                className="text-muted-foreground size-7"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem
                onClick={onReport}
                variant="destructive"
                className="text-destructive "
              >
                <FlagIcon className="size-3.5" />
                Denunciar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  )
}
