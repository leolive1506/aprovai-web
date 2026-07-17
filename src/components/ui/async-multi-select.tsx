import type { FetchOptionsResult } from "@/components/form/async-select-form";
import type { SelectOption } from "@/components/form/select-form";
import { cn } from "@/lib/utils";
import { CheckIcon, ChevronDownIcon, Grid2X2X, Loader2, XIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type AsyncMultiSelectProps = {
  value: string[];
  onChange: (value: string[]) => void;
  fetchOptions: ({ page }: { page: number }) => Promise<FetchOptionsResult>;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  className?: string;
  initialOptions?: SelectOption[];
};

export function AsyncMultiSelect({
  value,
  onChange,
  fetchOptions,
  placeholder = "Selecione...",
  disabled,
  invalid,
  className,
  initialOptions,
}: AsyncMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState<SelectOption[]>(initialOptions ?? []);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(false);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOptions = useMemo(
    () =>
      value
        .map((v) => options.find((o) => o.value === v))
        .filter(Boolean) as SelectOption[],
    [value, options],
  );

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
        setOptions((prev) => {
          const existingValues = new Set(prev.map((o) => o.value));
          const merged = [
            ...prev,
            ...result.options.filter((o) => !existingValues.has(o.value)),
          ];
          return merged;
        });
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
        setOptions((prev) => {
          const existingValues = new Set(prev.map((o) => o.value));
          return [
            ...prev,
            ...result.options.filter((o) => !existingValues.has(o.value)),
          ];
        });
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
    if (value.includes(option.value)) {
      onChange(value.filter((v) => v !== option.value));
    } else {
      onChange([...value, option.value]);
    }
  };

  const handleRemoveBadge = (val: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onChange(value.filter((v) => v !== val));
  };

  return (
    <div ref={containerRef} className="relative">

      <div
        role="combobox"
        tabIndex={disabled ? -1 : 0}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-invalid={invalid}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((prev) => !prev);
          }
        }}
        className={cn(
          "flex min-h-8 w-full flex-wrap items-center gap-1 rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm transition-colors outline-none select-none cursor-default",
          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          disabled && "cursor-not-allowed opacity-50",
          invalid && "border-red-500 focus-visible:ring-red-300!",
          className,
        )}
      >
        {selectedOptions.length === 0 ? (
          <span className="text-muted-foreground">{placeholder}</span>
        ) : (

          selectedOptions.length <= 2 ? (
            selectedOptions.map((opt) => (
              <span
                key={opt.value}
                className="inline-flex items-center gap-1 rounded-md bg-primary px-1.5 py-0.5 text-xs text-primary-foreground group"
              >
                {opt.label}
                <button
                  type="button"
                  title={`Remover ${opt.label}`}
                  aria-label={`Remover ${opt.label}`}
                  onMouseDown={(e) => handleRemoveBadge(opt.value, e)}
                  className="outline-none hover:text-foreground focus-visible:ring-1"
                >
                  <XIcon className="size-3 group-hover:text-primary-foreground/50 transition-all duration-200" />
                </button>
              </span>
            ))
          ) : (
            <span
              className="inline-flex items-center gap-1 rounded-md bg-primary px-1.5 py-0.5 text-xs text-primary-foreground"
            >
              {selectedOptions.length} selecionados
              <button
                type="button"
                onMouseDown={() => onChange([])}
                title={`Remover todos os ${selectedOptions.length} itens selecionados`}
                aria-label={`Remover todos os ${selectedOptions.length} itens selecionados`}
                className="outline-none hover:text-foreground focus-visible:ring-1 group"
              >
                <XIcon className="size-3 group-hover:text-primary-foreground/50 transition-all duration-200" />
              </button>
            </span>
          )
        )}
        <ChevronDownIcon
          className={cn(
            "ml-auto size-4 shrink-0 text-muted-foreground transition-all duration-200",
            open && "rotate-180",
          )}
        />
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10">
          <div className="border-b border-input px-2 py-1.5">
            <input
              type="text"
              ref={inputRef}
              value={search}
              placeholder="Buscar..."
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          <div ref={listRef} className="max-h-56 overflow-y-auto py-1">
            {filteredOptions.length === 0 && !loading && (
              <div className="flex  flex-col items-center  gap-2 py-4 text-center text-sm text-muted-foreground">
                <div className="bg-primary p-1 rounded-full">
                  <Grid2X2X className="size-3.5 text-white" />
                </div>
                <p className="text-xs">
                  Nenhuma opção encontrada.
                </p>
              </div>
            )}

            {filteredOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={cn(
                  "flex w-full items-center gap-2 px-2 py-1.5 text-sm outline-none transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  value.includes(option.value) &&
                  "bg-accent text-accent-foreground",
                )}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(option);
                }}
              >
                <span
                  aria-hidden
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center rounded border border-input transition-colors",
                    value.includes(option.value) && "border-primary bg-primary",
                  )}
                >
                  {value.includes(option.value) && (
                    <CheckIcon className="size-3 text-white" />
                  )}
                </span>
                <span className="flex-1 text-left">{option.label}</span>
              </button>
            ))}

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
  );
}
