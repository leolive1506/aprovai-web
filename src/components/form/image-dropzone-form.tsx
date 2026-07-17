import {
  useController,
  type FieldValues,
  type UseControllerProps,
} from "react-hook-form";
import { AlertCircle } from "lucide-react";

import { FieldError } from "@/components/ui/field";
import {
  ImageDropzone,
  type ImageDropzoneProps,
} from "@/components/ui/image-dropzone";

export type ImageDropzoneFormProps<T extends FieldValues> = Omit<
  ImageDropzoneProps,
  "value" | "onChange"
> &
  UseControllerProps<T>;

export function ImageDropzoneForm<T extends FieldValues>({
  name,
  control,
  rules,
  defaultValue,
  shouldUnregister,
  ...props
}: ImageDropzoneFormProps<T>) {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control, rules, defaultValue, shouldUnregister });

  return (
    <>
      <ImageDropzone
        {...props}
        value={field.value ?? []}
        onChange={(files) => {
          field.onChange(files);
        }}
      />
      {error && (
        <span className="flex items-center gap-1 mt-1">
          <AlertCircle size={12} className="size-3 text-red-500" />
          <FieldError errors={[error]} className="text-xs" />
        </span>
      )}
    </>
  );
}
