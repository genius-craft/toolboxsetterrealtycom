import { AlertTriangle } from 'lucide-react';

interface VitrineDisclaimerProps {
  variant?: 'banner' | 'footer';
}

export function VitrineDisclaimer({ variant = 'banner' }: VitrineDisclaimerProps) {
  if (variant === 'footer') {
    return (
      <div className="border-t border-border bg-muted/30 py-4">
        <div className="container mx-auto px-4">
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            <strong>AVISO LEGAL:</strong> Esta vitrine tem caráter exclusivamente informativo. 
            A intermediação de compra, venda ou locação de imóveis é realizada por corretor 
            inscrito no CRECI. Esta plataforma não constitui oferta de valores mobiliários 
            nos termos da regulamentação da CVM.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground leading-relaxed">
          <strong className="text-foreground">AVISO LEGAL:</strong> Esta vitrine tem caráter 
          exclusivamente informativo. A intermediação de compra, venda ou locação de imóveis 
          é realizada por corretor inscrito no CRECI. Esta plataforma não constitui oferta 
          de valores mobiliários nos termos da regulamentação da CVM.
        </p>
      </div>
    </div>
  );
}
