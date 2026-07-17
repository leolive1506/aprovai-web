import { CategoriesApi } from "@/api/categories";
import { useGetNeighborhoods } from "@/api/demands/hooks";
import { DemandPriority, DemandStatus, DemandStatusLabel } from "@/api/demands/types";
import { AsyncMultiSelect } from "@/components/ui/async-multi-select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { DEMAND_STATUS_CONFIG } from "@/pages/private/demands/components/demand-utils";
import { Building2, Filter, Info, MapPin, Search, Shapes, SlidersHorizontalIcon, XIcon } from "lucide-react";
import { useCallback, useState } from "react";
import type { DateRange } from "react-day-picker";

export interface DemandsFilterValue {
  search: string;
  categories: string[];
  status: DemandStatus[];
  priority: DemandPriority | null;
  dateRange: DateRange | undefined;
  neighborhood: string | null;
  unassignedOnly: boolean;
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
  const { user } = useAuth();
  const { data: neighborhoods } = useGetNeighborhoods();
  const isCabinetMember = user?.isCabinetMember ?? false;

  function toggleStatus(status: DemandStatus) {
    const next = value.status.includes(status)
      ? value.status.filter((s) => s !== status)
      : [...value.status, status];
    onChange({ ...value, status: next });
  }

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
                  "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border h-5 transition-all",
                  isActive
                    ? cfg.className
                    : "bg-transparent text-muted-foreground border-border hover:bg-muted/50 hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "size-1.5 rounded-full shrink-0",
                    isActive ? cfg.dotClassName : "bg-muted-foreground/40",
                  )}
                />
                {DemandStatusLabel[status]}
              </button>
            );
          })}
        </div>
      </Field>

      {isCabinetMember && (
        <Field>
          <label className="flex cursor-pointer items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-xs font-medium text-foreground">
              <Building2 className="size-3.5 text-primary" />
              Sem gabinete vinculado
            </span>
            <Checkbox
              checked={value.unassignedOnly}
              onCheckedChange={(checked) =>
                onChange({ ...value, unassignedOnly: checked === true })
              }
            />
          </label>
          <p className="text-2xs text-muted-foreground">
            Exibe apenas demandas disponíveis para reivindicação.
          </p>
        </Field>
      )}

      {neighborhoods && neighborhoods.length > 0 && (
        <Field>
          <Label className="text-xs">
            <MapPin className="size-3.5 text-primary" />
            Bairro
          </Label>
          <Select
            value={value.neighborhood ?? "all"}
            onValueChange={(v) =>
              onChange({ ...value, neighborhood: v === "all" ? null : v })
            }
          >
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Todos os bairros" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os bairros</SelectItem>
              {neighborhoods.map((n) => (
                <SelectItem key={n.neighborhood} value={n.neighborhood}>
                  {n.neighborhood}
                  {n.count > 0 && (
                    <span className="ml-auto text-muted-foreground text-xs">{n.count}</span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      )}
    </>
  );
}

export function FeedFilter({ value, onChange, resultCount }: DemandsFilterProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const fetchCategories = useCallback(async ({ page }: { page: number }) => {
    const result = await CategoriesApi.getCategories({ page, limit: 10 });
    return {
      options: result.items.map((cat) => ({ value: cat.id, label: cat.name })),
      hasNextPage: page < result.meta.totalPages,
    };
  }, []);

  function clearMobileFilters() {
    onChange({ ...value, status: [], categories: [], priority: null, dateRange: undefined, neighborhood: null, unassignedOnly: false });
  }

  const mobileActiveCount = [
    value.status.length > 0,
    value.categories.length > 0,
    value.priority !== null,
    !!value.dateRange?.from,
    value.neighborhood !== null,
    value.unassignedOnly,
  ].filter(Boolean).length;

  return (
    <>
      <aside className="hidden md:flex flex-col gap-4 w-60 shrink-0 sticky top-20 self-start">
        <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3">
          <header className="flex items-center gap-2">
            <Filter className="size-3.5 text-muted-foreground" />
            <h4 className="text-sm font-semibold text-foreground">Filtros</h4>
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <Input
            value={value.search}
            placeholder="Buscar demandas"
            onChange={(e) => onChange({ ...value, search: e.target.value })}
            className="pl-8 pr-8"
          />
          {value.search && (
            <button
              onClick={() => onChange({ ...value, search: "" })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <XIcon className="size-3.5" />
            </button>
          )}
        </div>

        <Button
          variant={mobileActiveCount > 0 ? "default" : "outline"}
          size="sm"
          onClick={() => setSheetOpen(true)}
          className="relative gap-1.5"
        >
          <SlidersHorizontalIcon className="size-3.5" />
          <span>Filtros</span>
          {mobileActiveCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 size-4 rounded-full bg-background text-primary text-2xs font-bold border border-primary/30 flex items-center justify-center leading-none">
              {mobileActiveCount}
            </span>
          )}
        </Button>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" showCloseButton={false} className="md:hidden rounded-t-3xl px-0 pb-0 gap-0 min-h-1/2">
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-9 h-1 rounded-full bg-muted" />
          </div>

          <SheetHeader className="border-b border-border">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-base font-semibold">Filtros</SheetTitle>
              <div className="flex items-center gap-3">
                {mobileActiveCount > 0 && (
                  <button
                    onClick={clearMobileFilters}
                    className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                  >
                    Limpar
                  </button>
                )}
                <button
                  onClick={() => setSheetOpen(false)}
                  className="size-7 rounded-lg flex items-center justify-center bg-muted hover:bg-muted/80 transition-colors"
                >
                  <XIcon className="size-3.5 text-muted-foreground" />
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

          <SheetFooter className="pb-6 px-5">
            <Button
              onClick={() => setSheetOpen(false)}
              className="w-full"
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
