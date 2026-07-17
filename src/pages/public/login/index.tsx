import LoginLeft from '../../../assets/login-left.png'
import LoginRight from '../../../assets/login-right.png'
import Logo from '../../../assets/logo-new.png'
import { LoginForm } from './components/login-form'

export function Login() {
	return (
		<div className="flex h-screen w-screen">
			<div className="flex w-full lg:w-1/2 flex-col items-center justify-center gap-4 p-4">
				<div className="max-w-md w-full">
					<div className="flex w-full justify-start">
						<img src={Logo} alt="Logo Gabinete" className="w-48" />
					</div>
					<LoginForm />
				</div>
			</div>
			<div className="w-1/2 hidden lg:flex items-center justify-center gap-4 p-4">
				<img
					src={LoginLeft}
					alt="Login background"
					className=" w-2/5 rounded-lg"
				/>

				<img
					src={LoginRight}
					alt="Login background"
					className=" w-2/5 rounded-lg"
				/>
			</div>
		</div>
	)
}
