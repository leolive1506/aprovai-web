import { CategoriesApi } from "@/api/categories";
import { DemandPriority, DemandStatus, DemandStatusLabel } from "@/api/demands/types";
import { AsyncMultiSelect } from "@/components/ui/async-multi-select";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Filter, Info, Search, Shapes, SlidersHorizontalIcon, XIcon } from "lucide-react";
import { useCallback, useState } from "react";
import type { DateRange } from "react-day-picker";
import { DEMAND_STATUS_CONFIG } from "../demand-utils";

export interface DemandsFilterValue {
  search: string;
  categories: string[];
  status: DemandStatus[];
  priority: DemandPriority | null;
  dateRange: DateRange | undefined;
}

interface DemandsFilterProps {
  value: DemandsFilterValue;
  onChange: (value: DemandsFilterValue) => void;
  resultCount?: number;
}

interface SharedFieldsProps {
  value: DemandsFilterValue;
  onChange: (value: DemandsFilterValue) => void;
  fetchCategories: (p: { page: number }) => Promise<{
    options: { value: string; label: string }[];
    hasNextPage: boolean;
  }>;
}

function CategoryAndStatusFields({ value, onChange, fetchCategories }: SharedFieldsProps) {
  const toggleStatus = (status: DemandStatus) => {
    const next = value.status.includes(status)
      ? value.status.filter((s) => s !== status)
      : [...value.status, status];
    onChange({ ...value, status: next });
  };

  return (
    <>
      <Field>
        <Label htmlFor="category" className="text-xs">
          <Shapes className="size-3.5 text-primary" />
          Categoria
        </Label>
        <AsyncMultiSelect
          onChange={(categories) => onChange({ ...value, categories })}
          fetchOptions={fetchCategories}
          value={value.categories}
          placeholder="Selecione categorias..."
        />
      </Field>

      <Field>
        <Label className="text-xs">
          <Info className="size-3.5 text-primary" />
          Status
        </Label>
        <div className="flex flex-wrap gap-1.5">
          {Object.values(DemandStatus).map((status) => {
            const isActive = value.status.includes(status);
            const cfg = DEMAND_STATUS_CONFIG[status];
            return (
              <button
                key={status}
                type="button"
                onClick={() => toggleStatus(status)}
                className={cn(
                  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-all",
                  isActive
                    ? cn(cfg.className, "ring-2 ring-offset-1 ring-current/30")
                    : "bg-zinc-50 text-zinc-400 border-zinc-200 hover:border-zinc-300 hover:text-zinc-600",
                )}
              >
                {DemandStatusLabel[status]}
              </button>
            );
          })}
        </div>
      </Field>
    </>
  );
}

export function DemandsFilterV2({ value, onChange, resultCount }: DemandsFilterProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const fetchCategories = useCallback(async ({ page }: { page: number }) => {
    const result = await CategoriesApi.getCategories({ page, limit: 10 });
    return {
      options: result.items.map((cat) => ({ value: cat.id, label: cat.name })),
      hasNextPage: page < result.meta.totalPages,
    };
  }, []);

  const clearMobileFilters = () => {
    onChange({ ...value, status: [], categories: [], priority: null, dateRange: undefined });
  };

  const mobileActiveCount = [
    value.status.length > 0,
    value.categories.length > 0,
    value.priority !== null,
    !!value.dateRange?.from,
  ].filter(Boolean).length;

  return (
    <>
      <aside className="hidden md:flex flex-col gap-4 w-64 shrink-0 sticky top-20 self-start">
        <div className="bg-white rounded-2xl border border-zinc-100 p-4 flex flex-col gap-3 shadow">
          <header className="flex items-center gap-2">
            <Filter className="size-3.5 text-primary" />
            <h4 className="font-semibold">Filtros</h4>
          </header>
          <FieldGroup>
            <Field>
              <Label htmlFor="search" className="text-xs">
                <Search className="size-3.5 text-primary" />
                Buscar por termo
              </Label>
              <Input
                id="search"
                autoComplete="off"
                inputMode="search"
                value={value.search}
                onChange={(e) => onChange({ ...value, search: e.target.value })}
                placeholder="Pesquisar demandas"
              />
            </Field>

            <CategoryAndStatusFields
              value={value}
              onChange={onChange}
              fetchCategories={fetchCategories}
            />
          </FieldGroup>
        </div>
      </aside>

      <div className="md:hidden flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400 pointer-events-none" />
          <Input
            value={value.search}
            placeholder="Buscar demandas"
            onChange={(e) => onChange({ ...value, search: e.target.value })}
            className="bg-white pl-8 pr-8 py-2.5 text-sm text-zinc-700 placeholder:text-zinc-400 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all shadow"
          />
          {value.search && (
            <button
              onClick={() => onChange({ ...value, search: "" })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
            >
              <XIcon className="size-3.5" />
            </button>
          )}
        </div>

        <Button
          onClick={() => setSheetOpen(true)}
          className={cn(
            "relative shadow",
            mobileActiveCount > 0
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300",
          )}
        >
          <SlidersHorizontalIcon className="size-3.5" />
          <span>Filtros</span>
          {mobileActiveCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 size-4.5 rounded-full bg-background text-primary text-2xs font-bold border border-primary/30 flex items-center justify-center leading-none">
              {mobileActiveCount}
            </span>
          )}
        </Button>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" showCloseButton={false} className="md:hidden rounded-t-3xl px-0 pb-0 gap-0 min-h-1/2">
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-9 h-1 rounded-full bg-zinc-200" />
          </div>

          <SheetHeader className="border-b border-zinc-100">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-base font-semibold">Filtros</SheetTitle>
              <div className="flex items-center gap-3">
                {mobileActiveCount > 0 && (
                  <button
                    onClick={clearMobileFilters}
                    className="text-xs text-zinc-400 hover:text-red-500 transition-colors"
                  >
                    Limpar
                  </button>
                )}
                <button
                  onClick={() => setSheetOpen(false)}
                  className="size-7 rounded-lg flex items-center justify-center bg-zinc-100 hover:bg-zinc-200 transition-colors"
                >
                  <XIcon className="size-3.5 text-zinc-500" />
                </button>
              </div>
            </div>
          </SheetHeader>

          <div className="px-5 py-4">
            <FieldGroup>
              <CategoryAndStatusFields
                value={value}
                onChange={onChange}
                fetchCategories={fetchCategories}
              />
            </FieldGroup>
          </div>

          <SheetFooter className="pb-6">
            <Button
              onClick={() => setSheetOpen(false)}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              {resultCount !== undefined
                ? `Ver ${resultCount} ${resultCount === 1 ? "resultado" : "resultados"}`
                : "Aplicar filtros"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
