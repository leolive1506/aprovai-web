import { SignUpForm } from './components/sign-up-form'

export function SignUp() {
	return (
		<div className="flex min-h-screen w-full items-center justify-center bg-[#fbfaf9] p-4 dark:bg-neutral-950">
			<div className="w-full max-w-sm">
				<SignUpForm />
			</div>
		</div>
	)
}
