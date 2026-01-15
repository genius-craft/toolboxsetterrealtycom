import React from 'react';
import { Plus, X, Coins, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { PercentageSlider } from './PercentageSlider';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';

export interface RentalUnit {
  id: string;
  name: string;
  monthlyRent: number;
}

interface RentalUnitsCardProps {
  units: RentalUnit[];
  onUnitsChange: (units: RentalUnit[]) => void;
  adjustmentIndex: 'igpm' | 'ipca' | 'custom';
  onAdjustmentIndexChange: (index: 'igpm' | 'ipca' | 'custom') => void;
  customIndexRate: number;
  onCustomIndexRateChange: (rate: number) => void;
  defaultOpen?: boolean;
}

export function RentalUnitsCard({
  units,
  onUnitsChange,
  adjustmentIndex,
  onAdjustmentIndexChange,
  customIndexRate,
  onCustomIndexRateChange,
  defaultOpen = true,
}: RentalUnitsCardProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  const totalMonthlyRent = units.reduce((sum, unit) => sum + unit.monthlyRent, 0);

  const addUnit = () => {
    const newId = String(Date.now());
    const newNumber = units.length + 1;
    onUnitsChange([
      ...units,
      { id: newId, name: `Loja ${newNumber}`, monthlyRent: 10000 },
    ]);
  };

  const removeUnit = (id: string) => {
    if (units.length > 1) {
      onUnitsChange(units.filter((unit) => unit.id !== id));
    }
  };

  const updateUnitName = (id: string, name: string) => {
    onUnitsChange(
      units.map((unit) =>
        unit.id === id ? { ...unit, name } : unit
      )
    );
  };

  const updateUnitRent = (id: string, rentStr: string) => {
    const numericValue = rentStr.replace(/\D/g, '');
    const parsed = parseInt(numericValue, 10) || 0;
    onUnitsChange(
      units.map((unit) =>
        unit.id === id ? { ...unit, monthlyRent: parsed } : unit
      )
    );
  };

  const formatRentDisplay = (value: number): string => {
    if (value === 0) return '';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const indexRateDisplay = {
    igpm: '~4% a.a.',
    ipca: '~4.5% a.a.',
    custom: `${(customIndexRate * 100).toFixed(1)}% a.a.`,
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="bg-card rounded-lg border border-border shadow-card overflow-hidden">
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between p-4 lg:p-5 hover:bg-secondary/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Coins className="h-5 w-5 text-accent" />
              </div>
              <h3 className="font-serif text-lg font-medium text-foreground">
                Receita de Locação
              </h3>
            </div>
            <ChevronDown
              className={cn(
                'h-5 w-5 text-muted-foreground transition-transform duration-200',
                isOpen && 'rotate-180'
              )}
            />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4 lg:px-5 lg:pb-5 pt-0 space-y-4">
            {/* Índice de Reajuste */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Índice de Reajuste</Label>
              <ToggleGroup
                type="single"
                value={adjustmentIndex}
                onValueChange={(value) => {
                  if (value) onAdjustmentIndexChange(value as 'igpm' | 'ipca' | 'custom');
                }}
                className="justify-start"
              >
                <ToggleGroupItem
                  value="igpm"
                  className="data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
                >
                  IGPM
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="ipca"
                  className="data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
                >
                  IPCA
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="custom"
                  className="data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
                >
                  Outro
                </ToggleGroupItem>
              </ToggleGroup>
              
              {adjustmentIndex === 'custom' && (
                <div className="pt-2">
                  <PercentageSlider
                    label="Taxa Personalizada"
                    value={customIndexRate}
                    onChange={onCustomIndexRateChange}
                    min={0}
                    max={0.15}
                    step={0.005}
                  />
                </div>
              )}
              
              <p className="text-xs text-muted-foreground">
                Reajuste anual estimado: {indexRateDisplay[adjustmentIndex]}
              </p>
            </div>

            {/* Lista de Unidades */}
            <div className="space-y-3">
              <Label className="text-sm text-muted-foreground">Unidades Locadas</Label>
              
              {units.map((unit) => (
                <div
                  key={unit.id}
                  className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg"
                >
                  <Input
                    value={unit.name}
                    onChange={(e) => updateUnitName(unit.id, e.target.value)}
                    className="flex-1 max-w-[120px] h-9 text-sm"
                    placeholder="Nome"
                  />
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={formatRentDisplay(unit.monthlyRent)}
                    onChange={(e) => updateUnitRent(unit.id, e.target.value)}
                    onFocus={(e) => {
                      if (unit.monthlyRent > 0) {
                        e.target.value = unit.monthlyRent.toString();
                      }
                    }}
                    onBlur={(e) => {
                      e.target.value = formatRentDisplay(unit.monthlyRent);
                    }}
                    className="flex-1 h-9 font-mono text-sm"
                    placeholder="R$ 0"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeUnit(unit.id)}
                    disabled={units.length === 1}
                    className="h-9 w-9 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Botão Adicionar */}
            <Button
              variant="outline"
              size="sm"
              onClick={addUnit}
              className="w-full border-dashed"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Loja
            </Button>

            {/* Total */}
            <div className="pt-3 border-t border-border">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">
                  Total Mensal
                </span>
                <span className="text-lg font-semibold text-accent">
                  {formatCurrency(totalMonthlyRent)}
                </span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-muted-foreground">
                  Total Anual
                </span>
                <span className="text-sm text-muted-foreground">
                  {formatCurrency(totalMonthlyRent * 12)}
                </span>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}