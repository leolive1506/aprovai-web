import { getFirstLettersFromNames } from "@/utils/get-first-letters-from-names";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";

const SIZE_CLASSES = {
  sm: "size-6 rounded-lg after:rounded-lg",
  default: "size-8 rounded-xl after:rounded-xl",
  lg: "size-10 rounded-xl after:rounded-xl",
  xl: "size-16 rounded-xl after:rounded-xl",
};

const FALLBACK_TEXT_CLASSES = {
  sm: "text-2xs",
  default: "text-xs",
  lg: "text-sm",
  xl: "text-lg [&_svg]:size-7",
};

interface UserAvatarProps {
  name?: string;
  avatarUrl?: string;
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
}

export function UserAvatar({
  name,
  avatarUrl,
  size = "lg",
  className,
}: UserAvatarProps) {
  return (
    <Avatar className={cn("overflow-hidden", SIZE_CLASSES[size], className)}>
      <AvatarImage src={avatarUrl} className="rounded-none object-cover" />
      <AvatarFallback
        className={cn(
          "rounded-none bg-primary/10 text-primary font-semibold",
          FALLBACK_TEXT_CLASSES[size],
        )}
      >
        {name ? getFirstLettersFromNames(name) : <User />}
      </AvatarFallback>
    </Avatar>
  )
}
