import { useInviteTeamMembers } from "@/api/companies/hooks"
import { InviteRole } from "@/api/companies/types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { Shield, UserCheck } from "lucide-react"
import { useState } from "react"

interface InviteMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  companyId: string | undefined
}

export function InviteMemberDialog({ open, onOpenChange, companyId }: InviteMemberDialogProps) {
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<InviteRole>(InviteRole.COLLABORATOR)

  const { mutate, isPending } = useInviteTeamMembers(companyId)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return

    mutate(
      { invites: [{ email: email.trim(), role }] },
      {
        onSuccess: () => {
          setEmail("")
          setRole(InviteRole.COLLABORATOR)
          onOpenChange(false)
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Convidar membro</DialogTitle>
          <DialogDescription>
            Envie um convite por e-mail para adicionar alguém à empresa.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 pt-1">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="invite-email">E-mail</Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="nome@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Cargo</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole(InviteRole.COLLABORATOR)}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-colors",
                  role === InviteRole.COLLABORATOR
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border bg-background text-foreground hover:bg-muted",
                )}
              >
                <div
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-md",
                    role === InviteRole.COLLABORATOR ? "bg-primary/10" : "bg-muted",
                  )}
                >
                  <Shield className="size-3.5" />
                </div>
                <div>
                  <p className="text-xs font-semibold leading-tight">Colaborador</p>
                  <p className="text-2xs text-muted-foreground leading-tight mt-0.5">
                    Acesso operacional
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole(InviteRole.APPROVER)}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-colors",
                  role === InviteRole.APPROVER
                    ? "border-amber-500/50 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                    : "border-border bg-background text-foreground hover:bg-muted",
                )}
              >
                <div
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-md",
                    role === InviteRole.APPROVER
                      ? "bg-amber-100 dark:bg-amber-900/40"
                      : "bg-muted",
                  )}
                >
                  <UserCheck className="size-3.5" />
                </div>
                <div>
                  <p className="text-xs font-semibold leading-tight">Aprovador</p>
                  <p className="text-2xs text-muted-foreground leading-tight mt-0.5">
                    Aprova pedidos
                  </p>
                </div>
              </button>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending || !email.trim()}>
              {isPending ? "Enviando..." : "Enviar convite"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
