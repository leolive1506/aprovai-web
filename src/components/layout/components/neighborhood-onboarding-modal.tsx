import { useEffect, useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useListUserNeighborhoods } from "@/api/neighborhood/hooks"
import { useAuth } from "@/hooks/use-auth"
import { UserRole } from "@/api/users/types"
import { NeighborhoodSetup } from "@/pages/my-neighborhood/components/neighborhood-setup"

function NeighborhoodOnboardingModalInner() {
  const { user } = useAuth()
  const { data: neighborhoods, isLoading } = useListUserNeighborhoods()
  const [dismissed, setDismissed] = useState(false)

  const sessionKey = user ? `neighborhood_onboarding_dismissed:${user.id}` : null

  useEffect(() => {
    if (!sessionKey) return
    setDismissed(sessionStorage.getItem(sessionKey) === "1")
  }, [sessionKey])

  const open = !isLoading && !dismissed && neighborhoods !== undefined && neighborhoods.length === 0

  function handleDismiss() {
    if (sessionKey) sessionStorage.setItem(sessionKey, "1")
    setDismissed(true)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleDismiss() }}>
      <DialogContent
        className="sm:max-w-sm p-0 gap-0 overflow-hidden"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <NeighborhoodSetup onSuccess={() => {}} />
        <div className="pb-5 text-center">
          <button
            onClick={handleDismiss}
            className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline transition-colors"
          >
            Pular por agora
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function NeighborhoodOnboardingModal() {
  const { user } = useAuth()

  if (user?.role !== UserRole.CITIZEN) return null

  return <NeighborhoodOnboardingModalInner />
}
