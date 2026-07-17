import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

export function formatDateToNow(date: string): string {
  return date ? formatDistanceToNow(new Date(date), { addSuffix: true, locale: ptBR }) : ""
}

export function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return "Bom dia"
  if (h < 18) return "Boa tarde"
  return "Boa noite"
}

export function getFormattedDate(): string {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date())
}

export function getMonthYear(): string {
  return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(new Date())
}

export function getDaysSince(date: string): number {
  return Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24))
}
