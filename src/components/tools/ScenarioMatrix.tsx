import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatPercentage, formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';

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

export function ScenarioMatrix({ pessimistic, realistic, optimistic, className }: ScenarioMatrixProps) {
  const scenarios = [
    { key: 'pessimistic', label: 'Pessimista', data: pessimistic, headerClass: 'bg-destructive/10 text-destructive', cellClass: 'bg-destructive/5' },
    { key: 'realistic', label: 'Realista', data: realistic, headerClass: 'bg-primary/10 text-primary', cellClass: 'bg-primary/5' },
    { key: 'optimistic', label: 'Otimista', data: optimistic, headerClass: 'bg-accent/10 text-accent', cellClass: 'bg-accent/5' },
  ];

  const metrics = [
    { key: 'capRate', label: 'Cap Rate', tooltip: tooltips.capRate, format: (v: number) => formatPercentage(v) },
    { key: 'noiMonthly', label: 'NOI Mensal', tooltip: tooltips.noiMonthly, format: (v: number) => formatCurrency(v) },
    { key: 'payback', label: 'Payback', tooltip: tooltips.payback, format: (v: number) => `${v.toFixed(1)} anos` },
    { key: 'vacancy', label: 'Premissa Vacância', tooltip: tooltips.vacancy, format: (v: number) => formatPercentage(v) },
  ];

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