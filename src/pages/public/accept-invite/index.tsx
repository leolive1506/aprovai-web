import Logo from "@/assets/logo-new.png"
import { useAcceptInvitation, useGetInvitationByToken } from "@/api/cabinets/hooks"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { cn, getApiErrorMessage } from "@/lib/utils"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  AlertCircle,
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  Crown,
  Loader2,
  LogIn,
  Shield,
} from "lucide-react"
import { useState } from "react"
import { Link, Navigate, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import axios from "axios"

const ROLE_LABELS = {
  OWNER: { label: "Responsável", icon: Crown, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30" },
  STAFF: { label: "Membro", icon: Shield, color: "text-primary", bg: "bg-primary/5" },
} as const

export function AcceptInvite() {
  const { token } = useParams<{ token: string }>()
  const { user, isInitializing, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [accepted, setAccepted] = useState(false)

  const { data: invite, isLoading, error } = useGetInvitationByToken(token)
  const { mutate: accept, isPending } = useAcceptInvitation()

  if (!token) return <Navigate to="/" replace />

  function handleAccept() {
    accept(token!, {
      onSuccess: async () => {
        setAccepted(true)
        await refreshProfile()
        setTimeout(() => {
          navigate("/home", { replace: true })
          toast.success("Bem-vindo ao gabinete!")
        }, 1800)
      },
      onError: (err: unknown) => {
        toast.error(getApiErrorMessage(err, "Erro ao aceitar convite."))
      },
    })
  }

  const roleConfig = invite ? ROLE_LABELS[invite.role] : null

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-auth-gradient">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-20 blur-3xl bg-primary" />
        <div className="absolute bottom-0 -left-24 w-80 h-80 rounded-full opacity-15 blur-3xl bg-primary/30" />
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 flex flex-col gap-6 animate-card-enter shadow-auth-card">
        <div className="flex justify-start">
          <Link to="/" className="transition-opacity hover:opacity-70">
            <img src={Logo} alt="Logo Gabinete" className="h-14 w-auto" />
          </Link>
        </div>

        {isLoading || isInitializing ? (
          <LoadingState />
        ) : error ? (
          <ErrorState error={error} />
        ) : accepted ? (
          <SuccessState cabinetName={invite!.cabinetName} />
        ) : !user ? (
          <UnauthenticatedState
            token={token}
            cabinetName={invite!.cabinetName}
            inviteEmail={invite!.email}
          />
        ) : (
          <InviteDetails
            invite={invite!}
            roleConfig={roleConfig!}
            userEmail={user.email}
            onAccept={handleAccept}
            isPending={isPending}
          />
        )}
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <Loader2 className="size-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Carregando convite...</p>
    </div>
  )
}

function ErrorState({ error }: { error: unknown }) {
  const status = axios.isAxiosError(error) ? error.response?.status : undefined
  const isExpired = status === 400
  const isNotFound = status === 404

  return (
    <div className="flex flex-col items-center gap-4 py-4 text-center">
      <div className="size-14 rounded-2xl bg-rose-50 flex items-center justify-center">
        <AlertCircle className="size-7 text-rose-500" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-foreground">
          {isExpired ? "Convite expirado" : isNotFound ? "Convite não encontrado" : "Erro ao carregar"}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {isExpired
            ? "Este convite expirou. Peça ao responsável para enviar um novo."
            : isNotFound
              ? "Este convite não existe ou já foi utilizado."
              : "Ocorreu um erro ao carregar o convite. Tente novamente."}
        </p>
      </div>
      <Link to="/">
        <Button variant="outline" size="sm" className="mt-2">
          Ir para a página inicial
        </Button>
      </Link>
    </div>
  )
}

function SuccessState({ cabinetName }: { cabinetName: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-4 text-center">
      <div className="size-14 rounded-2xl bg-emerald-50 flex items-center justify-center animate-bounce-once">
        <CheckCircle2 className="size-7 text-emerald-500" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-foreground">Convite aceito!</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Você agora faz parte do gabinete <strong>{cabinetName}</strong>.
          Redirecionando...
        </p>
      </div>
      <div className="flex gap-1.5 mt-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-1.5 rounded-full bg-primary animate-pulse"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  )
}

function UnauthenticatedState({
  token,
  cabinetName,
  inviteEmail,
}: {
  token: string
  cabinetName: string
  inviteEmail: string
}) {
  const inviteParams = `redirect=${encodeURIComponent(`/cabinets/invites/${token}`)}&email=${encodeURIComponent(inviteEmail)}`

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold text-foreground">Você foi convidado!</h2>
        <p className="text-sm text-muted-foreground">
          Você recebeu um convite para o gabinete{" "}
          <strong className="text-foreground">{cabinetName}</strong>. Faça login
          para aceitar.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-muted/30 p-4 flex items-center gap-3">
        <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Building2 className="size-5 text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium">Gabinete</p>
          <p className="text-sm font-semibold text-foreground">{cabinetName}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <Link to={`/login?${inviteParams}`} className="w-full">
          <Button className="w-full gap-2">
            <LogIn className="size-4" />
            Entrar para aceitar
          </Button>
        </Link>
        <Link to={`/sign-up?${inviteParams}`} className="w-full">
          <Button variant="outline" className="w-full gap-2">
            Criar conta e aceitar
            <ArrowRight className="size-4" />
          </Button>
        </Link>
      </div>
    </div>
  )
}

function InviteDetails({
  invite,
  roleConfig,
  userEmail,
  onAccept,
  isPending,
}: {
  invite: { email: string; role: "OWNER" | "STAFF"; cabinetName: string; expiresAt: string }
  roleConfig: { label: string; icon: React.ElementType; color: string; bg: string }
  userEmail: string
  onAccept: () => void
  isPending: boolean
}) {
  const RoleIcon = roleConfig.icon
  const emailMismatch = userEmail.toLowerCase() !== invite.email.toLowerCase()

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold text-foreground">Convite para gabinete</h2>
        <p className="text-sm text-muted-foreground">
          Você foi convidado para participar como membro ativo.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-muted/20 overflow-hidden divide-y divide-border/60">
        <div className="flex items-center gap-3 p-4">
          <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Building2 className="size-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Gabinete</p>
            <p className="text-sm font-semibold text-foreground">{invite.cabinetName}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4">
          <div
            className={cn(
              "size-10 rounded-xl flex items-center justify-center shrink-0",
              roleConfig.bg,
            )}
          >
            <RoleIcon className={cn("size-5", roleConfig.color)} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Cargo</p>
            <p className={cn("text-sm font-semibold", roleConfig.color)}>
              {roleConfig.label}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4">
          <div className="size-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
            <Clock className="size-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Expira em</p>
            <p className="text-sm font-semibold text-foreground">
              {format(new Date(invite.expiresAt), "dd 'de' MMMM 'de' yyyy", {
                locale: ptBR,
              })}
            </p>
          </div>
        </div>
      </div>

      {emailMismatch && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-3 flex items-start gap-2.5">
          <AlertCircle className="size-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
            Este convite foi enviado para <strong>{invite.email}</strong>, mas você está
            logado como <strong>{userEmail}</strong>. Faça login com a conta correta.
          </p>
        </div>
      )}

      <Button
        onClick={onAccept}
        disabled={isPending || emailMismatch}
        className="w-full gap-2"
        size="lg"
      >
        {isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Aceitando...
          </>
        ) : (
          <>
            <CheckCircle2 className="size-4" />
            Aceitar convite
          </>
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground/60">
        Ao aceitar, você passará a ter acesso ao painel de gestão deste gabinete.
      </p>
    </div>
  )
}
