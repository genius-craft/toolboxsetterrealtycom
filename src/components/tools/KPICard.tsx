import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  label: string;
  value: string;
  subValue?: string;
  icon?: LucideIcon;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  locked?: boolean;
  className?: string;
}

export function KPICard({
  label,
  value,
  subValue,
  icon: Icon,
  variant = 'default',
  locked = false,
  className,
}: KPICardProps) {
  const variantStyles = {
    default: 'border-border',
    success: 'border-green-500/30 bg-green-500/5',
    warning: 'border-amber-500/30 bg-amber-500/5',
    danger: 'border-red-500/30 bg-red-500/5',
  };

  const valueStyles = {
    default: 'text-foreground',
    success: 'text-green-600',
    warning: 'text-amber-600',
    danger: 'text-red-600',
  };

  return (
    <div
      className={cn(
        'relative bg-card rounded-lg border p-3 sm:p-4 lg:p-6 shadow-card transition-shadow hover:shadow-card-hover min-w-0',
        variantStyles[variant],
        className
      )}
    >
      {locked && (
        <div className="absolute inset-0 bg-card/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
          <span className="text-xs text-muted-foreground font-medium tracking-premium uppercase">
            Faça login para ver
          </span>
        </div>
      )}

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] sm:text-xs text-muted-foreground font-medium tracking-premium uppercase mb-1 leading-tight">
            {label}
          </p>
          <p className={cn('font-mono text-lg sm:text-xl lg:text-2xl font-semibold truncate', valueStyles[variant])}>
            {value}
          </p>
          {subValue && (
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 truncate">{subValue}</p>
          )}
        </div>
        {Icon && (
          <div className={cn(
            'p-1.5 sm:p-2 rounded-lg shrink-0',
            variant === 'default' ? 'bg-secondary' : variantStyles[variant]
          )}>
            <Icon className={cn('h-4 w-4 sm:h-5 sm:w-5', valueStyles[variant])} />
          </div>
        )}
      </div>
    </div>
  );
}
