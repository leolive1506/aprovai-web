import { useCreateDemandComment, useGetDemandById, useListDemandComments } from "@/api/demands/hooks"
import type { DemandComments as DemandComment } from "@/api/demands/types"
import { useGetDemandResults } from "@/api/results/hooks"
import type { Result } from "@/api/results/types"
import { Post } from "@/components/post"
import { UpdateProgressDialog } from "@/components/update-progress-dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"
import { Building2, CheckCircle2, MessageCircle, MessageCircleIcon, Send, Star, TrendingUp } from "lucide-react"
import { ResultEntry } from "./components/result-entry"
import { useRef, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { toast } from "sonner"
import { UserAvatar } from "@/components/user-avatar"
import { CommentItem } from "./components/comment-item"
import { Loading } from "@/components/loading"

type Tab = "activity" | "results"

const COMMENT_MAX_LENGTH = 2000
const COUNTER_THRESHOLD = 200


export function DemandComments() {
  const { demandId } = useParams() as { demandId: string }
  const { user, cabinet } = useAuth()

  const [message, setMessage] = useState("")
  const [progressOpen, setProgressOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>("activity")
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const { mutate: createComment, isPending: isSubmitting } = useCreateDemandComment()
  const {
    data: demand,
    isLoading: isLoadingDemand,
    isError: isDemandError,
    refetch: refetchDemand,
  } = useGetDemandById({ id: demandId })
  const { data: comments, isLoading: isLoadingComments } = useListDemandComments({
    demandId,
    page: 1,
    limit: 50,
  })
  const { data: resultsData, isLoading: isLoadingResults } = useGetDemandResults(demandId)

  const isCabinetMember = user?.isCabinetMember ?? false
  const isMyDemand = isCabinetMember && !!demand?.cabinetId && cabinet?.id === demand.cabinetId

  function handleSubmit() {
    const content = message.trim()
    if (!content || !demandId || content.length > COMMENT_MAX_LENGTH) return
    createComment(
      { demandId, content },
      {
        onSuccess: () => {
          setMessage("")
          inputRef.current?.focus()
        },
        onError: () => {
          toast.error("Erro ao enviar comentário. Tente novamente.")
        },
      },
    )
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  if (isLoadingDemand) return <Loading fullPage />

  if (isDemandError || !demand) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center gap-3">
        <div className="size-14 rounded-full bg-muted flex items-center justify-center">
          <MessageCircle className="size-6 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Não foi possível carregar a demanda</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
            Verifique sua conexão ou tente novamente em instantes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetchDemand()}>
            Tentar novamente
          </Button>
          <Button size="sm" asChild>
            <Link to="/">Voltar ao feed</Link>
          </Button>
        </div>
      </div>
    )
  }

  const commentList = comments?.items ?? []
  const resultList = resultsData?.items ?? []

  return (
    <section className="max-w-3xl mx-auto">
      <Post demand={demand} hideComment showStatus>
        <div>
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center rounded-md border border-border bg-muted/40 p-0.5">
              <SegmentTab
                active={activeTab === "activity"}
                count={commentList.length}
                onClick={() => setActiveTab("activity")}
              >
                Atividade
              </SegmentTab>
              <SegmentTab
                active={activeTab === "results"}
                count={resultList.length}
                onClick={() => setActiveTab("results")}
              >
                Resultados
              </SegmentTab>
            </div>

            {isMyDemand && (
              <div className="flex items-center gap-2">
                {demand.surveySubmittedAt && demand.surveyRating != null && (
                  <span
                    className="inline-flex h-7 items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2.5 text-xs font-medium text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400"
                    title="Avaliação do cidadão na pesquisa de satisfação"
                  >
                    <Star className="size-3.5 fill-amber-400 text-amber-400" />
                    {demand.surveyRating}/5
                  </span>
                )}
                {demand.guestPhone && (
                  <a
                    href={`https://wa.me/${demand.guestPhone.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá! Estamos entrando em contato sobre sua demanda "${demand.title}". `)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 h-7 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition-colors dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 dark:hover:bg-emerald-900"
                  >
                    <MessageCircleIcon className="size-3.5" />
                    WhatsApp
                  </a>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 gap-1.5 text-xs"
                  onClick={() => setProgressOpen(true)}
                >
                  <TrendingUp className="size-3.5" />
                  Atualizar progresso
                </Button>
              </div>
            )}
          </div>

          {activeTab === "activity" ? (
            <ActivityTab
              commentList={commentList}
              isLoading={isLoadingComments}
              user={user}
              isCabinetMember={isCabinetMember}
              message={message}
              setMessage={setMessage}
              isSubmitting={isSubmitting}
              inputRef={inputRef}
              handleSubmit={handleSubmit}
              handleKeyDown={handleKeyDown}
            />
          ) : (
            <ResultsTab results={resultList} isLoading={isLoadingResults} canDelete={isMyDemand} />
          )}
        </div>
      </Post>

      {isMyDemand && (
        <UpdateProgressDialog
          demandId={demand.id}
          currentStatus={demand.status}
          hasResults={resultList.length > 0}
          open={progressOpen}
          onOpenChange={setProgressOpen}
        />
      )}
    </section>
  )
}

function SegmentTab({
  active,
  count,
  onClick,
  children,
}: {
  active: boolean
  count: number
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-150",
        active ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
      {count > 0 && (
        <span
          className={cn(
            "inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-md text-2xs font-bold leading-none tabular-nums",
            active ? "bg-foreground/10 text-foreground" : "bg-muted/80 text-muted-foreground",
          )}
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  )
}

interface ActivityTabProps {
  commentList: DemandComment[]
  isLoading: boolean
  user: ReturnType<typeof useAuth>["user"]
  isCabinetMember: boolean
  message: string
  setMessage: (v: string) => void
  isSubmitting: boolean
  inputRef: React.RefObject<HTMLTextAreaElement | null>
  handleSubmit: () => void
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
}

function ActivityTab({
  commentList,
  isLoading,
  user,
  isCabinetMember,
  message,
  setMessage,
  isSubmitting,
  inputRef,
  handleSubmit,
  handleKeyDown,
}: ActivityTabProps) {
  const remaining = COMMENT_MAX_LENGTH - message.length
  const showCounter = remaining < COUNTER_THRESHOLD
  const isOverLimit = remaining < 0

  return (
    <>
      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="size-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      ) : commentList.length === 0 ? (
        <EmptyActivity />
      ) : (
        <div className="relative pb-2">
          <div className="absolute left-8 top-0 bottom-0 w-px bg-border" aria-hidden />
          <div className="flex flex-col gap-1">
            {[...commentList].reverse().map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>
        </div>
      )}

      <Separator />

      <div className="px-4 py-3.5">
        <div className="flex items-end gap-2.5">
          <UserAvatar size="default" name={user?.name} avatarUrl={user?.avatarUrl} />

          <div className="flex-1 min-w-0 relative">
            <Textarea
              rows={1}
              ref={inputRef}
              value={message}
              onKeyDown={handleKeyDown}
              maxLength={COMMENT_MAX_LENGTH}
              placeholder={
                isCabinetMember
                  ? "Responda como gabinete (Enter para enviar)..."
                  : "Escreva um comentário..."
              }
              onChange={(e) => setMessage(e.target.value)}
              className={cn(
                "resize-none rounded-lg text-sm min-h-10 max-h-32 py-2.5 w-full",
                isCabinetMember ? "pr-8 border-primary/30 focus-visible:ring-primary/20" : "pr-3",
                isOverLimit && "border-destructive focus-visible:ring-destructive/20",
              )}
              onInput={(e) => {
                const t = e.currentTarget
                t.style.height = "auto"
                t.style.height = `${Math.min(t.scrollHeight, 128)}px`
              }}
            />
            {isCabinetMember && (
              <div
                className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/40"
                title="Você está respondendo como membro do gabinete"
              >
                <Building2 className="size-3.5" />
              </div>
            )}
          </div>

          <Button
            size="icon"
            onClick={handleSubmit}
            aria-label="Enviar comentário"
            disabled={!message.trim() || isSubmitting || isOverLimit}
            className="rounded-full shrink-0 size-9 mb-0.5"
          >
            {isSubmitting ? (
              <div className="size-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </Button>
        </div>

        <div className="flex items-center justify-between pl-11 mt-1.5">
          {isCabinetMember && message.trim().length > 0 ? (
            <p className="text-2xs text-primary/60">
              Este comentário será marcado como resposta oficial do gabinete.
            </p>
          ) : (
            <span />
          )}
          {showCounter && (
            <span
              className={cn(
                "text-2xs tabular-nums font-medium ml-auto",
                isOverLimit ? "text-destructive" : remaining < 50 ? "text-amber-500" : "text-muted-foreground",
              )}
            >
              {remaining}
            </span>
          )}
        </div>
      </div>
    </>
  )
}

function ResultsTab({ results, isLoading, canDelete }: { results: Result[]; isLoading: boolean; canDelete?: boolean }) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="size-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center px-6">
        <div className="size-10 rounded-lg bg-muted flex items-center justify-center mb-3">
          <CheckCircle2 className="size-4 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground">Nenhum resultado registrado</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed">
          Quando o gabinete registrar os resultados desta demanda, eles aparecerão aqui.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 px-4 py-4">
      {results.map((result, i) => (
        <ResultEntry key={result.id} result={result} index={i} canDelete={canDelete} />
      ))}
    </div>
  )
}

function EmptyActivity() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center px-6">
      <div className="size-10 rounded-lg bg-muted flex items-center justify-center mb-2.5">
        <MessageCircle className="size-4 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-foreground">Nenhuma atividade ainda</p>
      <p className="text-xs text-muted-foreground mt-0.5">
        Comentários e atualizações de status aparecerão aqui.
      </p>
    </div>
  )
}
