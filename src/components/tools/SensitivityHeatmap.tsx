import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { formatPercentage, formatCurrency } from '@/lib/formatters';

interface SensitivityHeatmapProps {
  baseInvestment: number;
  baseRent: number;
  calculateCapRate: (investment: number, rent: number) => number;
  className?: string;
}

const VARIATIONS = [-0.15, -0.10, -0.05, 0, 0.05, 0.10, 0.15];

function getColorForCapRate(capRate: number): string {
  // Color scale: Red (risk) -> Yellow (neutral) -> Green (opportunity)
  if (capRate < 0.04) return 'bg-red-500/80 text-white';
  if (capRate < 0.05) return 'bg-red-400/70 text-white';
  if (capRate < 0.06) return 'bg-orange-400/70 text-white';
  if (capRate < 0.07) return 'bg-yellow-400/70 text-foreground';
  if (capRate < 0.08) return 'bg-yellow-300/70 text-foreground';
  if (capRate < 0.09) return 'bg-lime-400/70 text-foreground';
  if (capRate < 0.10) return 'bg-green-400/70 text-white';
  return 'bg-green-500/80 text-white';
}

export function SensitivityHeatmap({ 
  baseInvestment, 
  baseRent, 
  calculateCapRate,
  className 
}: SensitivityHeatmapProps) {
  const matrix = useMemo(() => {
    return VARIATIONS.map((rentVar) => {
      return VARIATIONS.map((invVar) => {
        const adjustedInvestment = baseInvestment * (1 + invVar);
        const adjustedRent = baseRent * (1 + rentVar);
        const annualRent = adjustedRent * 12;
        // Simplified cap rate: annual rent / investment (no expenses for sensitivity)
        const capRate = calculateCapRate(adjustedInvestment, annualRent);
        return {
          capRate,
          investment: adjustedInvestment,
          rent: adjustedRent,
          isBase: invVar === 0 && rentVar === 0,
        };
      });
    });
  }, [baseInvestment, baseRent, calculateCapRate]);

  return (
    <div className={cn('bg-card rounded-lg border border-border shadow-card overflow-hidden', className)}>
      <div className="p-4 border-b border-border">
        <h3 className="font-serif text-lg">Análise de Sensibilidade</h3>
        <p className="text-sm text-muted-foreground">Impacto de variações no investimento e aluguel</p>
      </div>

      {/* Legend */}
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-red-500/80" />
              <span className="text-muted-foreground">Zona de Risco</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-24 rounded-full bg-gradient-to-r from-red-500 via-yellow-400 to-green-500" />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">Zona de Oportunidade</span>
              <div className="w-4 h-4 rounded bg-green-500/80" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto p-4">
        <div className="min-w-[500px]">
          {/* Investment axis header */}
          <div className="flex mb-1">
            <div className="w-20 flex-shrink-0" />
            <div className="flex-1 text-center text-xs font-medium text-muted-foreground mb-2">
              ← Investimento −15% a +15% →
            </div>
          </div>
          
          {/* Column headers (investment variations) */}
          <div className="flex mb-1">
            <div className="w-20 flex-shrink-0 text-right pr-2 text-xs font-medium text-muted-foreground self-end pb-1">
              Aluguel ↓
            </div>
            {VARIATIONS.map((v) => (
              <div 
                key={v} 
                className="flex-1 text-center text-xs font-medium text-muted-foreground px-1"
              >
                {v === 0 ? 'Base' : `${v > 0 ? '+' : ''}${(v * 100).toFixed(0)}%`}
              </div>
            ))}
          </div>

          {/* Matrix rows */}
          {matrix.map((row, rowIdx) => (
            <div key={rowIdx} className="flex mb-1">
              {/* Row header (rent variation) */}
              <div className="w-20 flex-shrink-0 text-right pr-2 text-xs font-medium text-muted-foreground self-center">
                {VARIATIONS[rowIdx] === 0 ? 'Base' : `${VARIATIONS[rowIdx] > 0 ? '+' : ''}${(VARIATIONS[rowIdx] * 100).toFixed(0)}%`}
              </div>
              
              {/* Cells */}
              {row.map((cell, colIdx) => (
                <div
                  key={colIdx}
                  className={cn(
                    'flex-1 aspect-square min-h-[48px] flex items-center justify-center text-xs font-mono font-medium rounded-sm mx-0.5 transition-all',
                    getColorForCapRate(cell.capRate),
                    cell.isBase && 'ring-2 ring-primary ring-offset-1 ring-offset-background'
                  )}
                  title={`Investimento: ${formatCurrency(cell.investment)}\nAluguel: ${formatCurrency(cell.rent)}/mês\nCap Rate: ${formatPercentage(cell.capRate)}`}
                >
                  {formatPercentage(cell.capRate)}
                </div>
              ))}
            </div>
          ))}

          {/* Base indicator */}
          <div className="flex justify-center mt-4">
            <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-4 h-4 rounded-sm ring-2 ring-primary bg-muted" />
              <span>Cenário Atual</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}