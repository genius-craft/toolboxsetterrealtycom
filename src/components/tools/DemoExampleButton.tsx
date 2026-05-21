import React from 'react';
import { Button } from '@/components/ui/button';
import { Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface DemoExampleButtonProps {
  onLoad: () => void;
  description?: string;
  className?: string;
}

/**
 * Botão padrão "Ver exemplo" — carrega um caso pré-preenchido na calculadora
 * para o usuário entender a ferramenta sem precisar preencher do zero.
 */
export function DemoExampleButton({ onLoad, description, className }: DemoExampleButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onLoad}
          className={cn(
            'border-accent/40 text-accent hover:bg-accent/10 hover:text-accent active:scale-[0.97] transition-all',
            className
          )}
        >
          <Lightbulb className="h-4 w-4 mr-1.5" />
          Ver exemplo
        </Button>
      </TooltipTrigger>
      {description && <TooltipContent className="max-w-xs">{description}</TooltipContent>}
    </Tooltip>
  );
}
