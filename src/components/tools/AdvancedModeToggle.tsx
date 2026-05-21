import React from 'react';
import { useAdvancedMode } from '@/hooks/useAdvancedMode';
import { Sparkles, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

/**
 * Toggle compacto Simples ↔ Avançado para inserir na navbar das calculadoras.
 */
export function AdvancedModeToggle({ className }: { className?: string }) {
  const [advanced, setAdvanced] = useAdvancedMode();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            'inline-flex items-center rounded-full border border-primary-foreground/20 bg-primary-foreground/5 p-0.5 text-xs',
            className
          )}
        >
          <button
            type="button"
            onClick={() => setAdvanced(false)}
            className={cn(
              'inline-flex items-center gap-1 px-2.5 py-1 rounded-full transition-all',
              !advanced
                ? 'bg-accent text-accent-foreground font-medium shadow-sm'
                : 'text-primary-foreground/70 hover:text-primary-foreground'
            )}
            aria-pressed={!advanced}
          >
            <Sparkles className="h-3 w-3" />
            <span className="hidden sm:inline">Simples</span>
          </button>
          <button
            type="button"
            onClick={() => setAdvanced(true)}
            className={cn(
              'inline-flex items-center gap-1 px-2.5 py-1 rounded-full transition-all',
              advanced
                ? 'bg-accent text-accent-foreground font-medium shadow-sm'
                : 'text-primary-foreground/70 hover:text-primary-foreground'
            )}
            aria-pressed={advanced}
          >
            <Settings2 className="h-3 w-3" />
            <span className="hidden sm:inline">Avançado</span>
          </button>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        Modo Simples mostra só os campos essenciais. Avançado revela todos os ajustes.
      </TooltipContent>
    </Tooltip>
  );
}
