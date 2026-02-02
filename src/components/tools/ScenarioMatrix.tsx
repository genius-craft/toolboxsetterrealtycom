import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatPercentage, formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface ScenarioData {
  capRate: number;
  noiMonthly: number;
  paybackYears: number;
  vacancyPremise: number;
}

interface ScenarioMatrixProps {
  pessimistic: ScenarioData;
  realistic: ScenarioData;
  optimistic: ScenarioData;
  className?: string;
}

const tooltips = {
  capRate: 'Taxa de capitalização: NOI / Valor do investimento',
  noiMonthly: 'Resultado operacional líquido mensal após vacância e despesas',
  payback: 'Tempo estimado para recuperar o investimento inicial',
  vacancy: 'Premissa de vacância utilizada no cenário',
};

const metrics = [
  { key: 'capRate', label: 'Cap Rate', tooltip: tooltips.capRate, format: (v: number) => formatPercentage(v) },
  { key: 'noiMonthly', label: 'NOI Mensal', tooltip: tooltips.noiMonthly, format: (v: number) => formatCurrency(v) },
  { key: 'payback', label: 'Payback', tooltip: tooltips.payback, format: (v: number) => `${v.toFixed(1)} anos` },
  { key: 'vacancy', label: 'Vacância', tooltip: tooltips.vacancy, format: (v: number) => formatPercentage(v) },
];

// Mobile card component for each scenario
function ScenarioCard({ label, data, colorClass }: { label: string; data: ScenarioData; colorClass: string }) {
  return (
    <div className={cn('rounded-lg border p-3', colorClass)}>
      <h4 className="font-semibold text-sm mb-3">{label}</h4>
      <div className="grid grid-cols-2 gap-2">
        {metrics.map((metric) => {
          const value = 
            metric.key === 'capRate' ? data.capRate :
            metric.key === 'noiMonthly' ? data.noiMonthly :
            metric.key === 'payback' ? data.paybackYears :
            data.vacancyPremise;
          
          return (
            <div key={metric.key} className="space-y-0.5">
              <p className="text-[10px] text-muted-foreground">{metric.label}</p>
              <p className="text-xs font-mono font-medium">{metric.format(value)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ScenarioMatrix({ pessimistic, realistic, optimistic, className }: ScenarioMatrixProps) {
  const isMobile = useIsMobile();

  const scenarios = [
    { key: 'pessimistic', label: 'Pessimista', data: pessimistic, headerClass: 'bg-destructive/10 text-destructive', cellClass: 'bg-destructive/5', cardClass: 'bg-destructive/5 border-destructive/20' },
    { key: 'realistic', label: 'Realista', data: realistic, headerClass: 'bg-primary/10 text-primary', cellClass: 'bg-primary/5', cardClass: 'bg-primary/5 border-primary/20' },
    { key: 'optimistic', label: 'Otimista', data: optimistic, headerClass: 'bg-accent/10 text-accent', cellClass: 'bg-accent/5', cardClass: 'bg-accent/10 border-accent/20' },
  ];

  // Mobile: Card layout
  if (isMobile) {
    return (
      <div className={cn('bg-card rounded-lg border border-border shadow-card overflow-hidden', className)}>
        <div className="p-3 border-b border-border">
          <h3 className="font-serif text-base">Matriz de Cenários</h3>
          <p className="text-xs text-muted-foreground">Comparativo entre cenários</p>
        </div>
        <div className="p-3 space-y-3">
          {scenarios.map((scenario) => (
            <ScenarioCard 
              key={scenario.key} 
              label={scenario.label} 
              data={scenario.data} 
              colorClass={scenario.cardClass}
            />
          ))}
        </div>
      </div>
    );
  }

  // Desktop: Table layout
  return (
    <div className={cn('bg-card rounded-lg border border-border shadow-card overflow-hidden', className)}>
      <div className="p-4 border-b border-border">
        <h3 className="font-serif text-lg">Matriz de Cenários</h3>
        <p className="text-sm text-muted-foreground">Comparativo entre cenários</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left p-3 bg-muted/50 font-medium text-muted-foreground min-w-[140px]">Métrica</th>
              {scenarios.map((scenario) => (
                <th 
                  key={scenario.key} 
                  className={cn('text-center p-3 font-semibold min-w-[120px]', scenario.headerClass)}
                >
                  {scenario.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metrics.map((metric, idx) => (
              <tr key={metric.key} className={idx % 2 === 0 ? 'bg-muted/20' : ''}>
                <td className="p-3 font-medium text-foreground">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="inline-flex items-center gap-1.5 cursor-help">
                          {metric.label}
                          <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-[200px]">{metric.tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </td>
                {scenarios.map((scenario) => {
                  const value = 
                    metric.key === 'capRate' ? scenario.data.capRate :
                    metric.key === 'noiMonthly' ? scenario.data.noiMonthly :
                    metric.key === 'payback' ? scenario.data.paybackYears :
                    scenario.data.vacancyPremise;
                  
                  return (
                    <td 
                      key={scenario.key} 
                      className={cn('text-center p-3 font-mono font-medium', scenario.cellClass)}
                    >
                      {metric.format(value)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
