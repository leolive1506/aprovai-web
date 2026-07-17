import {
  useController,
  type FieldValues,
  type UseControllerProps,
} from "react-hook-form";

import { FieldContent, FieldError } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle } from "lucide-react";
import React, { type ComponentProps } from "react";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export type TextareaFormProps<T extends FieldValues> = ComponentProps<
  typeof Textarea
> &
  UseControllerProps<T> & {
    icon?: LucideIcon;
  };

export function TextareaForm<T extends FieldValues>({
  name,
  control,
  icon: Icon,
  className,
  onChange: onChangeProp,
  ...props
}: TextareaFormProps<T>) {
  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
  });

  const handleChange = onChangeProp
    ? (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      field.onChange(e);
      onChangeProp(e);
    }
    : field.onChange;

  return (
    <FieldContent>
      <div className="relative flex items-start w-full group">
        {Icon && (
          <div className="absolute left-3 top-3 flex items-center justify-center text-primary transition-colors group-focus-within:text-primary">
            <Icon size={18} strokeWidth={2.5} />
          </div>
        )}
        <Textarea
          className={cn(
            error && "border-red-500 focus-visible:ring-red-300!",
            Icon && "pl-10",
            className,
          )}
          id={name}
          {...props}
          {...field}
          onChange={handleChange}
        />
      </div>
      {error && (
        <span className="flex items-center gap-0.5 mt-1">
          <AlertCircle size={12} className="size-3 text-red-500" />
          <FieldError errors={[error]} className="text-xs" />
        </span>
      )}
    </FieldContent>
  );
}
