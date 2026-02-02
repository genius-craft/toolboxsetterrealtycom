import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { formatPercentage, formatCurrency } from '@/lib/formatters';
import { useIsMobile } from '@/hooks/use-mobile';

interface SensitivityHeatmapProps {
  baseInvestment: number;
  baseMonthlyRent: number;
  vacancyRate: number;
  propertyTax: number;
  condoFee: number;
  managementFeeRate: number;
  className?: string;
}

const DESKTOP_VARIATIONS = [-0.15, -0.10, -0.05, 0, 0.05, 0.10, 0.15];
const MOBILE_VARIATIONS = [-0.10, -0.05, 0, 0.05, 0.10];

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
  baseMonthlyRent, 
  vacancyRate,
  propertyTax,
  condoFee,
  managementFeeRate,
  className 
}: SensitivityHeatmapProps) {
  const isMobile = useIsMobile();
  const VARIATIONS = isMobile ? MOBILE_VARIATIONS : DESKTOP_VARIATIONS;

  const matrix = useMemo(() => {
    return VARIATIONS.map((rentVar) => {
      return VARIATIONS.map((invVar) => {
        const adjustedInvestment = baseInvestment * (1 + invVar);
        const adjustedMonthlyRent = baseMonthlyRent * (1 + rentVar);
        
        // Calculate real NOI
        const annualGrossRent = adjustedMonthlyRent * 12;
        const effectiveRent = annualGrossRent * (1 - vacancyRate);
        const managementFee = effectiveRent * managementFeeRate;
        const totalOpex = propertyTax + condoFee + managementFee;
        const noi = effectiveRent - totalOpex;
        
        // Cap Rate = NOI / Total Investment
        const capRate = adjustedInvestment > 0 ? noi / adjustedInvestment : 0;
        
        return {
          capRate,
          investment: adjustedInvestment,
          rent: adjustedMonthlyRent,
          isBase: invVar === 0 && rentVar === 0,
        };
      });
    });
  }, [baseInvestment, baseMonthlyRent, vacancyRate, propertyTax, condoFee, managementFeeRate, VARIATIONS]);

  return (
    <div className={cn('bg-card rounded-lg border border-border shadow-card overflow-hidden', className)}>
      <div className="p-3 sm:p-4 border-b border-border">
        <h3 className="font-serif text-base sm:text-lg">Análise de Sensibilidade</h3>
        <p className="text-xs sm:text-sm text-muted-foreground">Impacto de variações no investimento e aluguel</p>
      </div>

      {/* Legend - Simplified on mobile */}
      <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between text-[10px] sm:text-xs gap-2">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-red-500/80" />
            <span className="text-muted-foreground hidden sm:inline">Zona de Risco</span>
            <span className="text-muted-foreground sm:hidden">Risco</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 sm:h-3 w-16 sm:w-24 rounded-full bg-gradient-to-r from-red-500 via-yellow-400 to-green-500" />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground hidden sm:inline">Zona de Oportunidade</span>
            <span className="text-muted-foreground sm:hidden">Oportunidade</span>
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-green-500/80" />
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto p-3 sm:p-4">
        <div className="min-w-[280px] sm:min-w-[500px]">
          {/* Investment axis header */}
          <div className="flex mb-1">
            <div className="w-14 sm:w-20 flex-shrink-0" />
            <div className="flex-1 text-center text-[10px] sm:text-xs font-medium text-muted-foreground mb-2">
              ← Investimento {isMobile ? '±10%' : '−15% a +15%'} →
            </div>
          </div>
          
          {/* Column headers (investment variations) */}
          <div className="flex mb-1">
            <div className="w-14 sm:w-20 flex-shrink-0 text-right pr-1 sm:pr-2 text-[10px] sm:text-xs font-medium text-muted-foreground self-end pb-1">
              Aluguel ↓
            </div>
            {VARIATIONS.map((v) => (
              <div 
                key={v} 
                className="flex-1 text-center text-[10px] sm:text-xs font-medium text-muted-foreground px-0.5 sm:px-1"
              >
                {v === 0 ? 'Base' : `${v > 0 ? '+' : ''}${(v * 100).toFixed(0)}%`}
              </div>
            ))}
          </div>

          {/* Matrix rows */}
          {matrix.map((row, rowIdx) => (
            <div key={rowIdx} className="flex mb-0.5 sm:mb-1">
              {/* Row header (rent variation) */}
              <div className="w-14 sm:w-20 flex-shrink-0 text-right pr-1 sm:pr-2 text-[10px] sm:text-xs font-medium text-muted-foreground self-center">
                {VARIATIONS[rowIdx] === 0 ? 'Base' : `${VARIATIONS[rowIdx] > 0 ? '+' : ''}${(VARIATIONS[rowIdx] * 100).toFixed(0)}%`}
              </div>
              
              {/* Cells */}
              {row.map((cell, colIdx) => (
                <div
                  key={colIdx}
                  className={cn(
                    'flex-1 aspect-square min-h-[36px] sm:min-h-[48px] flex items-center justify-center text-[10px] sm:text-xs font-mono font-medium rounded-sm mx-0.5 transition-all',
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
          <div className="flex justify-center mt-3 sm:mt-4">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-sm ring-2 ring-primary bg-muted" />
              <span>Cenário Atual</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
