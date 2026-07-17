import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { Check, ChevronDown, X } from "lucide-react"
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui"
import type { DataTableFilterField } from "./types"

const LABEL_THRESHOLD = 3

interface DataTableFilterMultipleProps {
  field: DataTableFilterField
  searchParams: URLSearchParams
  setParam: (key: string, value: string | null) => void
  onRemove: () => void
}

export function DataTableFilterMultiple({
  field,
  searchParams,
  setParam,
  onRemove,
}: DataTableFilterMultipleProps) {
  const raw = searchParams.get(field.id)
  const selected = raw ? raw.split(",").filter(Boolean) : []

  function toggle(value: string) {
    const next = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value]
    setParam(field.id, next.length > 0 ? next.join(",") : null)
  }

  function getTriggerLabel() {
    if (selected.length === 0) return field.label
    if (selected.length >= LABEL_THRESHOLD) return `${selected.length} selected`
    return selected
      .map((v) => field.options?.find((o) => o.value === v)?.label ?? v)
      .join(", ")
  }

  return (
    <div className="flex items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="gap-1 rounded-r-none border-r-0 font-normal"
            data-active={selected.length > 0 || undefined}
          >
            <span className="max-w-40 truncate">{getTriggerLabel()}</span>
            <ChevronDown
              data-icon="inline-end"
              className="text-muted-foreground"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-40">
          <DropdownMenuLabel>{field.label}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {field.options?.map((opt) => {
            const isChecked = selected.includes(opt.value)
            return (
              <DropdownMenuPrimitive.CheckboxItem
                key={opt.value}
                checked={isChecked}
                onCheckedChange={() => toggle(opt.value)}
                onSelect={(e) => e.preventDefault()}
                className="relative flex cursor-default items-center gap-2 rounded-md px-1.5 py-1 text-sm transition-colors outline-none select-none focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50"
              >
                <span
                  className={cn(
                    "flex size-3.5 shrink-0 items-center justify-center rounded-sm border transition-colors",
                    isChecked
                      ? "border-primary bg-primary"
                      : "border-muted-foreground/50"
                  )}
                >
                  {isChecked && (
                    <Check className="size-3 text-primary-foreground" />
                  )}
                </span>
                {opt.label}
              </DropdownMenuPrimitive.CheckboxItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="outline"
        size="icon"
        className="rounded-l-none data-active:border-primary/60 data-active:bg-primary/5 data-active:text-primary"
        data-active={selected.length > 0 || undefined}
        aria-label={`Remove ${field.label} filter`}
        onClick={onRemove}
      >
        <X />
      </Button>
    </div>
  )
}
