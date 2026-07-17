import Logo from '@/assets/logo-new.png'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { VerifyEmailContent } from './components/verify-email-content'

export function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-auth-gradient">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-20 blur-3xl bg-primary" />
        <div className="absolute bottom-0 -left-24 w-80 h-80 rounded-full opacity-15 blur-3xl bg-primary/30" />
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 flex flex-col gap-6 animate-card-enter shadow-auth-card">
        <div className="flex justify-start">
          <Link to="/login" className="transition-opacity hover:opacity-70">
            <img src={Logo} alt="Logo Gabinete" className="h-14 w-auto" />
          </Link>
        </div>

        <VerifyEmailContent token={token} />
      </div>
    </div>
  )
}
