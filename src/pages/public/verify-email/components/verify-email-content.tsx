import { useVerifyEmail } from '@/api/auth/hooks'
import { getApiErrorMessage } from '@/lib/utils'
import { CheckCircle, XCircle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

interface VerifyEmailContentProps {
  token: string
}

export function VerifyEmailContent({ token }: VerifyEmailContentProps) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const hasRun = useRef(false)

  const { mutateAsync: verifyEmail } = useVerifyEmail()

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

    verifyEmail(token)
      .then(() => setStatus('success'))
      .catch((error) => {
        setErrorMessage(getApiErrorMessage(error, 'Erro ao verificar e-mail. Tente novamente.'))
        setStatus('error')
      })
  }, [token, verifyEmail])

  if (status === 'loading') {
    return (
      <div className="flex flex-col gap-6 animate-fade-slide-in">
        <div className="flex flex-col items-start gap-5">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Verificando e-mail...
            </h1>
            <p className="text-sm leading-relaxed text-gray-500">
              Aguarde enquanto confirmamos seu endereço de e-mail.
            </p>
          </div>
          <div className="inline-block size-8 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin" />
        </div>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col gap-6 animate-fade-slide-in">
        <div className="flex flex-col items-start gap-5">
          <CheckCircle className="size-10 text-green-500" />
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              E-mail verificado!
            </h1>
            <p className="text-sm leading-relaxed text-gray-500">
              Seu endereço de e-mail foi confirmado com sucesso. Agora você já pode acessar sua conta.
            </p>
          </div>
          <Link
            to="/login"
            className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-800"
          >
            Ir para o login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-slide-in">
      <div className="flex flex-col items-start gap-5">
        <XCircle className="size-10 text-red-500" />
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Falha na verificação
          </h1>
          <p className="text-sm leading-relaxed text-gray-500">
            {errorMessage || 'O link de verificação é inválido ou expirou.'}
          </p>
        </div>
        <Link
          to="/login"
          className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-800"
        >
          Voltar para o login
        </Link>
      </div>
    </div>
  )
}
