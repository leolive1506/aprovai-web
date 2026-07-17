import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { AuthApi } from "@/api/auth";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export function ConfirmPasswordPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const navigate = useNavigate();
  const { logout } = useAuth();
  const token = searchParams.get("token");

  useEffect(() => {
    async function confirm() {
      if (!token) {
        setStatus("error");
        return;
      }

      try {
        await AuthApi.confirmChangePassword(token);
        setStatus("success");
        toast.success("Sua senha foi alterada com sucesso!");
      } catch (error) {
        setStatus("error");
        toast.error("Link inválido ou expirado.");
      }
    }

    confirm();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border p-8 text-center space-y-6">
        {status === "loading" && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <h1 className="text-xl font-semibold">Confirmando alteração...</h1>
            <p className="text-muted-foreground">Estamos validando sua solicitação.</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
            <h1 className="text-2xl font-bold">Tudo pronto!</h1>
            <p className="text-muted-foreground">
              Sua senha foi atualizada. Agora você pode acessar sua conta com a nova senha.
            </p>
            <Button className="w-full mt-4" onClick={() => logout()}>
              Ir para o Login
            </Button>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
            <XCircle className="h-16 w-16 text-red-500" />
            <h1 className="text-2xl font-bold">Algo deu errado</h1>
            <p className="text-muted-foreground">
              O link de confirmação parece ser inválido ou já expirou.
            </p>
            <Button variant="outline" className="w-full mt-4" onClick={() => navigate("/")}>
              Voltar ao Início
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
