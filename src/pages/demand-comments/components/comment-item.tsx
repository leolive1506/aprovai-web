import type { DemandComments } from "@/api/demands/types"
import { UserAvatar } from "@/components/user-avatar"
import { formatDateToNow } from "@/utils/date"
import { Building2 } from "lucide-react"

interface CommentItemProps {
  comment: DemandComments
}

export function CommentItem({ comment }: CommentItemProps) {
  if (comment.isCabinetResponse) {
    return <CabinetEventItem comment={comment} />
  }
  return <CitizenCommentItem comment={comment} />
}

function CitizenCommentItem({ comment }: CommentItemProps) {
  return (
    <div className="relative flex gap-3 pl-4 pr-4 animate-fade-slide-in">
      <div className="relative shrink-0">
        <div className="relative z-10">
          <UserAvatar size="default" name={comment.authorName} avatarUrl={comment.authorAvatarUrl} />
        </div>
      </div>

      <div className="flex-1 min-w-0 pb-1">
        <div className="bg-muted/60 rounded-lg rounded-tl-sm px-3.5 py-2.5">
          <p className="text-xs font-semibold text-foreground leading-none mb-1">{comment.authorName}</p>
          <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line wrap-break-word">
            {comment.content}
          </p>
        </div>
        <span className="text-xs text-muted-foreground block mt-1 pl-1">
          {formatDateToNow(comment.createdAt)}
        </span>
      </div>
    </div>
  )
}

function CabinetEventItem({ comment }: CommentItemProps) {
  const [statusLine, ...rest] = comment.content.split("\n\n")
  const note = rest.join("\n\n").trim()

  return (
    <div className="relative flex gap-3 pl-4 pr-4 animate-fade-slide-in">
      <div className="relative shrink-0">
        <div className="relative z-10 size-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Building2 className="size-3.5 text-primary" />
        </div>
      </div>

      <div className="flex-1 min-w-0 pb-1">
        <div className="rounded-lg border border-primary/15 bg-primary/5 px-3.5 py-2.5">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-xs font-semibold text-primary">
              {comment.isStatusUpdate ? "Atualização do gabinete" : "Resposta oficial"}
            </span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground">{comment.authorName}</span>
          </div>

          {comment.isStatusUpdate ? (
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-foreground wrap-break-word">{statusLine}</p>
              {note && (
                <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line wrap-break-word border-t border-primary/10 pt-1.5 mt-1">
                  {note}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line wrap-break-word">
              {comment.content}
            </p>
          )}
        </div>
        <span className="text-xs text-muted-foreground block mt-1 pl-1">
          {formatDateToNow(comment.createdAt)}
        </span>
      </div>
    </div>
  )
}
