import { useForgotPassword } from '@/api/auth/hooks'
import { InputForm } from '@/components/form/input-form'
import { Button } from '@/components/ui/button'
import { FieldGroup, FieldLabel } from '@/components/ui/field'
import { getApiErrorMessage } from '@/lib/utils'
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/validation-schemas/forgot-password'
import { zodResolver } from '@hookform/resolvers/zod'
import { Send } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

export function ForgotPasswordForm() {
  const [submitted, setSubmitted] = useState(false)
  const [sentEmail, setSentEmail] = useState('')

  const {
    mutateAsync: forgotPassword,
    isPending: isPendingForgotPassword
  } = useForgotPassword()

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  const { handleSubmit, control, formState: { isSubmitting } } = form

  const onSubmit = handleSubmit(async (data: ForgotPasswordFormData) => {
    try {
      await forgotPassword(data.email)
      setSentEmail(data.email)
      setSubmitted(true)
      toast.success('E-mail de recuperação enviado com sucesso!')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Erro ao enviar e-mail. Tente novamente.'))
    }
  })

  const isPending = isSubmitting || isPendingForgotPassword

  if (submitted) {
    return (
      <div className="flex flex-col gap-6 animate-fade-slide-in">
        <div className="flex flex-col items-start gap-5">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Verifique seu e-mail
            </h1>
            <p className="text-sm leading-relaxed text-gray-500">
              Enviamos as instruções de recuperação para{' '}
              <span className="font-semibold text-gray-800">{sentEmail}</span>.{' '}
              Verifique também a pasta de spam.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Recuperar senha
        </h1>
        <p className="text-sm leading-relaxed text-gray-500">
          Digite seu e-mail e enviaremos as instruções para redefinir sua senha.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <FieldGroup>
          <FieldLabel htmlFor="email">E-mail</FieldLabel>
          <InputForm
            required
            id="email"
            type="email"
            name="email"
            control={control}
            placeholder="seu@email.com"
          />
        </FieldGroup>
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className={`transition-all border-none ${isPending
          ? 'bg-blue-300 shadow-none'
          : 'bg-auth-btn shadow-auth-btn'
          }`}
      >
        {isPending ? (
          <>
            <span className="inline-block size-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            <Send className="size-4" />
            Enviar instruções
          </>
        )}
      </Button>
    </form>
  )
}
