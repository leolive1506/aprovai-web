import { useForm, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Globe, Lock, Loader2, Instagram, Facebook, Twitter, Link } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useGetCabinets, useUpdateCabinet } from "@/api/cabinets/hooks"
import { useAuth } from "@/hooks/use-auth"
import { cabinetInfoSchema, type CabinetInfoData } from "./schemas"
import { InputForm } from "@/components/form/input-form"
import { Field, FieldGroup } from "@/components/ui/field"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useCurrentMember } from "@/hooks/use-current-member"
import { cn } from "@/lib/utils"

export function CabinetInfoCard() {
  const { data: cabinets, isLoading: isLoadingCabinet } = useGetCabinets()
  const { currentMember, isLoading: isLoadingMember } = useCurrentMember()
  const { mutateAsync: updateCabinet, isPending } = useUpdateCabinet()
  const { refreshProfile } = useAuth()

  const cabinet = cabinets?.[0]
  const isOwner = currentMember?.role === "OWNER"
  const isLoading = isLoadingCabinet || isLoadingMember

  const {
    control,
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<CabinetInfoData>({
    resolver: zodResolver(cabinetInfoSchema),
    values: {
      name: cabinet?.name ?? "",
      description: cabinet?.description ?? "",
      email: cabinet?.email ?? "",
      tagline: cabinet?.tagline ?? "",
      postDemandMessage: cabinet?.postDemandMessage ?? "",
      instagramUrl: cabinet?.instagramUrl ?? "",
      facebookUrl: cabinet?.facebookUrl ?? "",
      websiteUrl: cabinet?.websiteUrl ?? "",
      twitterUrl: cabinet?.twitterUrl ?? "",
    },
  })

  const isSubmittingForm = isPending || isSubmitting
  const disabled = !isOwner || isSubmittingForm

  const onSubmit: SubmitHandler<CabinetInfoData> = async (data) => {
    if (!cabinet || !isOwner) return
    try {
      await updateCabinet({
        slug: cabinet.slug,
        data: {
          name: data.name,
          description: data.description,
          email: data.email,
          tagline: data.tagline,
          postDemandMessage: data.postDemandMessage,
          instagramUrl: data.instagramUrl,
          facebookUrl: data.facebookUrl,
          websiteUrl: data.websiteUrl,
          twitterUrl: data.twitterUrl,
        },
      })
      await refreshProfile()
      toast.success("Informações do Gabinete atualizadas!")
    } catch {
      toast.error("Erro ao atualizar informações do Gabinete.")
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-20">
          <Loader2 className="size-5 text-muted-foreground/30 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  if (!cabinet) {
    return (
      <Card className="ring-0 border border-dashed border-border">
        <CardContent className="flex items-center justify-center py-16">
          <p className="text-sm text-muted-foreground italic">Nenhum gabinete vinculado encontrado.</p>
        </CardContent>
      </Card>
    )
  }

  const publicHost = typeof window !== "undefined" ? window.location.host : "gabineteapp.com.br"

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card className="animate-in fade-in duration-300">
        <CardHeader className="border-b border-border/60 px-5">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-semibold text-foreground">
              Informações do Gabinete
            </CardTitle>
            <span className="bg-primary/10 text-primary text-2xs font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
              Público
            </span>
          </div>
          <CardDescription className="text-sm text-muted-foreground">
            Esses dados aparecem no perfil público do seu gabinete.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-5">
          <FieldGroup>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field>
                <Label htmlFor="name">Nome do Gabinete</Label>
                <InputForm
                  name="name"
                  control={control}
                  id="name"
                  placeholder="Ex: Gabinete Dep. Carlos Mendes"
                  disabled={disabled}
                />
              </Field>

              <Field>
                <Label htmlFor="email">E-mail de Contato</Label>
                <InputForm
                  name="email"
                  control={control}
                  id="email"
                  placeholder="contato@exemplo.com"
                  disabled={disabled}
                />
              </Field>

              <Field>
                <Label>Cargo Político</Label>
                <Input disabled defaultValue="Informação vinculada ao mandato" className="italic" />
              </Field>

              <Field>
                <Label>Link Público</Label>
                <a
                  href={`/${cabinet.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 rounded-md border border-border bg-background overflow-hidden hover:border-primary/40 transition-colors group"
                >
                  <span className="flex items-center gap-1.5 px-3 h-full text-2xs font-medium text-muted-foreground bg-muted border-r border-border shrink-0">
                    <Globe className="size-3 shrink-0 opacity-60" />
                    {publicHost}/
                  </span>
                  <span className="flex items-center px-3 h-full text-sm text-primary truncate group-hover:underline">
                    {cabinet.slug}
                  </span>
                </a>
              </Field>

              <Field className="md:col-span-2">
                <Label htmlFor="description">Mensagem Pública (Bio)</Label>
                <Textarea
                  {...register("description")}
                  id="description"
                  placeholder="Uma breve descrição do seu mandato e objetivos..."
                  disabled={disabled}
                  rows={3}
                  className={cn(
                    "resize-none text-sm",
                    errors.description && "border-destructive/60",
                  )}
                />
                {errors.description && (
                  <p className="text-xs text-destructive">{errors.description.message}</p>
                )}
              </Field>

              <Field className="md:col-span-2">
                <Label htmlFor="tagline">Tagline do mandato</Label>
                <Input
                  {...register("tagline")}
                  id="tagline"
                  placeholder="Ex: Mandato do povo, para o povo"
                  disabled={disabled}
                  maxLength={120}
                />
                <p className="text-xs text-muted-foreground">Aparece em destaque no perfil público. Máx. 120 caracteres.</p>
              </Field>

              <Field className="md:col-span-2">
                <Label htmlFor="postDemandMessage">Mensagem pós-demanda</Label>
                <Textarea
                  {...register("postDemandMessage")}
                  id="postDemandMessage"
                  placeholder="Ex: Obrigado pelo seu registro! Nossa equipe entrará em contato em até 5 dias úteis."
                  disabled={disabled}
                  rows={2}
                  maxLength={500}
                  className="resize-none text-sm"
                />
                <p className="text-xs text-muted-foreground">Exibida ao cidadão após envio de uma demanda. Máx. 500 caracteres.</p>
              </Field>
            </div>

            <Separator className="my-2" />

            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Redes sociais</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field>
                <Label htmlFor="instagramUrl" className="flex items-center gap-1.5">
                  <Instagram className="size-3.5 text-muted-foreground" />
                  Instagram
                </Label>
                <Input
                  {...register("instagramUrl")}
                  id="instagramUrl"
                  placeholder="https://instagram.com/seugabinete"
                  disabled={disabled}
                  className={cn(errors.instagramUrl && "border-destructive/60")}
                />
                {errors.instagramUrl && <p className="text-xs text-destructive">{errors.instagramUrl.message}</p>}
              </Field>

              <Field>
                <Label htmlFor="facebookUrl" className="flex items-center gap-1.5">
                  <Facebook className="size-3.5 text-muted-foreground" />
                  Facebook
                </Label>
                <Input
                  {...register("facebookUrl")}
                  id="facebookUrl"
                  placeholder="https://facebook.com/seugabinete"
                  disabled={disabled}
                  className={cn(errors.facebookUrl && "border-destructive/60")}
                />
                {errors.facebookUrl && <p className="text-xs text-destructive">{errors.facebookUrl.message}</p>}
              </Field>

              <Field>
                <Label htmlFor="twitterUrl" className="flex items-center gap-1.5">
                  <Twitter className="size-3.5 text-muted-foreground" />
                  X / Twitter
                </Label>
                <Input
                  {...register("twitterUrl")}
                  id="twitterUrl"
                  placeholder="https://x.com/seugabinete"
                  disabled={disabled}
                  className={cn(errors.twitterUrl && "border-destructive/60")}
                />
                {errors.twitterUrl && <p className="text-xs text-destructive">{errors.twitterUrl.message}</p>}
              </Field>

              <Field>
                <Label htmlFor="websiteUrl" className="flex items-center gap-1.5">
                  <Link className="size-3.5 text-muted-foreground" />
                  Site oficial
                </Label>
                <Input
                  {...register("websiteUrl")}
                  id="websiteUrl"
                  placeholder="https://seugabinete.gov.br"
                  disabled={disabled}
                  className={cn(errors.websiteUrl && "border-destructive/60")}
                />
                {errors.websiteUrl && <p className="text-xs text-destructive">{errors.websiteUrl.message}</p>}
              </Field>
            </div>
          </FieldGroup>
        </CardContent>

        <CardFooter className="items-center justify-between border-t border-border/60 bg-transparent px-5 py-3">
          {isOwner ? (
            <Button type="submit" disabled={isSubmittingForm} size="sm" className="ml-auto">
              {isSubmittingForm && <Loader2 className="size-3.5 animate-spin" />}
              Salvar
            </Button>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="size-3.5 shrink-0" />
              <span>Apenas o responsável pelo gabinete pode editar estas informações.</span>
            </div>
          )}
        </CardFooter>
      </Card>
    </form>
  )
}
