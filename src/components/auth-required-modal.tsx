import { ArrowRight, MessageCircle, ThumbsUp } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";

interface AuthRequiredModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant?: "like" | "comment";
}

const content = {
  like: {
    icon: ThumbsUp,
    title: "Sua voz faz a diferença",
    description: "Para apoiar esta demanda você precisa estar conectado.",
  },
  comment: {
    icon: MessageCircle,
    title: "Participe da conversa",
    description: "Para comentar nesta demanda você precisa estar conectado.",
  },
};

export function AuthRequiredModal({
  open,
  onOpenChange,
  variant = "like",
}: AuthRequiredModalProps) {
  const { icon: Icon, title, description } = content[variant];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="p-0 overflow-hidden gap-0 sm:max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-auth-gradient px-6 pt-8 pb-7 flex flex-col items-center text-center">
          <div className="relative mb-5">
            <span className="absolute inset-0 rounded-full bg-white/25 animate-ping" />
            <div className="relative size-16 rounded-full bg-white/20 border border-white/30 flex items-center justify-center shadow-auth-btn">
              <Icon className="size-7 text-white fill-white/70" />
            </div>
          </div>
          <DialogTitle className="text-lg font-semibold text-white mb-1.5">
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm text-white/80 leading-relaxed max-w-[22ch]">
            {description}
          </DialogDescription>
        </div>

        <div className="px-5 py-5 space-y-4">
          <p className="text-xs text-center text-muted-foreground leading-relaxed">
            Junte-se à comunidade e participe<br />das decisões da sua cidade.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Link to="/sign-up" onClick={() => onOpenChange(false)} className="contents">
              <Button variant="outline" className="w-full font-medium">
                Criar conta
              </Button>
            </Link>
            <Link to="/login" onClick={() => onOpenChange(false)} className="contents">
              <Button className="w-full font-medium bg-auth-btn shadow-auth-btn gap-1.5">
                Entrar
                <ArrowRight className="size-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
