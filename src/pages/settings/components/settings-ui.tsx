import { type ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SettingsCard({ children, className, ...props }: ComponentProps<"section">) {
  return (
    <section
      className={cn(
        "bg-card rounded-md p-8 shadow-md mb-8 border border-border/30 animate-in fade-in duration-500",
        className
      )}
      {...props}
    >
      {children}
    </section>
  );
}

interface SettingsCardHeaderProps extends ComponentProps<"div"> {
  title: string;
  description: string;
  badge?: string;
}

export function SettingsCardHeader({
  title,
  description,
  badge,
  className,
  ...props
}: SettingsCardHeaderProps) {
  return (
    <div className={cn("mb-8", className)} {...props}>
      <div className="flex items-center gap-3 mb-1">
        <h2 className="text-xl font-bold text-foreground tracking-tight">{title}</h2>
        {badge && (
          <span className="bg-primary/10 text-primary text-2xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            {badge}
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

interface SettingsCardFooterProps extends ComponentProps<"div"> {
  label?: string;
  isLoading?: boolean;
  formId?: string;
  onCancel?: () => void;
}

export function SettingsCardFooter({
  label = "Salvar Dados",
  isLoading = false,
  formId,
  onCancel,
  className,
  ...props
}: SettingsCardFooterProps) {
  return (
    <div
      className={cn("mt-8 pt-8 border-t border-border/40 flex justify-end gap-4", className)}
      {...props}
    >
      {onCancel && (
        <Button
          type="button"
          onClick={onCancel}
          variant="secondary"
          className="px-6 h-12 rounded-xl font-bold text-sm"
        >
          Cancelar
        </Button>
      )}
      <Button
        type={formId ? "submit" : "button"}
        form={formId}
        disabled={isLoading}
        className="px-8 h-12 rounded-xl font-bold text-sm shadow-lg shadow-primary/10 hover:-translate-y-0.5 transition-all"
      >
        {isLoading ? "Salvando..." : label}
      </Button>
    </div>
  );
}

interface FieldProps extends ComponentProps<"div"> {
  label: string;
  error?: string;
}

export function Field({ label, children, error, className, ...props }: FieldProps) {
  return (
    <div className={cn("space-y-1.5", className)} {...props}>
      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">
        {label}
      </label>
      {children}
      {error && (
        <span className="text-2xs text-red-500 font-medium ml-1 animate-in slide-in-from-top-1">
          {error}
        </span>
      )}
    </div>
  );
}

