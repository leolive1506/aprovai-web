import { LoginForm } from './components/login-form'

export function Login() {
	return (
		<div className="flex min-h-screen w-full items-center justify-center bg-[#fbfaf9] p-4 dark:bg-neutral-950">
			<div className="w-full max-w-sm">
				<LoginForm />
			</div>
		</div>
	)
}
