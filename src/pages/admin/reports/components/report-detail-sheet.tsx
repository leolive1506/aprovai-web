import type { ReportedDemandItem } from "@/api/admin"
import {
  useAdminDeleteDemand,
  useAdminDisableUser,
  useAdminDismissDemandReports,
  useAdminListReportReasons,
} from "@/api/admin/hooks"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Gallery } from "@/components/gallery"
import { formatDateToNow } from "@/utils/format-date-to-now"
import { getFirstLettersFromNames } from "@/utils/get-first-letters-from-names"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { AlertTriangle, CheckCircle, ImageIcon, Loader2, MapPinIcon, Trash2, UserX } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface ReportDetailSheetProps {
  item: ReportedDemandItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReportDetailSheet({ item, open, onOpenChange }: ReportDetailSheetProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [confirmDismiss, setConfirmDismiss] = useState(false)
  const [pendingDisableUserId, setPendingDisableUserId] = useState<string | null>(null)
  const [pendingDisableUserName, setPendingDisableUserName] = useState<string | null>(null)

  const { data, isLoading } = useAdminListReportReasons(item?.demand.id ?? null, { page: 1, limit: 50 })
  const { mutate: dismiss, isPending: isDismissing } = useAdminDismissDemandReports()
  const { mutate: deleteDemand, isPending: isDeleting } = useAdminDeleteDemand()
  const { mutate: disableUser, isPending: isDisabling } = useAdminDisableUser()

  const isDismissed = data?.items.some((r) => r.status === "DISMISSED") ?? false

  function handleDismiss() {
    if (!item) return
    dismiss(item.demand.id, { onSuccess: () => setConfirmDismiss(false) })
  }

  function handleDelete() {
    if (!item) return
    deleteDemand(item.demand.id, {
      onSuccess: () => {
        setConfirmDelete(false)
        onOpenChange(false)
        if (item.demand.reporterId) {
          setPendingDisableUserId(item.demand.reporterId)
          setPendingDisableUserName(item.demand.reporter?.name ?? null)
        }
      },
    })
  }

  function handleDisableUser(userId: string) {
    disableUser(userId, {
      onSuccess: () => {
        setPendingDisableUserId(null)
        setPendingDisableUserName(null)
        toast.success("Usuário inativado com sucesso.")
      },
      onError: () => {
        setPendingDisableUserId(null)
        setPendingDisableUserName(null)
        toast.info("Usuário já estava inativado ou não foi encontrado.")
      },
    })
  }

  function handleQuickDisableUser() {
    if (!item?.demand.reporterId) {
      toast.error("Demanda sem usuário registrado.")
      return
    }
    setPendingDisableUserId(item.demand.reporterId)
    setPendingDisableUserName(item.demand.reporter?.name ?? null)
  }

  const evidences = item?.demand.evidences ?? []

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          className="sm:min-w-135 flex flex-col gap-0 p-0"
        >
          {item && (
            <>
              <SheetHeader className="px-6 py-5 border-b border-border">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <SheetTitle className="text-base leading-snug line-clamp-2">
                      {item.demand.title}
                    </SheetTitle>
                    <SheetDescription className="mt-1">
                      {item.reportsCount} {item.reportsCount === 1 ? "denúncia" : "denúncias"} · primeira{" "}
                      {item.firstReportedAt
                        ? formatDistanceToNow(new Date(item.firstReportedAt), { addSuffix: true, locale: ptBR })
                        : "—"}
                    </SheetDescription>
                  </div>
                  {isDismissed && (
                    <Badge variant="secondary" className="shrink-0 gap-1 text-xs">
                      <CheckCircle className="size-3" />
                      Ignorada
                    </Badge>
                  )}
                </div>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
                <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Demanda</p>
                  <p className="text-sm font-medium">{item.demand.title}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.demand.description}</p>
                  {item.demand.address && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPinIcon className="size-3 shrink-0" />
                      <span className="text-xs">{item.demand.address}</span>
                    </div>
                  )}
                  {item.demand.reporter && (
                    <div className="flex items-center gap-2 pt-1">
                      <Avatar className="size-5 shrink-0">
                        <AvatarImage src={item.demand.reporter.avatarUrl ?? undefined} />
                        <AvatarFallback className="text-2xs bg-primary/10 text-primary">
                          {getFirstLettersFromNames(item.demand.reporter.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">{item.demand.reporter.name}</span>
                      <span className="text-xs text-muted-foreground/50">·</span>
                      <span className="text-xs text-muted-foreground">{formatDateToNow(item.demand.createdAt)}</span>
                    </div>
                  )}
                  {evidences.length > 0 && (
                    <div className="pt-1 space-y-1.5">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <ImageIcon className="size-3" />
                        {evidences.length} {evidences.length === 1 ? "foto" : "fotos"}
                      </p>
                      <Gallery images={evidences} />
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Motivos relatados ({data?.meta?.total ?? 0})
                  </p>

                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="size-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : data?.items.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">Nenhum motivo registrado.</p>
                  ) : (
                    <div className="space-y-3">
                      {data?.items.map((reason) => (
                        <div key={reason.id} className="rounded-lg border border-border bg-card p-3.5 space-y-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="size-5 shrink-0">
                              <AvatarImage src={reason.user?.avatarUrl ?? undefined} />
                              <AvatarFallback className="text-2xs bg-muted">
                                {reason.user ? getFirstLettersFromNames(reason.user.name) : "?"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-medium">{reason.user?.name ?? "Usuário desconhecido"}</span>
                            <span className="text-xs text-muted-foreground/50">·</span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(reason.createdAt), { addSuffix: true, locale: ptBR })}
                            </span>
                            {reason.status === "DISMISSED" && (
                              <Badge variant="secondary" className="ml-auto text-xs py-0">Ignorada</Badge>
                            )}
                          </div>
                          <p className="text-sm text-foreground leading-relaxed pl-7">{reason.reason}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              <SheetFooter className="px-6 py-4 flex-row justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  disabled={isDismissed || isDismissing}
                  onClick={() => setConfirmDismiss(true)}
                >
                  <CheckCircle className="size-3.5" />
                  Ignorar denúncias
                </Button>
                <div className="flex items-center gap-2">
                  {item.demand.reporterId && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-orange-600 border-orange-200 hover:bg-orange-50 hover:text-orange-700"
                      onClick={handleQuickDisableUser}
                    >
                      <UserX className="size-3.5" />
                      Inativar usuário
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => setConfirmDelete(true)}
                  >
                    <Trash2 className="size-3.5" />
                    Excluir demanda
                  </Button>
                </div>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={confirmDismiss} onOpenChange={setConfirmDismiss}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="size-4 text-muted-foreground" />
              Ignorar denúncias
            </DialogTitle>
            <DialogDescription>
              As denúncias serão marcadas como ignoradas e novos reportes desta demanda serão bloqueados. Tem certeza?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDismiss(false)} disabled={isDismissing}>
              Cancelar
            </Button>
            <Button variant="default" onClick={handleDismiss} disabled={isDismissing}>
              {isDismissing ? <Loader2 className="size-3.5 animate-spin mr-1" /> : null}
              Ignorar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-destructive" />
              Excluir demanda
            </DialogTitle>
            <DialogDescription>
              Esta ação irá remover a demanda permanentemente do feed. Não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          {item && (
            <div className="rounded-md border border-border bg-muted/40 px-4 py-3">
              <p className="text-xs text-muted-foreground mb-0.5">Demanda</p>
              <p className="text-sm font-medium line-clamp-2">{item.demand.title}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="size-3.5 animate-spin mr-1" /> : null}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suggest disable user after demand deletion — rendered independently so it survives after item is cleared */}
      <Dialog
        open={!!pendingDisableUserId}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDisableUserId(null)
            setPendingDisableUserName(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserX className="size-4 text-orange-500" />
              Inativar usuário?
            </DialogTitle>
            <DialogDescription>
              Deseja inativar o usuário{pendingDisableUserName ? ` ${pendingDisableUserName}` : ""} que criou esta demanda?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setPendingDisableUserId(null)
                setPendingDisableUserName(null)
              }}
              disabled={isDisabling}
            >
              Não, obrigado
            </Button>
            <Button
              variant="default"
              onClick={() => pendingDisableUserId && handleDisableUser(pendingDisableUserId)}
              disabled={isDisabling}
            >
              {isDisabling ? <Loader2 className="size-3.5 animate-spin mr-1" /> : <UserX className="size-3.5 mr-1" />}
              Inativar usuário
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
