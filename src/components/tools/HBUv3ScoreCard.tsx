import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface HBUv3ScoreCardProps {
  name: string;
  score: number;
  icon: LucideIcon;
  isWinner: boolean;
  colorClass?: string;
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-amber-600';
  if (score >= 40) return 'text-orange-600';
  return 'text-red-600';
}

function getScoreBgColor(score: number): string {
  if (score >= 80) return 'bg-green-100 dark:bg-green-900/30';
  if (score >= 60) return 'bg-amber-100 dark:bg-amber-900/30';
  if (score >= 40) return 'bg-orange-100 dark:bg-orange-900/30';
  return 'bg-red-100 dark:bg-red-900/30';
}

export function HBUv3ScoreCard({ name, score, icon: Icon, isWinner, colorClass }: HBUv3ScoreCardProps) {
  return (
    <div
      className={cn(
        'relative bg-card rounded-lg border p-4 text-center transition-all',
        isWinner 
          ? 'border-accent ring-2 ring-accent/20 shadow-lg' 
          : 'border-border shadow-card'
      )}
    >
      {/* Winner badge */}
      {isWinner && (
        <div className="absolute -top-2 -right-2 bg-accent text-accent-foreground p-1 rounded-full">
          <CheckCircle className="h-4 w-4" />
        </div>
      )}

      {/* Icon */}
      <div className={cn(
        'mx-auto w-12 h-12 rounded-lg flex items-center justify-center mb-3',
        colorClass || 'bg-secondary'
      )}>
        <Icon className={cn(
          'h-6 w-6',
          isWinner ? 'text-accent' : 'text-muted-foreground'
        )} />
      </div>

      {/* Name */}
      <h4 className="font-serif font-medium text-sm mb-2">{name}</h4>

      {/* Score */}
      <div className={cn(
        'inline-flex items-baseline gap-1 px-3 py-1.5 rounded-full',
        getScoreBgColor(score)
      )}>
        <span className={cn('font-mono text-2xl font-bold', getScoreColor(score))}>
          {score}
        </span>
        <span className={cn('text-xs font-medium', getScoreColor(score))}>
          / 100
        </span>
      </div>
    </div>
  );
}
