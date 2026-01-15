import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuthModal } from '@/components/auth/AuthModal';
import { useAuth } from '@/contexts/AuthContext';

interface SoftLockOverlayProps {
  children: React.ReactNode;
  featureName?: string;
}

export function SoftLockOverlay({ children, featureName = 'este recurso' }: SoftLockOverlayProps) {
  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  if (user) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="relative">
        {/* Blurred content */}
        <div className="blur-md select-none pointer-events-none">
          {children}
        </div>
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-card/60 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center gap-3 p-4">
          <div className="p-3 bg-secondary rounded-full">
            <Lock className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground text-center max-w-xs">
            Faça login gratuito para acessar {featureName}
          </p>
          <Button
            variant="gold"
            size="sm"
            onClick={() => setAuthModalOpen(true)}
          >
            Entrar
          </Button>
        </div>
      </div>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </>
  );
}
