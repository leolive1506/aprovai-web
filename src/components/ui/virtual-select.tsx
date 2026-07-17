import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CheckIcon, ChevronDownIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type { SelectOption } from "@/components/form/select-form";

const ITEM_HEIGHT = 36;
const LIST_HEIGHT = 252;
const OVERSCAN = 3;

export type VirtualSelectProps = {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  className?: string;
};

export function VirtualSelect({
  options,
  value,
  onChange,
  placeholder,
  disabled,
  invalid,
  className,
}: VirtualSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [scrollTop, setScrollTop] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    const lower = search.toLowerCase();
    return options.filter((opt) => opt.label.toLowerCase().includes(lower));
  }, [options, search]);

  const totalHeight = filteredOptions.length * ITEM_HEIGHT;
  const startIndex = Math.max(
    0,
    Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN,
  );
  const visibleCount = Math.ceil(LIST_HEIGHT / ITEM_HEIGHT);
  const endIndex = Math.min(
    filteredOptions.length - 1,
    startIndex + visibleCount + OVERSCAN,
  );
  const virtualItems = filteredOptions.slice(startIndex, endIndex + 1);

  const selectedLabel = options.find((opt) => opt.value === value)?.label;
  const listHeight = Math.min(LIST_HEIGHT, filteredOptions.length * ITEM_HEIGHT);

  const handleOpen = useCallback(() => {
    if (disabled) return;
    setOpen((prev) => !prev);
  }, [disabled]);

  const handleSelect = useCallback(
    (val: string) => {
      onChange?.(val);
      setOpen(false);
      setSearch("");
    },
    [onChange],
  );

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={handleOpen}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-invalid={invalid}
        className={cn(
          "flex h-8 w-full items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap outline-none select-none transition-colors",
          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
        )}
      >
        <span className={cn(!value && "text-muted-foreground")}>
          {selectedLabel ?? placeholder}
        </span>
        <ChevronDownIcon
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform duration-150",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10">
          <div className="border-b border-input px-2 py-1.5">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setScrollTop(0);
                if (listRef.current) listRef.current.scrollTop = 0;
              }}
              placeholder="Buscar..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          {filteredOptions.length === 0 ? (
            <div className="py-4 text-center text-sm text-muted-foreground">
              Nenhum resultado encontrado
            </div>
          ) : (
            <div
              ref={listRef}
              role="listbox"
              style={{ height: listHeight, overflowY: "auto" }}
              onScroll={handleScroll}
            >
              <div style={{ height: totalHeight, position: "relative" }}>
                {virtualItems.map((option, i) => {
                  const absoluteIndex = startIndex + i;
                  const isSelected = option.value === value;
                  return (
                    <div
                      key={option.value}
                      role="option"
                      aria-selected={isSelected}
                      style={{
                        position: "absolute",
                        top: absoluteIndex * ITEM_HEIGHT,
                        left: 0,
                        right: 0,
                        height: ITEM_HEIGHT,
                      }}
                      className={cn(
                        "flex cursor-pointer select-none items-center justify-between px-3 text-sm",
                        "hover:bg-accent hover:text-accent-foreground",
                        isSelected && "bg-accent/50 font-medium",
                      )}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelect(option.value);
                      }}
                    >
                      <span className="truncate">{option.label}</span>
                      {isSelected && (
                        <CheckIcon className="size-4 shrink-0 text-primary" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
