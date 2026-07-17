import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  useController,
  type FieldValues,
  type UseControllerProps,
} from "react-hook-form";
import { AlertCircle, CheckIcon, ChevronDownIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { FieldContent, FieldError } from "@/components/ui/field";
import type { SelectOption } from "./select-form";

export type FetchOptionsResult = {
  options: SelectOption[];
  hasNextPage: boolean;
};

export type AsyncSelectFormProps<T extends FieldValues> =
  UseControllerProps<T> & {
    placeholder?: string;
    searchPlaceholder?: string;
    fetchOptions: ({ page }: { page: number }) => Promise<FetchOptionsResult>;
    valueLabel?: string;
    className?: string;
    disabled?: boolean;
  };

export function AsyncSelectForm<T extends FieldValues>({
  name,
  control,
  placeholder = "Selecione...",
  fetchOptions,
  valueLabel,
  className,
  disabled,
}: AsyncSelectFormProps<T>) {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control });

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState(valueLabel ?? "");

  const sentinelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (valueLabel !== undefined) setSelectedLabel(valueLabel);
  }, [valueLabel]);

  useEffect(() => {
    if (!field.value) setSelectedLabel("");
  }, [field.value]);

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    const lower = search.toLowerCase();
    return options.filter((opt) => opt.label.toLowerCase().includes(lower));
  }, [options, search]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const result = await fetchOptions({ page: 1 });
        if (cancelled) return;
        setOptions(result.options);
        setHasNextPage(result.hasNextPage);
        setPage(1);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [open, fetchOptions]);

  const loadMore = useCallback(() => {
    if (loading || !hasNextPage) return;
    const nextPage = page + 1;
    setLoading(true);
    fetchOptions({ page: nextPage })
      .then((result) => {
        setOptions((prev) => [...prev, ...result.options]);
        setHasNextPage(result.hasNextPage);
        setPage(nextPage);
      })
      .finally(() => setLoading(false));
  }, [loading, hasNextPage, page, fetchOptions]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { root: listRef.current, threshold: 0.1 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

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

  const handleSelect = (option: SelectOption) => {
    field.onChange(option.value);
    setSelectedLabel(option.label);
    setOpen(false);
    setSearch("");
  };

  return (
    <FieldContent>
      <div ref={containerRef} className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-haspopup="listbox"
          className={cn(
            "flex h-10 w-full items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm whitespace-nowrap transition-colors outline-none select-none",
            "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            "disabled:cursor-not-allowed disabled:opacity-50",
            !selectedLabel && "text-muted-foreground",
            error && "border-red-500 focus-visible:ring-red-300!",
            className,
          )}
        >
          <span className="truncate">{selectedLabel || placeholder}</span>
          <ChevronDownIcon
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-all duration-200",
              open && "rotate-180",
            )}
          />
        </button>

        {/* Inline dropdown — no portal, so scroll works inside Dialog */}
        {open && (
          <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10">
            <div className="border-b border-input px-2 py-1.5">
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>

            <div ref={listRef} className="max-h-56 overflow-y-auto py-1">
              {filteredOptions.length === 0 && !loading && (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  Nenhuma opção encontrada.
                </p>
              )}

              {filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={cn(
                    "flex w-full items-center gap-1.5 px-2 py-1.5 text-sm outline-none transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    field.value === option.value &&
                      "bg-accent text-accent-foreground",
                  )}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(option);
                  }}
                >
                  <span className="flex-1 text-left">{option.label}</span>
                  {field.value === option.value && (
                    <CheckIcon className="size-4 shrink-0" />
                  )}
                </button>
              ))}

              {/* Sentinel element — triggers loadMore when it scrolls into view */}
              <div ref={sentinelRef} className="h-px" />

              {loading && (
                <div className="flex justify-center py-2">
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <span className="flex items-center gap-0.5">
          <AlertCircle size={12} className="size-3 text-red-500" />
          <FieldError errors={[error]} className="text-xs" />
        </span>
      )}
    </FieldContent>
  );
}
