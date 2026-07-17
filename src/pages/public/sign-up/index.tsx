import { Link } from 'react-router-dom'
import LoginLeft from '../../../assets/login-left.png'
import LoginRight from '../../../assets/login-right.png'
import Logo from '../../../assets/logo-new.png'
import { SignUpForm } from './components/sign-up-form'

export function SignUp() {
	return (
		<div className="grid h-screen lg:grid-cols-2">
			<div className="items-center hidden lg:flex justify-center gap-8">
				<img
					src={LoginLeft}
					alt="Login background"
					className="dark:brightness-[0.2] dark:grayscale w-[45%] rounded-lg"
				/>

				<img
					src={LoginRight}
					alt="Login background"
					className="dark:brightness-[0.2] dark:grayscale w-[45%] rounded-lg"
				/>
			</div>
			<div className="mx-auto flex w-full max-w-lg flex-col items-center justify-center gap-6 p-6">
				<div className="flex w-full justify-start">
					<Link to="#">
						<img src={Logo} alt="Logo Gabinete" />
					</Link>
				</div>
				<div className="flex w-full max-w-3xl flex-col">
					<SignUpForm />
				</div>
			</div>
		</div>
	)
}
