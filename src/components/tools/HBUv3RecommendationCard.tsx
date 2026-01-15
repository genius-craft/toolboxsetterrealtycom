import React from 'react';
import { cn } from '@/lib/utils';
import { formatCompactCurrency, formatPercentage } from '@/lib/formatters';
import { Trophy, TrendingUp, Clock, Target, ArrowRight } from 'lucide-react';
import { HBUv3ScenarioResult } from '@/lib/calculations';
import { SoftLockOverlay } from './SoftLockOverlay';

interface HBUv3RecommendationCardProps {
  result: HBUv3ScenarioResult;
  justification: string;
}

export function HBUv3RecommendationCard({ result, justification }: HBUv3RecommendationCardProps) {
  return (
    <div className="bg-card rounded-lg border-2 border-accent p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="p-4 bg-accent/10 rounded-full">
          <Trophy className="h-8 w-8 text-accent" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-serif text-xl font-semibold text-foreground">
              {result.name}
            </h3>
            <span className="bg-accent/10 text-accent text-xs font-semibold px-2 py-0.5 rounded-full">
              RECOMENDAÇÃO
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{justification}</p>
        </div>
      </div>

      {/* Key Metrics */}
      <SoftLockOverlay featureName="os resultados">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-secondary/50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
              <Target className="h-4 w-4" />
              <span className="text-xs">VPL</span>
            </div>
            <p className={cn(
              'font-mono text-lg font-bold',
              result.npv > 0 ? 'text-green-600' : 'text-red-600'
            )}>
              {formatCompactCurrency(result.npv)}
            </p>
          </div>

          <div className="bg-secondary/50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs">TIR</span>
            </div>
            <p className={cn(
              'font-mono text-lg font-bold',
              result.irr > 0.15 ? 'text-green-600' : 'text-foreground'
            )}>
              {formatPercentage(result.irr)}
            </p>
          </div>

          <div className="bg-secondary/50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
              <ArrowRight className="h-4 w-4" />
              <span className="text-xs">Margem</span>
            </div>
            <p className={cn(
              'font-mono text-lg font-bold',
              result.margin > 0.2 ? 'text-green-600' : 'text-foreground'
            )}>
              {formatPercentage(result.margin)}
            </p>
          </div>

          <div className="bg-secondary/50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-xs">Payback</span>
            </div>
            <p className="font-mono text-lg font-bold text-foreground">
              {result.paybackMonths} meses
            </p>
          </div>
        </div>
      </SoftLockOverlay>

      {/* Score */}
      <div className="flex items-center justify-center gap-3 py-3 border-t border-border">
        <span className="text-sm text-muted-foreground">Score Final:</span>
        <span className="font-mono text-2xl font-bold text-accent">
          {result.score}
        </span>
        <span className="text-sm text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}
