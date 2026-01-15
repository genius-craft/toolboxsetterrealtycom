import React, { useState, useMemo } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { CollapsibleInputCard } from '@/components/tools/CollapsibleInputCard';
import { CurrencyInput } from '@/components/tools/CurrencyInput';
import { PercentageSlider } from '@/components/tools/PercentageSlider';
import { KPICard } from '@/components/tools/KPICard';
import { VerdictBadge } from '@/components/tools/VerdictBadge';
import { ComparisonChart } from '@/components/tools/ComparisonChart';
import { SoftLockOverlay } from '@/components/tools/SoftLockOverlay';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useAuth } from '@/contexts/AuthContext';
import { useSaveProject } from '@/hooks/useProjects';
import { calculateNPV } from '@/lib/calculations';
import { formatCurrency, formatCompactCurrency, formatPercentage } from '@/lib/formatters';
import {
  Settings,
  Banknote,
  Repeat2,
  Save,
  Download,
  Trophy,
  TrendingUp,
} from 'lucide-react';

export default function Permuta() {
  const { user } = useAuth();
  const saveProject = useSaveProject();

  // Global Config
  const [vgv, setVgv] = useState(10000000); // Valor Geral de Vendas
  const [projectDuration, setProjectDuration] = useState(36); // months
  const [monthlyDiscountRate, setMonthlyDiscountRate] = useState(0.01); // 1% monthly

  // Cenário A: Venda à Vista
  const [salePrice, setSalePrice] = useState(2000000);
  const [downPayment, setDownPayment] = useState(500000);
  const [installments, setInstallments] = useState(24);

  // Cenário B: Permuta
  const [swapPercentage, setSwapPercentage] = useState(0.15); // 15% do VGV
  const [torna, setTorna] = useState(200000); // Cash payment
  const [deliveryMonth, setDeliveryMonth] = useState(36);

  // Calculations
  const calculations = useMemo(() => {
    // Venda - Cash flows
    const installmentValue = (salePrice - downPayment) / installments;
    const vendaCashFlows = [downPayment];
    for (let i = 1; i <= installments; i++) {
      vendaCashFlows.push(installmentValue);
    }
    const vendaNominal = salePrice;
    const vendaNPV = calculateNPV(vendaCashFlows, monthlyDiscountRate);

    // Permuta - Cash flows
    const swapValue = vgv * swapPercentage;
    const permutaCashFlows = Array(deliveryMonth + 1).fill(0);
    permutaCashFlows[0] = torna;
    permutaCashFlows[deliveryMonth] = swapValue;
    const permutaNominal = torna + swapValue;
    const permutaNPV = calculateNPV(permutaCashFlows, monthlyDiscountRate);

    // Comparison
    const difference = permutaNPV - vendaNPV;
    const differencePercentage = vendaNPV > 0 ? difference / vendaNPV : 0;
    const winner = permutaNPV > vendaNPV ? 'permuta' : 'venda';

    // Chart data
    const chartData = [
      { name: 'Venda à Vista', nominal: vendaNominal, npv: vendaNPV },
      { name: 'Permuta', nominal: permutaNominal, npv: permutaNPV },
    ];

    return {
      vendaNominal,
      vendaNPV,
      permutaNominal,
      permutaNPV,
      swapValue,
      installmentValue,
      difference,
      differencePercentage,
      winner,
      chartData,
    };
  }, [
    vgv,
    projectDuration,
    monthlyDiscountRate,
    salePrice,
    downPayment,
    installments,
    swapPercentage,
    torna,
    deliveryMonth,
  ]);

  const handleSave = () => {
    saveProject.mutate({
      project_type: 'permuta',
      name: `Permuta ${new Date().toLocaleDateString('pt-BR')}`,
      inputs: {
        vgv,
        projectDuration,
        monthlyDiscountRate,
        salePrice,
        downPayment,
        installments,
        swapPercentage,
        torna,
        deliveryMonth,
      },
      results: {
        vendaNominal: calculations.vendaNominal,
        vendaNPV: calculations.vendaNPV,
        permutaNominal: calculations.permutaNominal,
        permutaNPV: calculations.permutaNPV,
        winner: calculations.winner,
        difference: calculations.difference,
      },
    });
  };

  const Dashboard = (
    <div className="space-y-6">
      {/* Winner Badge */}
      <div className="bg-card rounded-lg border border-border p-6 shadow-card text-center">
        <h3 className="font-serif text-lg mb-4">Melhor Opção</h3>
        <SoftLockOverlay featureName="a análise de VPL">
          <div className="flex flex-col items-center gap-3">
            <div className="p-4 bg-accent/10 rounded-full">
              <Trophy className="h-8 w-8 text-accent" />
            </div>
            <VerdictBadge
              verdict={calculations.winner === 'permuta' ? 'excellent' : 'good'}
              label={calculations.winner === 'permuta' ? 'Permuta' : 'Venda à Vista'}
              size="lg"
            />
            <p className="text-sm text-muted-foreground">
              Vantagem de{' '}
              <span className="font-mono font-medium text-accent">
                {formatPercentage(Math.abs(calculations.differencePercentage))}
              </span>
            </p>
          </div>
        </SoftLockOverlay>
      </div>

      {/* Comparison KPIs */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card rounded-lg border border-border p-4 shadow-card">
          <p className="text-xs text-muted-foreground font-medium tracking-premium uppercase mb-2">
            Venda à Vista
          </p>
          <p className="font-mono text-lg font-medium mb-1">
            {formatCompactCurrency(calculations.vendaNominal)}
          </p>
          <SoftLockOverlay featureName="o VPL">
            <p className="text-xs text-muted-foreground">
              VPL: <span className="font-mono text-accent">{formatCompactCurrency(calculations.vendaNPV)}</span>
            </p>
          </SoftLockOverlay>
        </div>

        <div className="bg-card rounded-lg border border-border p-4 shadow-card">
          <p className="text-xs text-muted-foreground font-medium tracking-premium uppercase mb-2">
            Permuta
          </p>
          <p className="font-mono text-lg font-medium mb-1">
            {formatCompactCurrency(calculations.permutaNominal)}
          </p>
          <SoftLockOverlay featureName="o VPL">
            <p className="text-xs text-muted-foreground">
              VPL: <span className="font-mono text-accent">{formatCompactCurrency(calculations.permutaNPV)}</span>
            </p>
          </SoftLockOverlay>
        </div>
      </div>

      {/* Comparison Chart */}
      <div className="bg-card rounded-lg border border-border p-4 shadow-card">
        <h3 className="font-serif text-lg mb-4">Comparativo</h3>
        <SoftLockOverlay featureName="o gráfico comparativo">
          <ComparisonChart data={calculations.chartData} />
        </SoftLockOverlay>
      </div>

      {/* Difference */}
      <SoftLockOverlay featureName="a diferença de VPL">
        <KPICard
          label="Diferença de VPL"
          value={formatCompactCurrency(calculations.difference)}
          subValue={`${calculations.difference > 0 ? '+' : ''}${formatPercentage(calculations.differencePercentage)}`}
          icon={TrendingUp}
          variant={calculations.difference > 0 ? 'success' : 'warning'}
        />
      </SoftLockOverlay>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          variant="gold"
          className="flex-1"
          onClick={handleSave}
          disabled={!user || saveProject.isPending}
        >
          <Save className="h-4 w-4 mr-2" />
          {saveProject.isPending ? 'Salvando...' : 'Salvar'}
        </Button>
        <Button variant="outline" className="flex-1" disabled={!user}>
          <Download className="h-4 w-4 mr-2" />
          PDF
        </Button>
      </div>
    </div>
  );

  return (
    <ToolLayout title="Calculadora de Permuta" rightPanel={Dashboard}>
      {/* Global Config */}
      <CollapsibleInputCard title="Configuração Global" icon={Settings}>
        <CurrencyInput
          label="VGV do Empreendimento"
          value={vgv}
          onChange={setVgv}
          helperText="Valor Geral de Vendas do projeto"
        />
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Prazo do Projeto</Label>
            <span className="font-mono text-sm text-accent font-medium">
              {projectDuration} meses
            </span>
          </div>
          <Slider
            value={[projectDuration]}
            onValueChange={([v]) => setProjectDuration(v)}
            min={12}
            max={60}
            step={6}
          />
        </div>
        <PercentageSlider
          label="Taxa de Desconto (mensal)"
          value={monthlyDiscountRate}
          onChange={setMonthlyDiscountRate}
          min={0.005}
          max={0.02}
          step={0.001}
          helperText="Taxa para cálculo do VPL"
        />
      </CollapsibleInputCard>

      {/* Venda à Vista */}
      <CollapsibleInputCard title="Cenário A: Venda à Vista" icon={Banknote}>
        <CurrencyInput
          label="Preço de Venda"
          value={salePrice}
          onChange={setSalePrice}
        />
        <CurrencyInput
          label="Entrada"
          value={downPayment}
          onChange={setDownPayment}
        />
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Parcelas</Label>
            <span className="font-mono text-sm text-accent font-medium">
              {installments}x de {formatCurrency(calculations.installmentValue)}
            </span>
          </div>
          <Slider
            value={[installments]}
            onValueChange={([v]) => setInstallments(v)}
            min={1}
            max={48}
            step={1}
          />
        </div>
      </CollapsibleInputCard>

      {/* Permuta */}
      <CollapsibleInputCard title="Cenário B: Permuta" icon={Repeat2}>
        <PercentageSlider
          label="Percentual do VGV"
          value={swapPercentage}
          onChange={setSwapPercentage}
          min={0.05}
          max={0.3}
          step={0.01}
          helperText={`Equivalente a ${formatCurrency(calculations.swapValue)} em unidades`}
        />
        <CurrencyInput
          label="Torna (pagamento em dinheiro)"
          value={torna}
          onChange={setTorna}
          helperText="Valor adicional recebido à vista"
        />
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Entrega das Unidades</Label>
            <span className="font-mono text-sm text-accent font-medium">
              Mês {deliveryMonth}
            </span>
          </div>
          <Slider
            value={[deliveryMonth]}
            onValueChange={([v]) => setDeliveryMonth(v)}
            min={12}
            max={60}
            step={6}
          />
        </div>
      </CollapsibleInputCard>
    </ToolLayout>
  );
}
