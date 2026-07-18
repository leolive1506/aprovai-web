import Logo from '@/assets/aprovai.svg'
import { GoogleAuthButton } from '@/components/google-auth-button'
import { InputForm } from '@/components/form/input-form'
import { useAuth } from '@/hooks/use-auth'
import { loginFormSchema, type LoginFormData } from '@/validation-schemas/login'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useSearchParams } from 'react-router-dom'

const inputClassName =
	'h-11 w-full rounded-xl border-border bg-card px-3.5 shadow-xs transition-shadow focus-visible:ring-2 focus-visible:ring-primary/40'

export function LoginForm() {
	const { login } = useAuth()
	const [searchParams] = useSearchParams()
	const [showPassword, setShowPassword] = useState(false)

	const { handleSubmit, control, watch, formState: { isSubmitting } } = useForm<LoginFormData>({
		resolver: zodResolver(loginFormSchema),
		defaultValues: {
			email: searchParams.get('email') ?? '',
			password: '',
		},
	})

	const email = watch('email')

	const onSubmit = handleSubmit(async (data: LoginFormData) => {
		await login(data)
	})

	return (
		<div className="flex flex-col items-center">
			<img src={Logo} alt="AprovIA" className="h-7 w-auto" />

			<div className="mt-4 text-center">
				<h1 className="text-xl font-bold tracking-tight text-neutral-700 dark:text-neutral-200">
					Entrar na AprovIA
				</h1>
			</div>

			<div className="mt-6 w-full">
				<form onSubmit={onSubmit} className="flex flex-col gap-3">
					<InputForm
						required
						id="email"
						name="email"
						type="email"
						control={control}
						autoComplete="email webauthn"
						inputMode="email"
						placeholder="seu@email.com"
						className={inputClassName}
					/>

					<div className="relative">
						<InputForm
							required
							id="password"
							name="password"
							type={showPassword ? 'text' : 'password'}
							control={control}
							autoComplete="current-password webauthn"
							placeholder="Sua senha"
							className={`${inputClassName} pr-11`}
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

					<div className="flex justify-end">
						<Link to="/forgot-password" className="text-xs font-medium text-primary hover:underline">
							Esqueceu a senha?
						</Link>
					</div>

					<button
						type="submit"
						disabled={isSubmitting}
						className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-linear-to-b from-primary to-[oklch(0.5_0.235_292)] text-sm font-semibold text-white shadow-xs transition-all hover:brightness-110 disabled:opacity-60"
					>
						{isSubmitting && <Loader2 className="size-4 animate-spin" />}
						{isSubmitting ? 'Entrando...' : 'Entrar'}
					</button>
				</form>

				<div className="my-5 flex items-center gap-3">
					<div className="h-px flex-1 bg-border" />
					<span className="text-xs text-muted-foreground">ou</span>
					<div className="h-px flex-1 bg-border" />
				</div>

				<GoogleAuthButton />
			</div>

			<p className="mt-10 text-sm text-muted-foreground">
				Não tem uma conta?{' '}
				<Link
					to={`/sign-up${email ? `?email=${encodeURIComponent(email)}` : ''}`}
					className="font-medium text-primary hover:underline"
				>
					Cadastre-se
				</Link>
			</p>
		</div>
	)
}
