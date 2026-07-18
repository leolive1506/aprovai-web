import Logo from '@/assets/aprovai.svg'
import { useRegister } from '@/api/auth/hooks'
import { GoogleAuthButton } from '@/components/google-auth-button'
import { InputForm } from '@/components/form/input-form'
import { Loading } from '@/components/loading'
import { registerFormSchema, type RegisterFormData } from '@/validation-schemas/register'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, Eye, EyeOff, X } from 'lucide-react'
import { useState } from 'react'
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
  const [showPassword, setShowPassword] = useState(false)
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
    <div className="flex flex-col items-center">
      <img src={Logo} alt="AprovIA" className="h-7 w-auto" />

      <div className="mt-4 text-center">
        <h1 className="text-xl font-bold tracking-tight text-neutral-700 dark:text-neutral-200">Criar sua conta</h1>
      </div>

      <form onSubmit={onSubmit} className="mt-4 w-full space-y-3">
        <InputForm
          type="text"
          name="name"
          id="name"
          control={control}
          autoComplete="name"
          placeholder="Nome completo"
          disabled={isLoading}
          className="h-11 rounded-xl border-border bg-card px-3.5 shadow-xs transition-shadow focus-visible:ring-2 focus-visible:ring-primary/40"
        />

        <InputForm
          type="email"
          name="email"
          id="email"
          control={control}
          autoComplete="email"
          placeholder="seu@email.com"
          disabled={isLoading}
          className="h-11 rounded-xl border-border bg-card px-3.5 shadow-xs transition-shadow focus-visible:ring-2 focus-visible:ring-primary/40"
        />

        <div>
          <div className="relative">
            <InputForm
              control={control}
              name="password"
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Senha"
              disabled={isLoading}
              className="h-11 w-full rounded-xl border-border bg-card px-3.5 pr-11 shadow-xs transition-shadow focus-visible:ring-2 focus-visible:ring-primary/40"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg p-2 text-muted-foreground transition-colors hover:text-foreground"
              tabIndex={-1}
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {password.length > 0 && (
            <div className={cn(
              "mt-2 flex items-center gap-1.5 px-1 text-xs transition-colors",
              hasMinLength ? "text-emerald-600" : "text-muted-foreground",
            )}>
              {hasMinLength
                ? <Check className="size-3.5 shrink-0" />
                : <X className="size-3.5 shrink-0 text-destructive/70" />
              }
              <span className={!hasMinLength ? "text-destructive/80" : ""}>
                Mínimo 8 caracteres
              </span>
            </div>
          )}
        </div>

        <div className="pt-1">
          <div className="flex items-center gap-2.5">
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
            <label htmlFor="terms" className="cursor-pointer text-xs leading-relaxed text-muted-foreground">
              Aceito os{' '}
              <Link to="/termos-de-uso" target="_blank" className="font-medium text-primary hover:underline">
                Termos de Uso
              </Link>
              {' '}e a{' '}
              <Link to="/politica-de-privacidade" target="_blank" className="font-medium text-primary hover:underline">
                Política de Privacidade
              </Link>
            </label>
          </div>
          {form.formState.errors.termsAccepted && (
            <p className="mt-1 text-xs font-medium text-destructive">
              {form.formState.errors.termsAccepted.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-linear-to-b from-primary to-[oklch(0.5_0.235_292)] text-sm font-semibold text-white shadow-xs transition-all hover:brightness-110 disabled:opacity-60"
        >
          {isLoading
            ? <div className="flex items-center gap-2"><Loading /><span>Criando...</span></div>
            : 'Criar conta'
          }
        </button>
      </form>

      <div className="mt-5 flex w-full items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">ou</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <GoogleAuthButton className="mt-5" />

      <p className="mt-10 text-sm text-muted-foreground">
        Já tem uma conta?{' '}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Faça login
        </Link>
      </p>
    </div>
  )
}
