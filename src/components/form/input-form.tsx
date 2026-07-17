import { FieldError } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { AlertCircle } from 'lucide-react'
import type { ComponentProps } from 'react'
import {
  type FieldValues,
  type UseControllerProps,
  useController,
} from 'react-hook-form'

export type InputFormProps<T extends FieldValues> = ComponentProps<
  typeof Input
> &
  UseControllerProps<T>

export function InputForm<T extends FieldValues>({
  name,
  control,
  ...props
}: InputFormProps<T>) {
  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
  })

  return (
    <>
      <Input
        className={error && 'border-red-500 focus-visible:ring-red-300!'}
        id={name}
        {...props}
        {...field}
      />
      {error && (
        <span className="flex items-center gap-0.5">
          <AlertCircle size={12} className="size-3 text-red-500" />
          <FieldError errors={[error]} className="text-xs" />
        </span>
      )}
    </>
  )
}
