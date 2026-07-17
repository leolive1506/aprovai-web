import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

export function GoogleCallback() {
  const navigate = useNavigate();
  const { handleGoogleLogin } = useAuth();
  const isProcessing = useRef(false);

  useEffect(() => {
    if (!isProcessing.current) {
      isProcessing.current = true;
      handleGoogleLogin()
        .catch(() => {
          navigate('/login');
        });
    }
  }, [navigate, handleGoogleLogin]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm font-medium">
          Concluindo autenticação...
        </p>
      </div>
    </div>
  );
}
