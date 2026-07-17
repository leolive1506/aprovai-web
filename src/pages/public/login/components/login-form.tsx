import { InputForm } from '@/components/form/input-form'
import { Button } from '@/components/ui/button'
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
	FieldSeparator,
} from '@/components/ui/field'
import { useAuth } from '@/hooks/use-auth'
import { loginFormSchema, type LoginFormData } from '@/validation-schemas/login'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useSearchParams } from 'react-router-dom'

export function LoginForm() {

	const { login } = useAuth()
	const [searchParams] = useSearchParams()
	const [showPassword, setShowPassword] = useState(false)

	const form = useForm<LoginFormData>({
		resolver: zodResolver(loginFormSchema),
		defaultValues: {
			email: searchParams.get("email") ?? "",
			password: "",
		},
	});

	const { handleSubmit, control, formState: { isSubmitting } } = form

	const onSubmit = handleSubmit(async (data: LoginFormData) => {
		await login(data);
	});

	return (
		<form onSubmit={onSubmit} className="w-full">
			<FieldGroup>
				<div className="flex flex-col gap-1">
					<h1 className="text-2xl font-bold">Gestão inteligente da sua cidade</h1>
					<p className="text-sm text-balance text-muted-foreground">
						Crie sua conta ou faça login
					</p>
				</div>
				<Field>
					<FieldLabel htmlFor="email">Email</FieldLabel>
					<InputForm
						control={control}
						required
						id="email"
						type="email"
						name="email"
						autoComplete='email webauthn'
						inputMode='email'
						placeholder="m@example.com" className="h-10"
					/>
				</Field>
				<Field>
					<div className="flex items-center">
						<FieldLabel htmlFor="password">Senha</FieldLabel>
						<Link
							to="/forgot-password"
							className="ml-auto hover:text-primary text-muted-foreground transition-all duration-200 text-sm text-balance underline-offset-4 hover:underline"
						>
							Esqueceu sua senha?
						</Link>
					</div>
					<div className="relative">
						<InputForm
							required
							id="password"
							name="password"
							type={showPassword ? 'text' : 'password'}
							inputMode='text'
							control={control}
							autoComplete='current-password webauthn'
							className="h-10 pr-10"
						/>
						<button
							type="button"
							onClick={() => setShowPassword(v => !v)}
							className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
							tabIndex={-1}
							aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
						>
							{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
						</button>
					</div>
				</Field>
				<Field>
					<Button type="submit" disabled={isSubmitting} className="h-10">
						{isSubmitting && <Loader2 className="size-4 animate-spin" />}
						{isSubmitting ? "Entrando..." : "Login"}
					</Button>
				</Field>
				<FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">Ou continue com</FieldSeparator>
				<Field>
					<Button
						type="button"
						variant="secondary"
							className="h-10"
						onClick={() => {
							window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`
						}}
					>
						<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
							<path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
							<path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
							<path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
						</svg>
						Continuar com o Google
					</Button>
				</Field>
			</FieldGroup>
			<FieldGroup className="mt-4">
				<Field>
					<FieldDescription className="text-center">
						Ainda não tem uma conta? <Link to="/sign-up">Cadastre-se</Link>
					</FieldDescription>
          <p className="text-[10px] text-center text-muted-foreground mt-2 px-6">
            Ao continuar, você concorda com nossos{" "}
            <Link to="/termos-de-uso" className="underline hover:text-primary">Termos de Uso</Link>{" "}
            e{" "}
            <Link to="/politica-de-privacidade" className="underline hover:text-primary">Política de Privacidade</Link>.
          </p>
				</Field>
			</FieldGroup>
		</form >
	)
}
