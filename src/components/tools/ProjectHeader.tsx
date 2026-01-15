import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Building2, Hammer } from 'lucide-react';

type InvestmentType = 'ready' | 'build-to-suit';

interface ProjectHeaderProps {
  projectName: string;
  onProjectNameChange: (name: string) => void;
  investmentType: InvestmentType;
  onInvestmentTypeChange: (type: InvestmentType) => void;
  className?: string;
}

export function ProjectHeader({
  projectName,
  onProjectNameChange,
  investmentType,
  onInvestmentTypeChange,
  className,
}: ProjectHeaderProps) {
  return (
    <div className={cn('bg-card rounded-lg border border-border p-4 shadow-card space-y-4', className)}>
      {/* Project Name */}
      <div className="space-y-2">
        <Label htmlFor="project-name" className="text-sm font-medium">
          Nome do Projeto
        </Label>
        <Input
          id="project-name"
          placeholder="Ex: Edifício Centro SP"
          value={projectName}
          onChange={(e) => onProjectNameChange(e.target.value)}
          className="font-medium"
        />
      </div>

      {/* Investment Type Toggle */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Tipo de Investimento</Label>
        <div className="flex rounded-lg border border-border overflow-hidden">
          <button
            type="button"
            onClick={() => onInvestmentTypeChange('ready')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium transition-all',
              investmentType === 'ready'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            )}
          >
            <Building2 className="h-4 w-4" />
            Compra Pronta
          </button>
          <button
            type="button"
            onClick={() => onInvestmentTypeChange('build-to-suit')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium transition-all',
              investmentType === 'build-to-suit'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            )}
          >
            <Hammer className="h-4 w-4" />
            Build-to-Suit
          </button>
        </div>
      </div>
    </div>
  );
}