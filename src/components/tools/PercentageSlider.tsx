import React from 'react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { GlossaryTooltip, financialGlossary } from './InfoTooltip';

interface PercentageSliderProps {
  label: string;
  value: number; // As decimal (0.05 = 5%)
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  helperText?: string;
  showValue?: boolean;
  tooltip?: keyof typeof financialGlossary;
}

export function PercentageSlider({
  label,
  value,
  onChange,
  min = 0,
  max = 0.5,
  step = 0.005,
  className,
  helperText,
  showValue = true,
  tooltip,
}: PercentageSliderProps) {
  const displayValue = (value * 100).toFixed(1).replace('.', ',');

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Label className="text-sm font-medium text-foreground">{label}</Label>
          {tooltip && <GlossaryTooltip term={tooltip} />}
        </div>
        {showValue && (
          <span className="font-mono text-sm text-accent font-medium">
            {displayValue}%
          </span>
        )}
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={step}
        className="cursor-pointer"
      />
      {helperText && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
}