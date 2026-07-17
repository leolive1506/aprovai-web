import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Info,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Loader2,
  MailCheck,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { type Notification, type NotificationType } from "@/api/notifications";
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
} from "@/api/notifications/hooks";

const TYPE_CONFIG: Record<
  NotificationType,
  { icon: React.ElementType; colorClass: string; bgClass: string; dotClass: string }
> = {
  INFO: {
    icon: Info,
    colorClass: "text-blue-500",
    bgClass: "bg-blue-50 dark:bg-blue-950/40",
    dotClass: "bg-blue-500",
  },
  SUCCESS: {
    icon: CheckCircle2,
    colorClass: "text-emerald-500",
    bgClass: "bg-emerald-50 dark:bg-emerald-950/40",
    dotClass: "bg-emerald-500",
  },
  WARNING: {
    icon: AlertTriangle,
    colorClass: "text-amber-500",
    bgClass: "bg-amber-50 dark:bg-amber-950/40",
    dotClass: "bg-amber-500",
  },
  ERROR: {
    icon: AlertCircle,
    colorClass: "text-rose-500",
    bgClass: "bg-rose-50 dark:bg-rose-950/40",
    dotClass: "bg-rose-500",
  },
};

const LIMIT = 8;

function NotificationItem({
  notification,
  onRead,
  onClose,
}: {
  notification: Notification;
  onRead: (id: string) => void;
  onClose: () => void;
}) {
  const config = TYPE_CONFIG[notification.type];
  const Icon = config.icon;
  const isUnread = !notification.readAt;
  const navigate = useNavigate();

  const handleClick = () => {
    if (isUnread) onRead(notification.id);
    if (notification.link) {
      onClose();
      navigate(notification.link);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "w-full flex items-start gap-3 px-4 py-3.5 transition-colors text-left border-b border-border/40 last:border-0",
        isUnread || notification.link
          ? "hover:bg-muted/60 bg-primary/2.5 cursor-pointer"
          : "hover:bg-muted/30 cursor-default"
      )}
    >
      <div
        className={cn(
          "size-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5",
          config.bgClass,
          !isUnread && "opacity-60"
        )}
      >
        <Icon className={cn("size-4", config.colorClass)} />
      </div>

      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              "text-sm leading-snug",
              isUnread
                ? "font-semibold text-foreground"
                : "font-medium text-muted-foreground"
            )}
          >
            {notification.title}
          </p>
          {isUnread && (
            <span
              className={cn("size-2 rounded-full shrink-0 mt-1.5", config.dotClass)}
            />
          )}
        </div>
        <p
          className={cn(
            "text-xs line-clamp-2 leading-relaxed",
            isUnread ? "text-muted-foreground" : "text-muted-foreground/60"
          )}
        >
          {notification.message}
        </p>
        <p className="text-2xs text-muted-foreground/50 font-medium mt-0.5">
          {formatDistanceToNow(new Date(notification.createdAt), {
            addSuffix: true,
            locale: ptBR,
          })}
        </p>
      </div>
    </button>
  );
}

export function NotificationPopover() {
  const [limit, setLimit] = useState(LIMIT);
  const [open, setOpen] = useState(false);

  const { data, isLoading, isFetching } = useNotifications({ limit });
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead, isPending: isMarkingAll } = useMarkAllAsRead();

  const notifications = data?.items ?? [];
  const total = data?.total ?? 0;
  const unreadCount = notifications.filter((n) => !n.readAt).length;
  const hasMore = notifications.length < total;

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setLimit(LIMIT);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button className="group relative flex size-8 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-card shadow-sm transition-colors hover:bg-muted data-[state=open]:bg-muted">
          <Bell className="size-4.5 stroke-[1.5] text-muted-foreground group-hover:text-foreground transition-colors" />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-2xs font-bold text-primary-foreground border-2 border-background">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
          {isFetching && !isLoading && open && (
            <span className="absolute bottom-0 right-0 size-2 rounded-full bg-emerald-400 border-2 border-background animate-pulse" />
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        collisionPadding={8}
        className="w-[calc(100vw-1rem)] max-w-96 p-0 rounded-2xl shadow-xl overflow-hidden border-border/50"
      >
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/50 bg-background">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base text-foreground">Notificações</h3>
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-primary text-2xs font-bold text-primary-foreground">
                {unreadCount}
              </span>
            )}
          </div>

          {unreadCount > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => markAllAsRead()}
              disabled={isMarkingAll}
              className="text-xs text-primary font-semibold h-7 px-2 gap-1.5 hover:bg-primary/5 hover:text-primary"
            >
              {isMarkingAll ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <>
                  <MailCheck className="size-3" />
                  Marcar todas como lidas
                </>
              )}
            </Button>
          )}
        </div>

        <div className="max-h-[min(460px,60vh)] overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="size-5 animate-spin text-muted-foreground/50" />
              <p className="text-xs text-muted-foreground">Carregando...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 px-6 text-center gap-3">
              <div className="size-14 rounded-2xl bg-muted/40 flex items-center justify-center">
                <Bell className="size-6 text-muted-foreground/30" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Tudo em dia!</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Você não tem notificações no momento.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notification, i) => (
                <div
                  key={notification.id}
                  className="animate-fade-slide-in"
                  style={{ animationDelay: `${Math.min(i, 7) * 30}ms` }}
                >
                  <NotificationItem
                    notification={notification}
                    onRead={markAsRead}
                    onClose={() => handleOpenChange(false)}
                  />
                </div>
              ))}

              {hasMore && (
                <div className="p-3 flex justify-center border-t border-border/30 bg-muted/10">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setLimit((l) => l + LIMIT)}
                    disabled={isFetching}
                    className="text-xs text-muted-foreground gap-1.5 h-8 hover:text-foreground"
                  >
                    {isFetching ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      <ChevronDown className="size-3.5" />
                    )}
                    Ver mais ({total - notifications.length} restantes)
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-4 py-2 border-t border-border/30 bg-muted/20 flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <p className="text-2xs text-muted-foreground/50">
            Sincronizado em tempo real
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
