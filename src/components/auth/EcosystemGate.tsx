import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useUserRole } from '@/hooks/useUserRole';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  /** Optional friendly name of the gated tool, used in the toast/redirect message */
  toolName?: string;
}

/**
 * Restricts access to "Ecossistema Setter" tools (H&BU, Permuta, Preço Teto, Comparar).
 * Admins and super_admins always pass through.
 * Non-members are redirected to /dashboard with an explanatory toast.
 */
export function EcosystemGate({ children, toolName = 'esta ferramenta' }: Props) {
  const { loading, hasEcosystemAccess } = useUserRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !hasEcosystemAccess) {
      toast.info(
        `${toolName} é exclusiva para membros do Ecossistema Setter. Compartilhe um estudo com nosso time para conversarmos.`
      );
      navigate('/dashboard', { replace: true });
    }
  }, [loading, hasEcosystemAccess, navigate, toolName]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!hasEcosystemAccess) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-8">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center space-y-3">
            <Lock className="h-8 w-8 mx-auto text-accent" />
            <p className="font-display text-lg">Acesso restrito</p>
            <p className="text-sm text-muted-foreground">
              {toolName} é exclusiva para membros do Ecossistema Setter.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
