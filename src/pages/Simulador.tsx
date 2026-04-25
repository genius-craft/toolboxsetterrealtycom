import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
import { HistoryButton } from '@/components/tools/HistoryButton';
import { ProjectVersion } from '@/hooks/useProjectVersions';
import { ProjectVersionsSheet } from '@/components/tools/ProjectVersionsSheet';
import { RentalUnitsCard, RentalUnit } from '@/components/tools/RentalUnitsCard';
import { AutoFillButton } from '@/components/ai/AutoFillButton';
import { AIAnalysisCard } from '@/components/ai/AIAnalysisCard';
import { applyAIFields } from '@/lib/applyAIFields';
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
import { useSaveProject, useUpdateProject, useProjects, useProject, ProjectType } from '@/hooks/useProjects';
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
  const updateProject = useUpdateProject();
  const { data: savedProjects, isLoading: loadingProjects } = useProjects('simulador' as ProjectType);
  
  // URL params for loading project
  const [searchParams] = useSearchParams();
  const projectIdFromUrl = searchParams.get('id');
  const { data: projectFromUrl, isLoading: loadingProjectFromUrl } = useProject(projectIdFromUrl || '');

  // Dialog state
  const [openDialogOpen, setOpenDialogOpen] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [hasLoadedFromUrl, setHasLoadedFromUrl] = useState(false);
  
  // Track loaded project ID for update vs create
  const [loadedProjectId, setLoadedProjectId] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  // Project Info
  const [projectName, setProjectName] = useState('');
  const [investmentType, setInvestmentType] = useState<'ready' | 'build-to-suit'>('ready');
  const [showAddress, setShowAddress] = useState(false);
  const [googleMapsLink, setGoogleMapsLink] = useState('');
  const [observations, setObservations] = useState('');

  // Investment (CAPEX)
  const [purchasePrice, setPurchasePrice] = useState(2000000);
  const [closingCosts, setClosingCosts] = useState(0.03); // 3%
  const [builtArea, setBuiltArea] = useState(500); // Metros construídos (m²)
  const [costPerSqm, setCostPerSqm] = useState(2000); // Custo por m² (R$)
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

  // Calculate shell cost and total construction cost
  const shellCost = builtArea * costPerSqm;
  const totalConstructionCost = shellCost + (hasTurnkey ? turnkeyCost : 0);

  // Collect all inputs for scenario calculations
  const simuladorInputs = useMemo(() => ({
    purchasePrice,
    closingCosts,
    renovationCost: shellCost, // Use shellCost for compatibility with scenario calculations
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
    shellCost,
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
    const totalInvestment = purchasePrice * (1 + closingCosts) + totalConstructionCost;
    const annualRent = totalMonthlyRent * 12;
    const effectiveGrossIncome = annualRent * (1 - vacancyRate);
    const annualManagement = effectiveGrossIncome * managementFee; // Taxa sobre valor recebido
    const operatingExpenses = propertyTax + condoFee + annualManagement;
    const noi = effectiveGrossIncome - operatingExpenses;
    // Cap Rate = NOI / Total Investment (not just purchase price)
    const entryCapRate = calculateCapRate(noi, totalInvestment);

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
    totalConstructionCost,
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


  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleLoadProject = useCallback((project: any, showToast = true) => {
    const inputs = project.inputs || {};
    setProjectName(inputs.projectName || project.name || '');
    setInvestmentType(inputs.investmentType || 'ready');
    setShowAddress(inputs.showAddress ?? false);
    setGoogleMapsLink(inputs.googleMapsLink ?? '');
    setObservations(inputs.observations ?? '');
    setPurchasePrice(inputs.purchasePrice ?? 2000000);
    setClosingCosts(inputs.closingCosts ?? 0.03);
    
    // Handle migration from old renovationCost to new builtArea/costPerSqm
    if (inputs.builtArea !== undefined) {
      setBuiltArea(inputs.builtArea);
      setCostPerSqm(inputs.costPerSqm ?? 2000);
    } else if (inputs.renovationCost !== undefined && inputs.renovationCost > 0) {
      // Migrate old projects: assume 500m² as default area
      setBuiltArea(500);
      setCostPerSqm(inputs.renovationCost / 500);
    } else {
      setBuiltArea(500);
      setCostPerSqm(2000);
    }
    
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
    setLoadedProjectId(project.id); // Track the loaded project ID for updates
    setOpenDialogOpen(false);
    if (showToast) {
      toast({ title: 'Projeto carregado!', description: project.name });
    }
  }, [toast]);

  const handleRestoreVersion = useCallback((v: ProjectVersion) => {
    handleLoadProject({ id: loadedProjectId, name: v.name, inputs: v.inputs, results: v.results } as any, false);
    toast({ title: 'Versão restaurada', description: `v${v.version_number} carregada. Clique em Salvar para confirmar.` });
  }, [handleLoadProject, loadedProjectId, toast]);

  // Auto-load project from URL
  useEffect(() => {
    if (projectFromUrl && !loadingProjectFromUrl && !hasLoadedFromUrl) {
      handleLoadProject(projectFromUrl, false);
      setLoadedProjectId(projectFromUrl.id); // Track loaded project ID
      setHasLoadedFromUrl(true);
    }
  }, [projectFromUrl, loadingProjectFromUrl, hasLoadedFromUrl, handleLoadProject]);

  const handleSave = () => {
    const projectData = {
      project_type: 'simulador' as const,
      name: projectName || `Simulação ${new Date().toLocaleDateString('pt-BR')}`,
      inputs: {
        projectName,
        investmentType,
        showAddress,
        googleMapsLink,
        observations,
        purchasePrice,
        closingCosts,
        builtArea,
        costPerSqm,
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
        monthlyCapRate: (calculations.noi / 12) / calculations.totalInvestment,
        irr: calculations.irr,
        npv: calculations.npv,
        equityMultiple: calculations.equityMultiple,
        verdict: calculations.verdict,
      },
    };

    if (loadedProjectId) {
      // UPDATE existing project
      updateProject.mutate({
        id: loadedProjectId,
        ...projectData,
      });
    } else {
      // CREATE new project
      saveProject.mutate(projectData);
    }
  };

  // Setters expostos para o auto-preenchimento por IA
  const aiSetters = {
    projectName: setProjectName,
    purchasePrice: setPurchasePrice,
    closingCosts: setClosingCosts,
    builtArea: setBuiltArea,
    costPerSqm: setCostPerSqm,
    hasTurnkey: setHasTurnkey,
    turnkeyCost: setTurnkeyCost,
    rentalUnits: setRentalUnits,
    vacancyRate: setVacancyRate,
    propertyTax: setPropertyTax,
    condoFee: setCondoFee,
    managementFee: setManagementFee,
    holdingPeriod: setHoldingPeriod,
    exitCapRate: setExitCapRate,
    discountRate: setDiscountRate,
  } as Record<string, ((value: never) => void) | undefined>;

  const handleAIFill = (fields: Record<string, unknown>) => {
    applyAIFields(aiSetters, fields);
  };

  const handleExportPDF = async () => {
    setIsExportingPDF(true);
    try {
      const closingCostsAmount = purchasePrice * closingCosts;
      const annualRent = totalMonthlyRent * 12;
      const effectiveRent = annualRent * (1 - vacancyRate);
      const managementAmount = effectiveRent * managementFee; // Taxa sobre valor recebido
      const turnkeyAmount = hasTurnkey ? turnkeyCost : 0;
      
      // Calcular Cap Rate Mensal = (NOI / 12) / Investimento Total
      const monthlyCapRate = (calculations.noi / 12) / calculations.totalInvestment;
      
      await generateSimuladorPDF({
        projectName: projectName || 'Projeto sem nome',
        googleMapsLink: showAddress ? googleMapsLink : undefined,
        observations: observations.trim() || undefined,
        kpis: {
          entryCapRate: calculations.entryCapRate,
          monthlyCapRate,
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
          builtArea,
          costPerSqm,
          shellCost,
          turnkeyCost: turnkeyAmount,
          totalConstructionCost,
        },
        rentalUnits,
        totalMonthlyRent, // Para mostrar fórmula da taxa de administração
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

      {/* AI Analysis */}
      <AIAnalysisCard
        tool="simulador"
        projectName={projectName}
        inputs={{
          purchasePrice, closingCosts, builtArea, costPerSqm,
          hasTurnkey, turnkeyCost, rentalUnits, vacancyRate,
          propertyTax, condoFee, managementFee,
          holdingPeriod, exitCapRate, discountRate,
        }}
        results={{
          totalInvestment: calculations.totalInvestment,
          noi: calculations.noi,
          entryCapRate: calculations.entryCapRate,
          monthlyCapRate: (calculations.noi / 12) / calculations.totalInvestment,
          irr: calculations.irr,
          npv: calculations.npv,
          equityMultiple: calculations.equityMultiple,
          verdict: calculations.verdict,
        }}
        resetKey={`${purchasePrice}-${totalMonthlyRent}-${holdingPeriod}`}
      />

      {/* Cash Flow Chart */}
      <div className="bg-card rounded-lg border border-border p-4 shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="font-serif text-lg">Fluxo de Caixa (J-Curve)</h3>
          <GlossaryTooltip term="jCurve" />
        </div>
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
          baseMonthlyRent={totalMonthlyRent}
          vacancyRate={vacancyRate}
          propertyTax={propertyTax}
          condoFee={condoFee}
          managementFeeRate={managementFee}
        />
      </SoftLockOverlay>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2 pb-safe">
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1 touch-target"
            onClick={() => setOpenDialogOpen(true)}
            disabled={!user || loadingProjects}
          >
            <FolderOpen className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Abrir Projeto</span>
          </Button>
          <Button
            variant="gold"
            className="flex-1 touch-target"
            onClick={handleSave}
            disabled={!user || saveProject.isPending || updateProject.isPending}
          >
            <Save className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">{(saveProject.isPending || updateProject.isPending) ? 'Salvando...' : 'Salvar'}</span>
          </Button>
        </div>
        <Button 
          className="w-full bg-[#E85D3D] hover:bg-[#D14D2D] text-white shadow-lg touch-target"
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
      {/* AI Auto-fill */}
      <div className="flex justify-end -mb-2">
        <AutoFillButton tool="simulador" onFill={handleAIFill} />
      </div>

      {/* Project Header */}
      <ProjectHeader
        projectName={projectName}
        onProjectNameChange={setProjectName}
        investmentType={investmentType}
        onInvestmentTypeChange={setInvestmentType}
        showAddress={showAddress}
        onShowAddressChange={setShowAddress}
        googleMapsLink={googleMapsLink}
        onGoogleMapsLinkChange={setGoogleMapsLink}
        observations={observations}
        onObservationsChange={setObservations}
        loadedProjectId={loadedProjectId}
        onShowHistory={() => setHistoryOpen(true)}
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

        {/* Nova seção: Obra (Shell) */}
        <div className="border-t border-border pt-4 mt-4">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Obra (Shell)</h4>
          
          {/* Input: Metros Construídos */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-1.5">
              <Label className="text-sm font-medium">Metros Construídos</Label>
              <GlossaryTooltip term="builtArea" />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={builtArea}
                onChange={(e) => setBuiltArea(Number(e.target.value) || 0)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
              />
              <span className="text-sm text-muted-foreground whitespace-nowrap">m²</span>
            </div>
          </div>
          
          {/* Input: Custo por m² */}
          <CurrencyInput
            label="Custo por m² (construção/reforma)"
            value={costPerSqm}
            onChange={setCostPerSqm}
            tooltip="costPerSqm"
          />
          
          {/* Resultado: Total Shell (somente leitura) */}
          <div className="flex justify-between items-center py-2 bg-muted/50 rounded px-3 mt-2">
            <span className="text-sm font-medium">Total Obra Shell</span>
            <span className="font-mono font-bold text-accent">{formatCurrency(shellCost)}</span>
          </div>
        </div>

        {/* Turnkey */}
        <div className="flex items-center justify-between py-2 mt-4">
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

        {/* Total de Obra (Shell + Turnkey) */}
        <div className="flex justify-between items-center py-3 bg-primary/10 rounded px-3 mt-2">
          <span className="text-sm font-bold">TOTAL DE OBRA</span>
          <span className="font-mono font-bold text-lg">{formatCurrency(totalConstructionCost)}</span>
        </div>
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
        {/* Linha mostrando o cálculo da taxa */}
        <div className="text-sm text-muted-foreground pl-2 -mt-2">
          {formatCurrency(totalMonthlyRent)} × {formatPercentage(managementFee)} = {formatCurrency(totalMonthlyRent * managementFee)}/mês
        </div>
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
      <ProjectVersionsSheet
        projectId={loadedProjectId}
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        onRestore={handleRestoreVersion}
      />
    </ToolLayout>
  );
}