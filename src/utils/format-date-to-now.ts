import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export function formatDateToNow(date: string) {
  return date ? formatDistanceToNow(new Date(date), { addSuffix: true, locale: ptBR }) : ""
}