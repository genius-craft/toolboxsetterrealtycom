import React, { useState, useMemo, useCallback } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { CollapsibleInputCard } from '@/components/tools/CollapsibleInputCard';
import { CurrencyInput } from '@/components/tools/CurrencyInput';
import { PercentageSlider } from '@/components/tools/PercentageSlider';
import { KPICard } from '@/components/tools/KPICard';
import { VerdictBadge } from '@/components/tools/VerdictBadge';
import { CashFlowChart } from '@/components/tools/CashFlowChart';
import { SoftLockOverlay } from '@/components/tools/SoftLockOverlay';
import { ScenarioMatrix } from '@/components/tools/ScenarioMatrix';
import { SensitivityHeatmap } from '@/components/tools/SensitivityHeatmap';
import { ProjectHeader } from '@/components/tools/ProjectHeader';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useAuth } from '@/contexts/AuthContext';
import { useSaveProject } from '@/hooks/useProjects';
import {
  projectCashFlows,
  calculateIRR,
  calculateCapRate,
  calculateEquityMultiple,
  calculateAllScenarios,
} from '@/lib/calculations';
import { formatCurrency, formatPercentage, formatMultiple } from '@/lib/formatters';
import {
  Building2,
  TrendingUp,
  Receipt,
  DoorOpen,
  Save,
  FileText,
  Target,
  BarChart3,
} from 'lucide-react';

export default function Simulador() {
  const { user } = useAuth();
  const saveProject = useSaveProject();

  // Project Info
  const [projectName, setProjectName] = useState('');
  const [investmentType, setInvestmentType] = useState<'ready' | 'build-to-suit'>('ready');

  // Investment (CAPEX)
  const [purchasePrice, setPurchasePrice] = useState(2000000);
  const [closingCosts, setClosingCosts] = useState(0.03); // 3%
  const [renovationCost, setRenovationCost] = useState(100000);

  // Revenue
  const [monthlyRent, setMonthlyRent] = useState(15000);
  const [rentGrowth, setRentGrowth] = useState(0.03); // 3% annual
  const [vacancyRate, setVacancyRate] = useState(0.05); // 5%

  // Operating Expenses (OPEX)
  const [propertyTax, setPropertyTax] = useState(12000); // Annual IPTU
  const [condoFee, setCondoFee] = useState(6000); // Annual
  const [managementFee, setManagementFee] = useState(0.08); // 8% of rent

  // Exit
  const [holdingPeriod, setHoldingPeriod] = useState(10);
  const [exitCapRate, setExitCapRate] = useState(0.07); // 7%

  // Collect all inputs for scenario calculations
  const simuladorInputs = useMemo(() => ({
    purchasePrice,
    closingCosts,
    renovationCost,
    monthlyRent,
    rentGrowth,
    vacancyRate,
    propertyTax,
    condoFee,
    managementFee,
    holdingPeriod,
    exitCapRate,
  }), [
    purchasePrice,
    closingCosts,
    renovationCost,
    monthlyRent,
    rentGrowth,
    vacancyRate,
    propertyTax,
    condoFee,
    managementFee,
    holdingPeriod,
    exitCapRate,
  ]);

  // Calculations
  const calculations = useMemo(() => {
    const totalInvestment = purchasePrice * (1 + closingCosts) + renovationCost;
    const annualRent = monthlyRent * 12;
    const annualManagement = annualRent * managementFee;
    const operatingExpenses = propertyTax + condoFee + annualManagement;
    const effectiveGrossIncome = annualRent * (1 - vacancyRate);
    const noi = effectiveGrossIncome - operatingExpenses;
    const entryCapRate = calculateCapRate(noi, purchasePrice);

    const cashFlows = projectCashFlows({
      totalInvestment,
      annualRent,
      rentGrowth,
      vacancyRate,
      operatingExpenses,
      expenseGrowth: 0.02, // 2% expense growth
      holdingPeriod,
      exitCapRate,
    });

    const irr = calculateIRR(cashFlows);
    const totalDistributions = cashFlows.slice(1).reduce((sum, cf) => sum + cf, 0);
    const equityMultiple = calculateEquityMultiple(totalDistributions, totalInvestment);

    // Create chart data
    const chartData = cashFlows.map((value, index) => ({
      year: index,
      value,
    }));

    // Determine verdict
    let verdict: 'excellent' | 'good' | 'fair' | 'poor' = 'poor';
    if (irr >= 0.15 && equityMultiple >= 2) verdict = 'excellent';
    else if (irr >= 0.12 && equityMultiple >= 1.5) verdict = 'good';
    else if (irr >= 0.08) verdict = 'fair';

    return {
      totalInvestment,
      noi,
      entryCapRate,
      irr,
      equityMultiple,
      chartData,
      verdict,
    };
  }, [
    purchasePrice,
    closingCosts,
    renovationCost,
    monthlyRent,
    rentGrowth,
    vacancyRate,
    propertyTax,
    condoFee,
    managementFee,
    holdingPeriod,
    exitCapRate,
  ]);

  // Calculate scenarios
  const scenarios = useMemo(() => {
    return calculateAllScenarios(simuladorInputs);
  }, [simuladorInputs]);

  // Sensitivity heatmap calculation function
  const sensitivityCapRateCalc = useCallback((investment: number, annualRent: number) => {
    // Simplified: just rent / investment for sensitivity
    return investment > 0 ? annualRent / investment : 0;
  }, []);

  const handleSave = () => {
    saveProject.mutate({
      project_type: 'simulador',
      name: projectName || `Simulação ${new Date().toLocaleDateString('pt-BR')}`,
      inputs: {
        projectName,
        investmentType,
        purchasePrice,
        closingCosts,
        renovationCost,
        monthlyRent,
        rentGrowth,
        vacancyRate,
        propertyTax,
        condoFee,
        managementFee,
        holdingPeriod,
        exitCapRate,
      },
      results: {
        totalInvestment: calculations.totalInvestment,
        noi: calculations.noi,
        entryCapRate: calculations.entryCapRate,
        irr: calculations.irr,
        equityMultiple: calculations.equityMultiple,
        verdict: calculations.verdict,
      },
    });
  };

  // Right panel (Dashboard)
  const Dashboard = (
    <div className="space-y-6">
      {/* KPIs Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard
          label="Cap Rate Entrada"
          value={formatPercentage(calculations.entryCapRate)}
          icon={Target}
          variant={calculations.entryCapRate >= 0.08 ? 'success' : 'warning'}
        />
        
        <SoftLockOverlay featureName="a TIR">
          <KPICard
            label="TIR"
            value={formatPercentage(calculations.irr)}
            icon={TrendingUp}
            variant={
              calculations.irr >= 0.15
                ? 'success'
                : calculations.irr >= 0.1
                ? 'warning'
                : 'danger'
            }
          />
        </SoftLockOverlay>

        <SoftLockOverlay featureName="o multiplicador">
          <KPICard
            label="Multiplicador"
            value={formatMultiple(calculations.equityMultiple)}
            icon={BarChart3}
            variant={
              calculations.equityMultiple >= 2
                ? 'success'
                : calculations.equityMultiple >= 1.5
                ? 'warning'
                : 'danger'
            }
          />
        </SoftLockOverlay>
      </div>

      {/* Investment Summary */}
      <div className="bg-card rounded-lg border border-border p-4 shadow-card">
        <h3 className="font-serif text-lg mb-3">Resumo do Investimento</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Investimento Total</span>
            <span className="font-mono font-medium">{formatCurrency(calculations.totalInvestment)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">NOI Ano 1</span>
            <span className="font-mono font-medium">{formatCurrency(calculations.noi)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Yield Anual</span>
            <span className="font-mono font-medium text-accent">
              {formatPercentage(calculations.noi / calculations.totalInvestment)}
            </span>
          </div>
        </div>
      </div>

      {/* Cash Flow Chart */}
      <div className="bg-card rounded-lg border border-border p-4 shadow-card">
        <h3 className="font-serif text-lg mb-4">Fluxo de Caixa (J-Curve)</h3>
        <SoftLockOverlay featureName="o gráfico completo">
          <CashFlowChart data={calculations.chartData} />
        </SoftLockOverlay>
      </div>

      {/* Verdict */}
      <div className="bg-card rounded-lg border border-border p-4 shadow-card flex items-center justify-between">
        <div>
          <h3 className="font-serif text-lg">Veredicto</h3>
          <p className="text-sm text-muted-foreground">Baseado nos parâmetros informados</p>
        </div>
        <SoftLockOverlay featureName="o veredicto">
          <VerdictBadge verdict={calculations.verdict} size="lg" />
        </SoftLockOverlay>
      </div>

      {/* Scenario Matrix */}
      <SoftLockOverlay featureName="a matriz de cenários">
        <ScenarioMatrix
          pessimistic={scenarios.pessimistic}
          realistic={scenarios.realistic}
          optimistic={scenarios.optimistic}
        />
      </SoftLockOverlay>

      {/* Sensitivity Heatmap */}
      <SoftLockOverlay featureName="a análise de sensibilidade">
        <SensitivityHeatmap
          baseInvestment={calculations.totalInvestment}
          baseRent={monthlyRent}
          calculateCapRate={sensitivityCapRateCalc}
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
        <Button 
          className="flex-1 bg-[#E85D3D] hover:bg-[#D14D2D] text-white shadow-lg"
          disabled={!user}
        >
          <FileText className="h-4 w-4 mr-2" />
          Exportar PDF Profissional
        </Button>
      </div>
    </div>
  );

  return (
    <ToolLayout title="Simulador de Viabilidade" rightPanel={Dashboard}>
      {/* Project Header */}
      <ProjectHeader
        projectName={projectName}
        onProjectNameChange={setProjectName}
        investmentType={investmentType}
        onInvestmentTypeChange={setInvestmentType}
      />

      {/* CAPEX Card */}
      <CollapsibleInputCard title="Investimento (CAPEX)" icon={Building2}>
        <CurrencyInput
          label="Preço de Aquisição"
          value={purchasePrice}
          onChange={setPurchasePrice}
          helperText="Valor de compra do imóvel"
        />
        <PercentageSlider
          label="Custos de Fechamento"
          value={closingCosts}
          onChange={setClosingCosts}
          min={0}
          max={0.1}
          step={0.005}
          helperText="ITBI, escritura, registro, etc."
        />
        <CurrencyInput
          label="Reforma / Retrofit"
          value={renovationCost}
          onChange={setRenovationCost}
          helperText="Investimento em melhorias (opcional)"
        />
      </CollapsibleInputCard>

      {/* Revenue Card */}
      <CollapsibleInputCard title="Receita" icon={TrendingUp}>
        <CurrencyInput
          label="Aluguel Mensal"
          value={monthlyRent}
          onChange={setMonthlyRent}
          helperText="Valor bruto mensal de locação"
        />
        <PercentageSlider
          label="Crescimento Anual"
          value={rentGrowth}
          onChange={setRentGrowth}
          min={0}
          max={0.1}
          step={0.005}
          helperText="Projeção de reajuste anual"
        />
        <PercentageSlider
          label="Taxa de Vacância"
          value={vacancyRate}
          onChange={setVacancyRate}
          min={0}
          max={0.2}
          step={0.01}
          helperText="Estimativa de desocupação"
        />
      </CollapsibleInputCard>

      {/* OPEX Card */}
      <CollapsibleInputCard title="Despesas (OPEX)" icon={Receipt}>
        <CurrencyInput
          label="IPTU (Anual)"
          value={propertyTax}
          onChange={setPropertyTax}
        />
        <CurrencyInput
          label="Condomínio (Anual)"
          value={condoFee}
          onChange={setCondoFee}
        />
        <PercentageSlider
          label="Taxa de Administração"
          value={managementFee}
          onChange={setManagementFee}
          min={0}
          max={0.15}
          step={0.01}
          helperText="Sobre o aluguel bruto"
        />
      </CollapsibleInputCard>

      {/* Exit Card */}
      <CollapsibleInputCard title="Saída" icon={DoorOpen}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Horizonte (anos)</Label>
            <span className="font-mono text-sm text-accent font-medium">
              {holdingPeriod} anos
            </span>
          </div>
          <Slider
            value={[holdingPeriod]}
            onValueChange={([v]) => setHoldingPeriod(v)}
            min={1}
            max={20}
            step={1}
          />
        </div>
        <PercentageSlider
          label="Cap Rate de Saída"
          value={exitCapRate}
          onChange={setExitCapRate}
          min={0.04}
          max={0.12}
          step={0.005}
          helperText="Cap rate esperado na venda"
        />
      </CollapsibleInputCard>
    </ToolLayout>
  );
}