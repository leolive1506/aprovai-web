import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react"

interface LoadingProps {
  className?: string;
  fullPage?: boolean;
}

export function Loading({ className, fullPage }: LoadingProps) {
  if (fullPage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="size-7 animate-spin text-primary/50" />
        <p className="text-xs text-muted-foreground">Carregando...</p>
      </div>
    )
  }
  return <Loader2 className={cn("h-4 w-4 animate-spin", className)} />
}