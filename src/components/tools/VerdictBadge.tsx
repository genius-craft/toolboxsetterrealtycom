import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';

type VerdictType = 'excellent' | 'good' | 'fair' | 'poor' | 'unknown';

interface VerdictBadgeProps {
  verdict: VerdictType;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  locked?: boolean;
}

const verdictConfig = {
  excellent: {
    icon: CheckCircle,
    label: 'Excelente',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    textColor: 'text-green-600',
    iconColor: 'text-green-500',
  },
  good: {
    icon: CheckCircle,
    label: 'Bom',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    textColor: 'text-emerald-600',
    iconColor: 'text-emerald-500',
  },
  fair: {
    icon: AlertTriangle,
    label: 'Moderado',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    textColor: 'text-amber-600',
    iconColor: 'text-amber-500',
  },
  poor: {
    icon: XCircle,
    label: 'Arriscado',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    textColor: 'text-red-600',
    iconColor: 'text-red-500',
  },
  unknown: {
    icon: HelpCircle,
    label: 'Indefinido',
    bgColor: 'bg-secondary',
    borderColor: 'border-border',
    textColor: 'text-muted-foreground',
    iconColor: 'text-muted-foreground',
  },
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-3',
};

const iconSizes = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

export function VerdictBadge({
  verdict,
  label,
  size = 'md',
  locked = false,
}: VerdictBadgeProps) {
  const config = verdictConfig[verdict];
  const Icon = config.icon;

  if (locked) {
    return (
      <div
        className={cn(
          'inline-flex items-center rounded-lg border font-medium tracking-premium uppercase',
          sizeStyles[size],
          'bg-secondary border-border text-muted-foreground'
        )}
      >
        <HelpCircle className={cn(iconSizes[size], 'text-muted-foreground')} />
        <span>Faça login</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-lg border font-medium tracking-premium uppercase',
        sizeStyles[size],
        config.bgColor,
        config.borderColor,
        config.textColor
      )}
    >
      <Icon className={cn(iconSizes[size], config.iconColor)} />
      <span>{label || config.label}</span>
    </div>
  );
}
