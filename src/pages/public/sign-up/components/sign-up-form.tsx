import { useRegister } from '@/api/auth/hooks'
import { InputForm } from '@/components/form/input-form'
import { Loading } from '@/components/loading'
import { Button } from '@/components/ui/button'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { registerFormSchema, type RegisterFormData } from '@/validation-schemas/register'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, X } from 'lucide-react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

function parseApiError(err: unknown): { field?: 'email' | 'password'; message: string } {
  const e = err as { response?: { status?: number; data?: { message?: string | string[] } } }
  const status = e.response?.status
  const raw = e.response?.data?.message
  const message = Array.isArray(raw) ? raw[0] : (raw ?? '')

  if (status === 409 || (message && message.toLowerCase().includes('e-mail'))) {
    return { field: 'email', message: 'Este e-mail já está cadastrado.' }
  }
  if (status === 400 && typeof message === 'string' && message.length > 0) {
    return { message }
  }
  return { message: 'Erro ao criar conta. Tente novamente.' }
}

export function SignUpForm() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { mutateAsync: registerUser, isPending } = useRegister()

  const redirectParam = searchParams.get('redirect')
  const emailParam = searchParams.get('email')

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: { name: '', email: emailParam ?? '', password: '', termsAccepted: false as unknown as true },
  })

  const { control, handleSubmit, setError, formState: { isSubmitting } } = form
  const password = useWatch({ control, name: 'password' })
  const isLoading = isPending || isSubmitting
  const hasMinLength = password.length >= 8

  const onSubmit = handleSubmit(async (data: RegisterFormData) => {
    try {
      await registerUser(data)
      toast.success('Cadastro realizado! Verifique seu e-mail e faça login para continuar.')
      await new Promise((r) => setTimeout(r, 1500))
      const loginParams = new URLSearchParams({ email: data.email })
      if (redirectParam?.startsWith('/')) loginParams.set('redirect', redirectParam)
      navigate(`/login?${loginParams.toString()}`)
    } catch (err) {
      const { field, message } = parseApiError(err)
      if (field) {
        setError(field, { message })
      } else {
        toast.error(message)
      }
    }
  })

  return (
    <form onSubmit={onSubmit}>
      <FieldGroup>
        <Field>
          <FieldLabel className="text-zinc-600 font-medium">Seu nome completo</FieldLabel>
          <InputForm
            type="text"
            name="name"
            control={control}
            autoComplete="name"
            placeholder="Digite seu nome"
            disabled={isLoading}
            className="h-10"
          />
        </Field>

        <Field>
          <FieldLabel className="text-zinc-600 font-medium">Seu melhor e-mail</FieldLabel>
          <InputForm
            type="email"
            name="email"
            control={control}
            autoComplete="email"
            placeholder="nome@exemplo.com"
            disabled={isLoading}
            className="h-10"
          />
        </Field>

        <Field>
          <FieldLabel className="text-zinc-600 font-medium">Sua senha de acesso</FieldLabel>
          <InputForm
            control={control}
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            disabled={isLoading}
            className="h-10"
          />
          {password.length > 0 && (
            <div className={cn(
              "flex items-center gap-1.5 text-xs mt-1 transition-colors",
              hasMinLength ? "text-emerald-600" : "text-muted-foreground",
            )}>
              {hasMinLength
                ? <Check className="size-3 shrink-0" />
                : <X className="size-3 shrink-0 text-destructive/70" />
              }
              <span className={!hasMinLength ? "text-destructive/80" : ""}>
                Mínimo 8 caracteres
              </span>
            </div>
          )}
        </Field>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <Controller
              control={control}
              name="termsAccepted"
              render={({ field }) => (
                <Checkbox
                  id="terms"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading}
                />
              )}
            />
            <label htmlFor="terms" className="text-sm font-medium leading-none cursor-pointer text-zinc-600">
              Aceito os{' '}
              <Link to="/termos-de-uso" target="_blank" className="text-primary hover:underline">Termos de Uso</Link>
              {' '}e a{' '}
              <Link to="/politica-de-privacidade" target="_blank" className="text-primary hover:underline">Política de Privacidade</Link>
            </label>
          </div>
          {form.formState.errors.termsAccepted && (
            <p className="text-xs font-medium text-destructive">
              {form.formState.errors.termsAccepted.message}
            </p>
          )}
        </div>

        <Button type="submit" disabled={isLoading} className="h-10">
          {isLoading
            ? <div className="flex items-center gap-2"><Loading /><span>Criando conta...</span></div>
            : 'Criar minha conta'
          }
        </Button>

        <div className="relative my-2 flex items-center">
          <div className="grow border-t border-muted border-dashed" />
          <span className="mx-2 text-xs text-muted-foreground uppercase">Ou</span>
          <div className="grow border-t border-muted border-dashed" />
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full relative flex items-center justify-center font-normal shadow-sm h-10 bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
          onClick={() => { window.location.href = `${import.meta.env.VITE_API_URL}/auth/google` }}
        >
          <svg className="w-5 h-5 absolute left-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continuar com o Google
        </Button>

        <p className="text-[10px] text-center text-muted-foreground mt-2 px-6">
          Ao continuar, você concorda com nossos{' '}
          <Link to="/termos-de-uso" className="underline hover:text-primary" target="_blank">Termos de Uso</Link>
          {' '}e{' '}
          <Link to="/politica-de-privacidade" className="underline hover:text-primary" target="_blank">Política de Privacidade</Link>.
        </p>

        <p className="text-center text-zinc-500 text-sm mt-2">
          Já possui uma conta?{' '}
          <Link to="/login" className="text-primary font-bold hover:underline">Fazer login</Link>
        </p>
      </FieldGroup>
    </form>
  )
}
