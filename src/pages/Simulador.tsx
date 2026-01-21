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
import { RentalUnitsCard, RentalUnit } from '@/components/tools/RentalUnitsCard';
import { GlossaryTooltip } from '@/components/tools/InfoTooltip';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useSaveProject, useProjects, ProjectType } from '@/hooks/useProjects';
import { useToast } from '@/hooks/use-toast';
import {
  projectCashFlows,
  calculateIRR,
  calculateCapRate,
  calculateEquityMultiple,
  calculateAllScenarios,
} from '@/lib/calculations';
import { formatCurrency, formatPercentage, formatMultiple } from '@/lib/formatters';
import { generateSimuladorPDF } from '@/lib/pdfExport';
import {
  Building2,
  TrendingUp,
  Receipt,
  DoorOpen,
  Save,
  FileText,
  Target,
  BarChart3,
  FolderOpen,
  Loader2,
} from 'lucide-react';

export default function Simulador() {
  const { user } = useAuth();
  const { toast } = useToast();
  const saveProject = useSaveProject();
  const { data: savedProjects, isLoading: loadingProjects } = useProjects('simulador' as ProjectType);

  // Dialog state
  const [openDialogOpen, setOpenDialogOpen] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  // Project Info
  const [projectName, setProjectName] = useState('');
  const [investmentType, setInvestmentType] = useState<'ready' | 'build-to-suit'>('ready');

  // Investment (CAPEX)
  const [purchasePrice, setPurchasePrice] = useState(2000000);
  const [closingCosts, setClosingCosts] = useState(0.03); // 3%
  const [renovationCost, setRenovationCost] = useState(100000);
  const [hasTurnkey, setHasTurnkey] = useState(false);
  const [turnkeyCost, setTurnkeyCost] = useState(0);

  // Revenue - Multiple Units
  const [rentalUnits, setRentalUnits] = useState<RentalUnit[]>([
    { id: '1', name: 'Loja 1', monthlyRent: 15000 },
  ]);
  const [adjustmentIndex, setAdjustmentIndex] = useState<'igpm' | 'ipca' | 'custom'>('igpm');
  const [customIndexRate, setCustomIndexRate] = useState(0.05);
  const [vacancyRate, setVacancyRate] = useState(0.05); // 5%

  // Operating Expenses (OPEX)
  const [propertyTax, setPropertyTax] = useState(12000); // Annual IPTU
  const [condoFee, setCondoFee] = useState(6000); // Annual
  const [managementFee, setManagementFee] = useState(0.08); // 8% of rent

  // Exit
  const [holdingPeriod, setHoldingPeriod] = useState(10);
  const [exitCapRate, setExitCapRate] = useState(0.07); // 7%
  const [discountRate, setDiscountRate] = useState(0.12); // 12% custo de oportunidade

  // Calculate total rent and effective rent growth
  const totalMonthlyRent = useMemo(() => {
    return rentalUnits.reduce((sum, unit) => sum + unit.monthlyRent, 0);
  }, [rentalUnits]);

  const effectiveRentGrowth = useMemo(() => {
    const indexRates = {
      igpm: 0.04,
      ipca: 0.045,
      custom: customIndexRate,
    };
    return indexRates[adjustmentIndex];
  }, [adjustmentIndex, customIndexRate]);

  // Collect all inputs for scenario calculations
  const simuladorInputs = useMemo(() => ({
    purchasePrice,
    closingCosts,
    renovationCost,
    monthlyRent: totalMonthlyRent,
    rentGrowth: effectiveRentGrowth,
    vacancyRate,
    propertyTax,
    condoFee,
    managementFee,
    holdingPeriod,
    exitCapRate,
    discountRate,
  }), [
    purchasePrice,
    closingCosts,
    renovationCost,
    totalMonthlyRent,
    effectiveRentGrowth,
    vacancyRate,
    propertyTax,
    condoFee,
    managementFee,
    holdingPeriod,
    exitCapRate,
    discountRate,
  ]);

  // Calculate NPV
  const calculateNPV = (cashFlows: number[], rate: number): number => {
    return cashFlows.reduce((npv, cf, i) => npv + cf / Math.pow(1 + rate, i), 0);
  };

  // Calculations
  const calculations = useMemo(() => {
    const turnkeyAmount = hasTurnkey ? turnkeyCost : 0;
    const totalInvestment = purchasePrice * (1 + closingCosts) + renovationCost + turnkeyAmount;
    const annualRent = totalMonthlyRent * 12;
    const annualManagement = annualRent * managementFee;
    const operatingExpenses = propertyTax + condoFee + annualManagement;
    const effectiveGrossIncome = annualRent * (1 - vacancyRate);
    const noi = effectiveGrossIncome - operatingExpenses;
    const entryCapRate = calculateCapRate(noi, purchasePrice);

    const cashFlows = projectCashFlows({
      totalInvestment,
      annualRent,
      rentGrowth: effectiveRentGrowth,
      vacancyRate,
      operatingExpenses,
      expenseGrowth: 0.02, // 2% expense growth
      holdingPeriod,
      exitCapRate,
    });

    const irr = calculateIRR(cashFlows);
    const npv = calculateNPV(cashFlows, discountRate);
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
      npv,
      equityMultiple,
      chartData,
      verdict,
    };
  }, [
    purchasePrice,
    closingCosts,
    renovationCost,
    hasTurnkey,
    turnkeyCost,
    totalMonthlyRent,
    effectiveRentGrowth,
    vacancyRate,
    propertyTax,
    condoFee,
    managementFee,
    holdingPeriod,
    exitCapRate,
    discountRate,
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleLoadProject = (project: any) => {
    const inputs = project.inputs || {};
    setProjectName(inputs.projectName || project.name || '');
    setInvestmentType(inputs.investmentType || 'ready');
    setPurchasePrice(inputs.purchasePrice ?? 2000000);
    setClosingCosts(inputs.closingCosts ?? 0.03);
    setRenovationCost(inputs.renovationCost ?? 100000);
    setHasTurnkey(inputs.hasTurnkey ?? false);
    setTurnkeyCost(inputs.turnkeyCost ?? 0);
    setRentalUnits(inputs.rentalUnits || [{ id: '1', name: 'Loja 1', monthlyRent: 15000 }]);
    setAdjustmentIndex(inputs.adjustmentIndex || 'igpm');
    setCustomIndexRate(inputs.customIndexRate ?? 0.05);
    setVacancyRate(inputs.vacancyRate ?? 0.05);
    setPropertyTax(inputs.propertyTax ?? 12000);
    setCondoFee(inputs.condoFee ?? 6000);
    setManagementFee(inputs.managementFee ?? 0.08);
    setHoldingPeriod(inputs.holdingPeriod ?? 10);
    setExitCapRate(inputs.exitCapRate ?? 0.07);
    setDiscountRate(inputs.discountRate ?? 0.12);
    setOpenDialogOpen(false);
    toast({ title: 'Projeto carregado!', description: project.name });
  };

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
        hasTurnkey,
        turnkeyCost,
        rentalUnits,
        adjustmentIndex,
        customIndexRate,
        vacancyRate,
        propertyTax,
        condoFee,
        managementFee,
        holdingPeriod,
        exitCapRate,
        discountRate,
      },
      results: {
        totalInvestment: calculations.totalInvestment,
        noi: calculations.noi,
        entryCapRate: calculations.entryCapRate,
        irr: calculations.irr,
        npv: calculations.npv,
        equityMultiple: calculations.equityMultiple,
        verdict: calculations.verdict,
      },
  });
  };

  const handleExportPDF = async () => {
    setIsExportingPDF(true);
    try {
      const closingCostsAmount = purchasePrice * closingCosts;
      const annualRent = totalMonthlyRent * 12;
      const managementAmount = annualRent * managementFee;
      
      await generateSimuladorPDF({
        projectName: projectName || 'Projeto sem nome',
        kpis: {
          entryCapRate: calculations.entryCapRate,
          irr: calculations.irr,
          npv: calculations.npv,
          equityMultiple: calculations.equityMultiple,
          totalInvestment: calculations.totalInvestment,
          noi: calculations.noi,
        },
        verdict: calculations.verdict,
        capexBreakdown: {
          purchasePrice,
          closingCostsAmount,
          closingCostsPercent: closingCosts,
          renovationCost,
          turnkeyCost: hasTurnkey ? turnkeyCost : 0,
        },
        rentalUnits,
        opexBreakdown: {
          propertyTax,
          condoFee,
          managementFee,
          managementAmount,
        },
        scenarios,
        assumptions: {
          adjustmentIndex,
          rentGrowth: effectiveRentGrowth,
          holdingPeriod,
          exitCapRate,
          discountRate,
          vacancyRate,
        },
      });
      toast({ title: 'PDF gerado com sucesso!', description: 'O download foi iniciado.' });
    } catch (error) {
      toast({ title: 'Erro ao gerar PDF', description: 'Tente novamente.', variant: 'destructive' });
    } finally {
      setIsExportingPDF(false);
    }
  };

  // Right panel (Dashboard)
  const Dashboard = (
    <div className="space-y-6">
      {/* KPIs Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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

        <SoftLockOverlay featureName="o VPL">
          <KPICard
            label="VPL"
            value={formatCurrency(calculations.npv)}
            icon={BarChart3}
            variant={
              calculations.npv > 0
                ? 'success'
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
          baseRent={totalMonthlyRent}
          calculateCapRate={sensitivityCapRateCalc}
        />
      </SoftLockOverlay>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => setOpenDialogOpen(true)}
          disabled={!user || loadingProjects}
        >
          <FolderOpen className="h-4 w-4 mr-2" />
          Abrir Projeto
        </Button>
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
          disabled={!user || isExportingPDF}
          onClick={handleExportPDF}
        >
          {isExportingPDF ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <FileText className="h-4 w-4 mr-2" />
          )}
          {isExportingPDF ? 'Gerando...' : 'Exportar PDF'}
        </Button>
      </div>

      {/* Open Project Dialog */}
      <Dialog open={openDialogOpen} onOpenChange={setOpenDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Abrir Projeto Salvo</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {savedProjects && savedProjects.length > 0 ? (
              savedProjects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => handleLoadProject(project)}
                  className="w-full p-3 text-left rounded-lg border border-border hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <p className="font-medium">{project.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(project.updated_at).toLocaleDateString('pt-BR')}
                  </p>
                </button>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">
                Nenhum projeto salvo
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
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
          tooltip="purchasePrice"
        />
        <PercentageSlider
          label="Custos de Fechamento"
          value={closingCosts}
          onChange={setClosingCosts}
          min={0}
          max={0.1}
          step={0.005}
          tooltip="closingCosts"
        />
        <CurrencyInput
          label="Reforma / Retrofit"
          value={renovationCost}
          onChange={setRenovationCost}
          tooltip="renovationCost"
        />
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-1.5">
            <Label className="text-sm font-medium">Incluir Obras Turnkey?</Label>
            <GlossaryTooltip term="turnkeyCost" />
          </div>
          <Switch checked={hasTurnkey} onCheckedChange={setHasTurnkey} />
        </div>
        {hasTurnkey && (
          <CurrencyInput
            label="Custo Turnkey"
            value={turnkeyCost}
            onChange={setTurnkeyCost}
            tooltip="turnkeyCost"
          />
        )}
      </CollapsibleInputCard>

      {/* Revenue Card - Multiple Units */}
      <RentalUnitsCard
        units={rentalUnits}
        onUnitsChange={setRentalUnits}
        adjustmentIndex={adjustmentIndex}
        onAdjustmentIndexChange={setAdjustmentIndex}
        customIndexRate={customIndexRate}
        onCustomIndexRateChange={setCustomIndexRate}
      />

      {/* Vacancy Rate */}
      <CollapsibleInputCard title="Premissas de Vacância" icon={TrendingUp}>
        <PercentageSlider
          label="Taxa de Vacância"
          value={vacancyRate}
          onChange={setVacancyRate}
          min={0}
          max={0.2}
          step={0.01}
          tooltip="vacancyRate"
        />
      </CollapsibleInputCard>

      {/* OPEX Card */}
      <CollapsibleInputCard title="Despesas (OPEX)" icon={Receipt}>
        <CurrencyInput
          label="IPTU (Anual)"
          value={propertyTax}
          onChange={setPropertyTax}
          tooltip="propertyTax"
        />
        <CurrencyInput
          label="Condomínio (Anual)"
          value={condoFee}
          onChange={setCondoFee}
          tooltip="condoFee"
        />
        <PercentageSlider
          label="Taxa de Administração"
          value={managementFee}
          onChange={setManagementFee}
          min={0}
          max={0.15}
          step={0.01}
          tooltip="managementFee"
        />
      </CollapsibleInputCard>

      {/* Exit Card */}
      <CollapsibleInputCard title="Saída" icon={DoorOpen}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Label className="text-sm font-medium">Horizonte (anos)</Label>
              <GlossaryTooltip term="holdingPeriod" />
            </div>
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
          tooltip="exitCapRate"
        />
        <PercentageSlider
          label="Custo de Oportunidade"
          value={discountRate}
          onChange={setDiscountRate}
          min={0.06}
          max={0.20}
          step={0.01}
          tooltip="discountRate"
        />
      </CollapsibleInputCard>
    </ToolLayout>
  );
}