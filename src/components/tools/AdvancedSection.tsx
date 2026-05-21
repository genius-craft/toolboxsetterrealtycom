import React from 'react';
import { useAdvancedMode } from '@/hooks/useAdvancedMode';
import { Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Esconde seções da calculadora quando o usuário está no modo Simples.
 * Quando em modo Avançado, renderiza filhos normalmente com um pequeno selo.
 */
export function AdvancedSection({
  children,
  className,
  label = 'Avançado',
}: {
  children: React.ReactNode;
  className?: string;
  label?: string;
}) {
  const [advanced] = useAdvancedMode();
  if (!advanced) return null;
  return (
    <div className={cn('relative animate-fade-up', className)}>
      <div className="absolute -top-2 left-3 z-10 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-card border border-accent/40 text-[10px] font-medium text-accent uppercase tracking-wide">
        <Settings2 className="h-3 w-3" />
        {label}
      </div>
      {children}
    </div>
  );
}

/**
 * Banner discreto que indica ao usuário no modo Simples que existem
 * campos adicionais ocultos. Renderiza nada se já estiver em Avançado
 * ou se `hiddenCount` for 0.
 */
export function AdvancedHint({ hiddenCount }: { hiddenCount: number }) {
  const [advanced, setAdvanced] = useAdvancedMode();
  if (advanced || hiddenCount <= 0) return null;
  return (
    <button
      type="button"
      onClick={() => setAdvanced(true)}
      className="w-full flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-accent border border-dashed border-border rounded-md py-2 transition-colors"
    >
      <Settings2 className="h-3.5 w-3.5" />
      {hiddenCount} {hiddenCount === 1 ? 'ajuste avançado oculto' : 'ajustes avançados ocultos'} — clique para mostrar
    </button>
  );
}
