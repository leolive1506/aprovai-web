import {
  useController,
  type FieldValues,
  type UseControllerProps,
} from "react-hook-form";

import { FieldContent, FieldError } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ComponentProps } from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

export type SelectFormProps<T extends FieldValues> = Omit<
  ComponentProps<typeof SelectTrigger>,
  "children"
> &
  UseControllerProps<T> & {
    placeholder?: string;
    options: SelectOption[];
  };

export function SelectForm<T extends FieldValues>({
  name,
  control,
  placeholder,
  options,
  ...props
}: SelectFormProps<T>) {
  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
  });

  return (
    <FieldContent>
      <Select
        name={field.name}
        onValueChange={field.onChange}
        value={field.value || ""}
      >
        <SelectTrigger
          id={name}
          className={cn("w-full", {
            "border-red-500 focus-visible:ring-red-300!": error,
          })}
          {...props}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent
          position="popper"
          align="start"
          className="max-h-56 overflow-y-auto"
        >
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <span className="flex items-center gap-0.5">
          <AlertCircle size={12} className="size-3 text-red-500" />
          <FieldError errors={[error]} className="text-xs" />
        </span>
      )}
    </FieldContent>
  );
}
