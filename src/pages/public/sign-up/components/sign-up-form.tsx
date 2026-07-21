import Logo from '@/assets/aprovai.svg'
import { GoogleAuthButton } from '@/components/google-auth-button'
import { InputForm } from '@/components/form/input-form'
import { registerFormSchema, type RegisterFormData } from '@/validation-schemas/register'
import { useAuth } from '@/hooks/use-auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, Eye, EyeOff, X } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

export function SignUpForm() {
  const navigate = useNavigate()
  const { signUp } = useAuth()
  const [searchParams] = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)

  const emailParam = searchParams.get('email')

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: { name: '', email: emailParam ?? '', password: '', termsAccepted: false as unknown as true },
  })

  const { control, handleSubmit, formState: { isSubmitting } } = form
  const password = useWatch({ control, name: 'password' })
  const hasMinLength = password.length >= 8
  const isLoading = isSubmitting

  const onSubmit = handleSubmit(async (data: RegisterFormData) => {
    try {
      await signUp(data)
      navigate('/onboarding')
    } catch {
      return
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

        <div className="flex items-center">
          <div className="flex gap-2.5 items-center">
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
          className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-linear-to-b from-primary to-brand-deep text-sm font-semibold text-white shadow-xs transition-all hover:brightness-110 disabled:opacity-60"
        >
          Criar conta
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
