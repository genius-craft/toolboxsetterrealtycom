import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface CurrencyInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
  min?: number;
  max?: number;
  helperText?: string;
}

export function CurrencyInput({
  label,
  value,
  onChange,
  placeholder = 'R$ 0',
  className,
  min,
  max,
  helperText,
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState('');

  // Format number to Brazilian currency display
  const formatForDisplay = (num: number): string => {
    if (num === 0) return '';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Parse display string to number
  const parseFromDisplay = (str: string): number => {
    const cleaned = str.replace(/[R$\s.]/g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
  };

  useEffect(() => {
    setDisplayValue(formatForDisplay(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    
    // Remove all non-numeric characters
    const numericValue = input.replace(/\D/g, '');
    const parsed = parseInt(numericValue, 10) || 0;
    
    let finalValue = parsed;
    if (min !== undefined && parsed < min) finalValue = min;
    if (max !== undefined && parsed > max) finalValue = max;
    
    onChange(finalValue);
  };

  const handleBlur = () => {
    setDisplayValue(formatForDisplay(value));
  };

  const handleFocus = () => {
    if (value > 0) {
      setDisplayValue(value.toString());
    } else {
      setDisplayValue('');
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <Label className="text-sm font-medium text-foreground">{label}</Label>
      <Input
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        className="font-mono text-base"
      />
      {helperText && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
}
