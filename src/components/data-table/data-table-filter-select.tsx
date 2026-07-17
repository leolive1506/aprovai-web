import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { ChevronDown, X } from "lucide-react"
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui"
import type { DataTableFilterField } from "./types"

interface DataTableFilterSelectProps {
  field: DataTableFilterField
  searchParams: URLSearchParams
  setParam: (key: string, value: string | null) => void
  onRemove: () => void
}

export function DataTableFilterSelect({
  field,
  searchParams,
  setParam,
  onRemove,
}: DataTableFilterSelectProps) {
  const selected = searchParams.get(field.id) ?? ""
  const selectedLabel = field.options?.find((o) => o.value === selected)?.label

  return (
    <div className="flex items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="gap-1 rounded-r-none border-r-0 font-normal"
            data-active={selected || undefined}
          >
            <span className="max-w-40 truncate">
              {selectedLabel ?? field.label}
            </span>
            <ChevronDown
              data-icon="inline-end"
              className="text-muted-foreground"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-40">
          <DropdownMenuLabel>{field.label}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuPrimitive.RadioGroup
            value={selected}
            onValueChange={(value) => setParam(field.id, value || null)}
          >
            {field.options?.map((opt) => {
              const isSelected = selected === opt.value
              return (
                <DropdownMenuPrimitive.RadioItem
                  key={opt.value}
                  value={opt.value}
                  onSelect={(e) => e.preventDefault()}
                  className="relative flex cursor-default items-center gap-2 rounded-md px-1.5 py-1 text-sm transition-colors outline-none select-none focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50"
                >
                  <span
                    className={cn(
                      "flex size-3.5 shrink-0 items-center justify-center rounded-full border transition-colors",
                      isSelected
                        ? "border-primary"
                        : "border-muted-foreground/50"
                    )}
                  >
                    {isSelected && (
                      <span className="size-2 rounded-full bg-primary" />
                    )}
                  </span>
                  {opt.label}
                </DropdownMenuPrimitive.RadioItem>
              )
            })}
          </DropdownMenuPrimitive.RadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="outline"
        size="icon"
        className="rounded-l-none"
        data-active={selected || undefined}
        aria-label={`Remove ${field.label} filter`}
        onClick={onRemove}
      >
        <X />
      </Button>
    </div>
  )
}
