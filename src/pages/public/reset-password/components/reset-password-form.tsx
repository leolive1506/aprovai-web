import { useResetPassword } from '@/api/auth/hooks'
import { InputForm } from '@/components/form/input-form'
import { Button } from '@/components/ui/button'
import { FieldGroup, FieldLabel } from '@/components/ui/field'
import { getApiErrorMessage } from '@/lib/utils'
import { resetPasswordSchema, type ResetPasswordFormData } from '@/validation-schemas/reset-password'
import { zodResolver } from '@hookform/resolvers/zod'
import { KeyRound } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

export function ResetPasswordForm() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const {
    mutateAsync: resetPassword,
    isPending: isPendingResetPassword
  } = useResetPassword()

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
    },
  })

  const { handleSubmit, control, formState: { isSubmitting } } = form

  const onSubmit = handleSubmit(async (data: ResetPasswordFormData) => {
    try {
      await resetPassword({ token, password: data.password })
      toast.success('Senha redefinida com sucesso!')
      navigate('/login')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Erro ao redefinir senha. O link pode ter expirado.'))
    }
  })

  const isPending = isSubmitting || isPendingResetPassword

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Redefinir senha
        </h1>
        <p className="text-sm leading-relaxed text-gray-500">
          Digite sua nova senha abaixo para concluir a recuperação.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <FieldGroup>
          <FieldLabel htmlFor="password">Nova senha</FieldLabel>
          <InputForm
            required
            id="password"
            type="password"
            name="password"
            control={control}
            placeholder="••••••••"
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
            Redefinindo...
          </>
        ) : (
          <>
            <KeyRound className="size-4" />
            Redefinir senha
          </>
        )}
      </Button>
    </form>
  )
}
