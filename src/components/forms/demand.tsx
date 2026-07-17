import { CategoriesApi } from "@/api/categories";
import { useAuth } from "@/hooks/use-auth";
import { useCallback } from "react";
import { useFormContext } from "react-hook-form";
import { AsyncSelectForm } from "../form/async-select-form";
import { ImageDropzoneForm } from "../form/image-dropzone-form";
import { InputForm } from "../form/input-form";
import { TextareaForm } from "../form/textarea-form";
import { Field, FieldGroup, FieldLabel } from "../ui/field";
import { LocationPickerField } from "../ui/location-picker/location-picker-field";

interface DemandFormProps {
  isRequesting?: boolean;
}

export function DemandForm({ isRequesting }: DemandFormProps) {

  const { isAuthenticated } = useAuth()

  const form = useFormContext()
  const { control, formState: { isSubmitting } } = form

  const isFormSubmitting = isSubmitting || isRequesting

  const fetchCategoryOptions = useCallback(
    async ({ page }: { page: number }) => {
      const result = await CategoriesApi.getCategories({ page, limit: 10 });
      return {
        options: result.items.map((option) => ({
          value: option.id,
          label: option.name,
        })),
        hasNextPage: page < result.meta.totalPages,
      };
    },
    [],
  );

  return (
    <FieldGroup>
      {!isAuthenticated && (
        <>
          <Field>
            <FieldLabel>Seu e-mail</FieldLabel>
            <InputForm
              type="email"
              name="guestEmail"
              control={control}
              inputMode="email"
              autoComplete="off"
              disabled={isFormSubmitting}
              placeholder="Digite seu e-mail para receber atualizações"
            />
          </Field>
          <Field>
            <FieldLabel>
              Seu WhatsApp{" "}
              <span className="text-muted-foreground font-normal">(opcional)</span>
            </FieldLabel>
            <InputForm
              type="tel"
              name="guestPhone"
              control={control}
              inputMode="tel"
              autoComplete="tel"
              disabled={isFormSubmitting}
              placeholder="+55 (11) 99999-9999"
            />
          </Field>
        </>
      )}

      <Field>
        <FieldLabel>Título</FieldLabel>
        <InputForm
          name="title"
          control={control}
          inputMode="text"
          disabled={isFormSubmitting}
          placeholder="Digite aqui o título da sua demanda"
        />
      </Field>

      <Field>
        <FieldLabel>Descrição</FieldLabel>
        <TextareaForm
          name="description"
          control={control}
          inputMode="text"
          disabled={isFormSubmitting}
          placeholder="Digita aqui a sua descrição"
        />
      </Field>

      <Field>
        <FieldLabel>Categoria</FieldLabel>
        <AsyncSelectForm
          name="categoryId"
          control={control}
          disabled={isFormSubmitting}
          fetchOptions={fetchCategoryOptions}
          placeholder="Selecione uma categoria"
        />
      </Field>

      <Field>
        <FieldLabel>Localização</FieldLabel>
        <LocationPickerField
          name="location"
          control={control}
          disabled={isFormSubmitting}
        />
      </Field>

      <Field>
        <FieldLabel>Evidências</FieldLabel>
        <ImageDropzoneForm
          name="files"
          control={control}
          disabled={isFormSubmitting}
        />
      </Field>
    </FieldGroup>
  )

}