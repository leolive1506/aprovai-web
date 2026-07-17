import { MessageCircle } from "lucide-react";

export function CommentEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-6 text-center px-6">
      <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-3">
        <MessageCircle className="size-5 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-foreground">Nenhum comentário ainda</p>
      <p className="text-xs text-muted-foreground mt-1">
        Seja o primeiro a comentar nessa demanda.
      </p>
    </div>
  )
}