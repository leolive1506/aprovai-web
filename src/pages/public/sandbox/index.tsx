import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { LocationPickerField, type LocationPickerValue } from "@/components/ui/location-picker/location-picker-field";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

const schema = z.object({
  location: z.object({
    address: z.string().min(1, "Selecione um endereço"),
    latitude: z.string().min(1, ""),
    longitude: z.string().min(1, ""),
  }),
});

type FormData = z.infer<typeof schema>;

export function Sandbox() {
  const { control, handleSubmit, watch, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const location = watch("location") as LocationPickerValue | undefined;

  const onSubmit = handleSubmit((data) => {
    console.log("Location submitted:", data.location);
    alert(`Endereço: ${data.location.address}\nLat: ${data.location.latitude}\nLon: ${data.location.longitude}`);
  });

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="w-full max-w-xl space-y-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <MapPin className="size-5 text-primary" />
            <h1 className="text-xl font-semibold tracking-tight">Location Picker</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Busque um endereço ou clique no mapa. Arraste o marcador para ajustar.
          </p>
        </div>

        <form onSubmit={onSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel>Endereço</FieldLabel>
              <LocationPickerField name="location" control={control} />
            </Field>
          </FieldGroup>

          {location?.address && (
            <div className="mt-4 rounded-md border border-border bg-muted/40 px-4 py-3 space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Selecionado</p>
              <p className="text-sm">{location.address}</p>
              <p className="text-xs font-mono text-muted-foreground">
                {parseFloat(location.latitude).toFixed(6)}, {parseFloat(location.longitude).toFixed(6)}
              </p>
            </div>
          )}

          <div className="mt-4 flex gap-2">
            <Button type="submit" className="flex-1">Confirmar endereço</Button>
            <Button type="button" variant="outline" onClick={() => reset()}>Limpar</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
