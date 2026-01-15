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
        'relative bg-card rounded-lg border p-4 lg:p-6 shadow-card transition-shadow hover:shadow-card-hover',
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

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground font-medium tracking-premium uppercase mb-1">
            {label}
          </p>
          <p className={cn('font-mono text-2xl lg:text-3xl font-semibold', valueStyles[variant])}>
            {value}
          </p>
          {subValue && (
            <p className="text-sm text-muted-foreground mt-1">{subValue}</p>
          )}
        </div>
        {Icon && (
          <div className={cn(
            'p-2 rounded-lg',
            variant === 'default' ? 'bg-secondary' : variantStyles[variant]
          )}>
            <Icon className={cn('h-5 w-5', valueStyles[variant])} />
          </div>
        )}
      </div>
    </div>
  );
}
