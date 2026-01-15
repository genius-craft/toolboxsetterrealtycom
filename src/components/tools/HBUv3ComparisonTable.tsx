import React from 'react';
import { cn } from '@/lib/utils';
import { formatCompactCurrency, formatPercentage, formatArea } from '@/lib/formatters';
import { CheckCircle } from 'lucide-react';
import { HBUv3ScenarioResult } from '@/lib/calculations';
import { SoftLockOverlay } from './SoftLockOverlay';

interface HBUv3ComparisonTableProps {
  residencial: HBUv3ScenarioResult;
  comercial: HBUv3ScenarioResult;
  misto: HBUv3ScenarioResult;
  winner: 'residencial' | 'comercial' | 'misto';
}

interface MetricRow {
  label: string;
  getValue: (r: HBUv3ScenarioResult) => string;
  highlight?: boolean;
  locked?: boolean;
}

export function HBUv3ComparisonTable({ residencial, comercial, misto, winner }: HBUv3ComparisonTableProps) {
  const scenarios: { key: 'residencial' | 'comercial' | 'misto'; result: HBUv3ScenarioResult }[] = [
    { key: 'residencial', result: residencial },
    { key: 'comercial', result: comercial },
    { key: 'misto', result: misto },
  ];

  const metrics: MetricRow[] = [
    { 
      label: 'Área Construível', 
      getValue: (r) => formatArea(r.buildableArea) 
    },
    { 
      label: 'VGV', 
      getValue: (r) => formatCompactCurrency(r.vgv),
      locked: true,
    },
    { 
      label: 'Custo de Construção', 
      getValue: (r) => formatCompactCurrency(r.constructionCost) 
    },
    { 
      label: 'Custo do Terreno', 
      getValue: (r) => formatCompactCurrency(r.landCost) 
    },
    { 
      label: 'Lucro Bruto', 
      getValue: (r) => formatCompactCurrency(r.grossProfit),
      locked: true,
    },
    { 
      label: 'Margem Bruta', 
      getValue: (r) => formatPercentage(r.margin),
      locked: true,
    },
    { 
      label: 'VPL', 
      getValue: (r) => formatCompactCurrency(r.npv),
      highlight: true,
      locked: true,
    },
    { 
      label: 'TIR', 
      getValue: (r) => formatPercentage(r.irr),
      locked: true,
    },
    { 
      label: 'Payback', 
      getValue: (r) => `${r.paybackMonths} meses` 
    },
    { 
      label: 'Score', 
      getValue: (r) => `${r.score}/100`,
      highlight: true,
    },
  ];

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="text-left p-3 font-medium text-muted-foreground">Métrica</th>
              {scenarios.map(({ key, result }) => (
                <th key={key} className="text-center p-3">
                  <div className="flex items-center justify-center gap-2">
                    <span className={cn(
                      'font-serif font-medium',
                      winner === key && 'text-accent'
                    )}>
                      {result.name}
                    </span>
                    {winner === key && (
                      <CheckCircle className="h-4 w-4 text-accent" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metrics.map((metric, idx) => (
              <tr 
                key={metric.label} 
                className={cn(
                  'border-b border-border/50',
                  idx % 2 === 0 ? 'bg-background' : 'bg-secondary/20',
                  metric.highlight && 'bg-accent/5'
                )}
              >
                <td className={cn(
                  'p-3 text-muted-foreground',
                  metric.highlight && 'font-medium text-foreground'
                )}>
                  {metric.label}
                </td>
                {scenarios.map(({ key, result }) => {
                  const isWinnerCell = winner === key;
                  const cellContent = (
                    <span className={cn(
                      'font-mono',
                      isWinnerCell && metric.highlight && 'text-accent font-semibold'
                    )}>
                      {metric.getValue(result)}
                    </span>
                  );

                  return (
                    <td key={key} className="text-center p-3">
                      {metric.locked ? (
                        <SoftLockOverlay featureName={metric.label.toLowerCase()}>
                          {cellContent}
                        </SoftLockOverlay>
                      ) : (
                        cellContent
                      )}
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
