import React from 'react';
import { cn } from '@/lib/utils';
import { formatCompactCurrency, formatPercentage } from '@/lib/formatters';
import { Progress } from '@/components/ui/progress';
import { SoftLockOverlay } from './SoftLockOverlay';
import { Trophy, TrendingUp, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export interface HBUv2Result {
  name: string;
  type: 'incorporar' | 'alugar' | 'bts';
  investment: number;
  returnValue: number;
  npv: number;
  roi: number;
  timeToReturn: number; // months or years
  riskLevel: 'baixo' | 'medio' | 'alto';
  riskDescription: string;
  summary: string;
}

interface HBUScenarioCardProps {
  result: HBUv2Result;
  icon: LucideIcon;
  isWinner: boolean;
  maxNPV: number;
}

const riskColors = {
  baixo: 'text-green-600',
  medio: 'text-amber-600',
  alto: 'text-red-600',
};

const riskBgColors = {
  baixo: 'bg-green-100',
  medio: 'bg-amber-100',
  alto: 'bg-red-100',
};

export function HBUScenarioCard({ result, icon: Icon, isWinner, maxNPV }: HBUScenarioCardProps) {
  const npvProgress = maxNPV > 0 ? (result.npv / maxNPV) * 100 : 0;

  return (
    <div
      className={cn(
        'bg-card rounded-lg border p-5 shadow-card transition-all',
        isWinner ? 'border-accent ring-2 ring-accent/20' : 'border-border'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            'p-2.5 rounded-lg',
            isWinner ? 'bg-accent/10' : 'bg-secondary'
          )}>
            <Icon className={cn('h-5 w-5', isWinner ? 'text-accent' : 'text-muted-foreground')} />
          </div>
          <div>
            <h4 className="font-serif font-medium text-lg">{result.name}</h4>
            <span className={cn(
              'text-xs font-medium px-2 py-0.5 rounded-full',
              riskBgColors[result.riskLevel],
              riskColors[result.riskLevel]
            )}>
              Risco {result.riskLevel.charAt(0).toUpperCase() + result.riskLevel.slice(1)}
            </span>
          </div>
        </div>
        {isWinner && (
          <div className="flex items-center gap-1.5 bg-accent/10 text-accent px-3 py-1.5 rounded-full">
            <Trophy className="h-4 w-4" />
            <span className="text-xs font-semibold">Melhor</span>
          </div>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Investimento</span>
          <p className="font-mono font-semibold text-foreground">
            {formatCompactCurrency(result.investment)}
          </p>
        </div>
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Retorno</span>
          <SoftLockOverlay featureName="o retorno">
            <p className="font-mono font-semibold text-foreground">
              {formatCompactCurrency(result.returnValue)}
            </p>
          </SoftLockOverlay>
        </div>
      </div>

      {/* NPV with Progress */}
      <SoftLockOverlay featureName="o VPL">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Valor Presente Líquido</span>
            <span className={cn(
              'font-mono font-bold text-lg',
              result.npv > 0 ? 'text-green-600' : 'text-red-600'
            )}>
              {formatCompactCurrency(result.npv)}
            </span>
          </div>
          <Progress value={Math.max(0, npvProgress)} className="h-2" />
        </div>
      </SoftLockOverlay>

      {/* ROI and Time */}
      <div className="flex items-center gap-4 text-sm mb-4">
        <SoftLockOverlay featureName="o ROI">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">ROI:</span>
            <span className={cn(
              'font-mono font-medium',
              result.roi > 0.2 ? 'text-green-600' : 'text-foreground'
            )}>
              {formatPercentage(result.roi)}
            </span>
          </div>
        </SoftLockOverlay>
        <div className="flex items-center gap-1.5">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Prazo:</span>
          <span className="font-mono font-medium">
            {result.timeToReturn} {result.type === 'alugar' ? 'anos' : 'meses'}
          </span>
        </div>
      </div>

      {/* Summary */}
      <div className={cn(
        'text-sm p-3 rounded-lg',
        isWinner ? 'bg-accent/5 text-accent' : 'bg-secondary text-muted-foreground'
      )}>
        {result.summary}
      </div>
    </div>
  );
}