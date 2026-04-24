import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { CollapsibleInputCard } from '@/components/tools/CollapsibleInputCard';
import { CurrencyInput } from '@/components/tools/CurrencyInput';
import { PercentageSlider } from '@/components/tools/PercentageSlider';
import { KPICard } from '@/components/tools/KPICard';
import { SoftLockOverlay } from '@/components/tools/SoftLockOverlay';
import { GlossaryTooltip } from '@/components/tools/InfoTooltip';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useSaveProject, useUpdateProject, useProjects, useProject, ProjectType } from '@/hooks/useProjects';
import { HistoryButton } from '@/components/tools/HistoryButton';
import { useToast } from '@/hooks/use-toast';
import {
  calculateMaxPriceByCapRate,
  calculateMaxPriceByIRR,
  calculatePrecoTetoMetrics,
} from '@/lib/calculations';
import { formatCurrency, formatPercentage } from '@/lib/formatters';
import { generatePrecoTetoPDF } from '@/lib/pdfExport';
import {
  Target,
  TrendingUp,
  Receipt,
  DollarSign,
  Save,
  FileText,
  BarChart3,
  FolderOpen,
  Loader2,
  ArrowDownUp,
  MapPin,
} from 'lucide-react';

export default function PrecoTeto() {
  const { user } = useAuth();
  const { toast } = useToast();
  const saveProject = useSaveProject();
  const updateProject = useUpdateProject();
  const { data: savedProjects, isLoading: loadingProjects } = useProjects('preco_teto' as ProjectType);
  
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

  // Project Info
  const [projectName, setProjectName] = useState('');
  const [showAddress, setShowAddress] = useState(false);
  const [googleMapsLink, setGoogleMapsLink] = useState('');
  const [observations, setObservations] = useState('');

  // Target Return
  const [calculationMode, setCalculationMode] = useState<'capRate' | 'irr'>('capRate');
  const [targetCapRate, setTargetCapRate] = useState(0.08); // 8% annual
  const [targetIRR, setTargetIRR] = useState(0.15); // 15% annual
  const [referencePrice, setReferencePrice] = useState(0); // Optional: asking price for comparison

  // Revenue
  const [monthlyRent, setMonthlyRent] = useState(15000);
  const [rentGrowth, setRentGrowth] = useState(0.04); // 4% annual
  const [vacancyRate, setVacancyRate] = useState(0.05); // 5%

  // Costs
  const [closingCosts, setClosingCosts] = useState(0.04); // 4%
  const [constructionCost, setConstructionCost] = useState(100000);
  const [propertyTax, setPropertyTax] = useState(12000); // Annual IPTU
  const [condoFee, setCondoFee] = useState(6000); // Annual
  const [managementFee, setManagementFee] = useState(0.08); // 8% of rent

  // Holding Period
  const [holdingPeriod, setHoldingPeriod] = useState(10);
  const [exitCapRate, setExitCapRate] = useState(0.08); // 8%

  // Calculations
  const calculations = useMemo(() => {
    const annualRent = monthlyRent * 12;
    const effectiveGrossIncome = annualRent * (1 - vacancyRate);
    const annualManagement = effectiveGrossIncome * managementFee;
    const operatingExpenses = propertyTax + condoFee + annualManagement;
    const noi = effectiveGrossIncome - operatingExpenses;

    let maxPrice: number;

    if (calculationMode === 'capRate') {
      // Direct formula for Cap Rate
      maxPrice = calculateMaxPriceByCapRate(
        noi,
        targetCapRate,
        closingCosts,
        constructionCost
      );
    } else {
      // Binary search for IRR
      maxPrice = calculateMaxPriceByIRR({
        targetIRR,
        annualRent,
        rentGrowth,
        vacancyRate,
        operatingExpenses,
        holdingPeriod,
        exitCapRate,
        closingCostsRate: closingCosts,
        constructionCost,
      });
    }

    // Get metrics at max price
    const metricsAtMaxPrice = calculatePrecoTetoMetrics(maxPrice, {
      closingCostsRate: closingCosts,
      constructionCost,
      annualRent,
      rentGrowth,
      vacancyRate,
      operatingExpenses,
      holdingPeriod,
      exitCapRate,
    });

    // Get metrics at reference price (if provided)
    const metricsAtReference = referencePrice > 0
      ? calculatePrecoTetoMetrics(referencePrice, {
          closingCostsRate: closingCosts,
          constructionCost,
          annualRent,
          rentGrowth,
          vacancyRate,
          operatingExpenses,
          holdingPeriod,
          exitCapRate,
        })
      : null;

    // Negotiation margin
    const negotiationMargin = referencePrice > 0 ? referencePrice - maxPrice : 0;
    const negotiationMarginPercent = referencePrice > 0 ? negotiationMargin / referencePrice : 0;

    return {
      maxPrice,
      noi,
      totalInvestment: metricsAtMaxPrice.totalInvestment,
      resultingCapRate: metricsAtMaxPrice.capRate,
      resultingIRR: metricsAtMaxPrice.irr,
      metricsAtReference,
      negotiationMargin,
      negotiationMarginPercent,
    };
  }, [
    monthlyRent,
    rentGrowth,
    vacancyRate,
    propertyTax,
    condoFee,
    managementFee,
    closingCosts,
    constructionCost,
    holdingPeriod,
    exitCapRate,
    calculationMode,
    targetCapRate,
    targetIRR,
    referencePrice,
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleLoadProject = useCallback((project: any, showToast = true) => {
    const inputs = project.inputs || {};
    setProjectName(inputs.projectName || project.name || '');
    setShowAddress(inputs.showAddress ?? false);
    setGoogleMapsLink(inputs.googleMapsLink ?? '');
    setObservations(inputs.observations ?? '');
    setCalculationMode(inputs.calculationMode || 'capRate');
    setTargetCapRate(inputs.targetCapRate ?? 0.08);
    setTargetIRR(inputs.targetIRR ?? 0.15);
    setReferencePrice(inputs.referencePrice ?? 0);
    setMonthlyRent(inputs.monthlyRent ?? 15000);
    setRentGrowth(inputs.rentGrowth ?? 0.04);
    setVacancyRate(inputs.vacancyRate ?? 0.05);
    setClosingCosts(inputs.closingCosts ?? 0.04);
    setConstructionCost(inputs.constructionCost ?? 100000);
    setPropertyTax(inputs.propertyTax ?? 12000);
    setCondoFee(inputs.condoFee ?? 6000);
    setManagementFee(inputs.managementFee ?? 0.08);
    setHoldingPeriod(inputs.holdingPeriod ?? 10);
    setExitCapRate(inputs.exitCapRate ?? 0.08);
    setLoadedProjectId(project.id);
    setOpenDialogOpen(false);
    if (showToast) {
      toast({ title: 'Projeto carregado!', description: project.name });
    }
  }, [toast]);

  const handleRestoreVersion = useCallback((v: any) => {
    handleLoadProject({ id: loadedProjectId, name: v.name, inputs: v.inputs, results: v.results }, false);
    toast({ title: 'Versão restaurada', description: `v${v.version_number} carregada. Clique em Salvar para confirmar.` });
  }, [handleLoadProject, loadedProjectId, toast]);

  // Auto-load project from URL
  useEffect(() => {
    if (projectFromUrl && !loadingProjectFromUrl && !hasLoadedFromUrl) {
      handleLoadProject(projectFromUrl, false);
      setLoadedProjectId(projectFromUrl.id);
      setHasLoadedFromUrl(true);
    }
  }, [projectFromUrl, loadingProjectFromUrl, hasLoadedFromUrl, handleLoadProject]);

  const handleSave = () => {
    const projectData = {
      project_type: 'preco_teto' as const,
      name: projectName || `Preço Teto ${new Date().toLocaleDateString('pt-BR')}`,
      inputs: {
        projectName,
        showAddress,
        googleMapsLink,
        observations,
        calculationMode,
        targetCapRate,
        targetIRR,
        referencePrice,
        monthlyRent,
        rentGrowth,
        vacancyRate,
        closingCosts,
        constructionCost,
        propertyTax,
        condoFee,
        managementFee,
        holdingPeriod,
        exitCapRate,
      },
      results: {
        maxPrice: calculations.maxPrice,
        totalInvestment: calculations.totalInvestment,
        noi: calculations.noi,
        resultingCapRate: calculations.resultingCapRate,
        resultingIRR: calculations.resultingIRR,
        negotiationMargin: calculations.negotiationMargin,
        negotiationMarginPercent: calculations.negotiationMarginPercent,
      },
    };

    if (loadedProjectId) {
      updateProject.mutate({
        id: loadedProjectId,
        ...projectData,
      });
    } else {
      saveProject.mutate(projectData);
    }
  };

  const handleExportPDF = async () => {
    setIsExportingPDF(true);
    try {
      await generatePrecoTetoPDF({
        projectName: projectName || 'Projeto sem nome',
        googleMapsLink: showAddress ? googleMapsLink : undefined,
        observations: observations.trim() || undefined,
        calculationMode,
        targetReturn: calculationMode === 'irr' ? targetIRR : targetCapRate,
        maxPrice: calculations.maxPrice,
        referencePrice: referencePrice > 0 ? referencePrice : null,
        kpis: {
          resultingCapRate: calculations.resultingCapRate,
          resultingIRR: calculations.resultingIRR,
          totalInvestment: calculations.totalInvestment,
          noi: calculations.noi,
        },
        inputs: {
          monthlyRent,
          rentGrowth,
          vacancyRate,
          closingCosts,
          constructionCost,
          operatingExpenses: propertyTax + condoFee + (monthlyRent * 12 * (1 - vacancyRate) * managementFee),
          holdingPeriod,
          exitCapRate,
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
      {/* Main Result Card */}
      <div className="bg-gradient-to-br from-rose-500/10 to-pink-500/5 rounded-xl border border-rose-500/20 p-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Target className="h-5 w-5 text-rose-500" />
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Preço Teto
          </span>
          <GlossaryTooltip term="maxPrice" />
        </div>
        <div className="text-4xl font-bold text-foreground font-mono mb-2">
          {formatCurrency(calculations.maxPrice)}
        </div>
        <p className="text-sm text-muted-foreground">
          Para atingir {calculationMode === 'irr' ? 'TIR' : 'Cap Rate'} de{' '}
          <span className="font-medium text-foreground">
            {formatPercentage(calculationMode === 'irr' ? targetIRR : targetCapRate)}
          </span>
        </p>
      </div>

      {/* KPIs Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <KPICard
          label="Cap Rate Resultante"
          value={formatPercentage(calculations.resultingCapRate)}
          icon={BarChart3}
          variant={calculations.resultingCapRate >= 0.08 ? 'success' : 'warning'}
        />
        
        <SoftLockOverlay featureName="a TIR resultante">
          <KPICard
            label="TIR Resultante"
            value={formatPercentage(calculations.resultingIRR)}
            icon={TrendingUp}
            variant={calculations.resultingIRR >= 0.12 ? 'success' : 'warning'}
          />
        </SoftLockOverlay>

        <KPICard
          label="NOI Ano 1"
          value={formatCurrency(calculations.noi)}
          icon={Receipt}
          variant="default"
        />
      </div>

      {/* Investment Summary */}
      <div className="bg-card rounded-lg border border-border p-4 shadow-card">
        <h3 className="font-serif text-lg mb-3">Resumo do Investimento</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Preço Máximo de Aquisição</span>
            <span className="font-mono font-medium">{formatCurrency(calculations.maxPrice)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Custos de Fechamento ({formatPercentage(closingCosts)})</span>
            <span className="font-mono font-medium">{formatCurrency(calculations.maxPrice * closingCosts)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Custo de Obra</span>
            <span className="font-mono font-medium">{formatCurrency(constructionCost)}</span>
          </div>
          <div className="h-px bg-border my-2" />
          <div className="flex justify-between">
            <span className="text-muted-foreground font-medium">Investimento Total</span>
            <span className="font-mono font-bold text-accent">{formatCurrency(calculations.totalInvestment)}</span>
          </div>
        </div>
      </div>

      {/* Comparison Card (if reference price provided) */}
      {referencePrice > 0 && (
        <div className="bg-card rounded-lg border border-border p-4 shadow-card">
          <div className="flex items-center gap-2 mb-3">
            <ArrowDownUp className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-serif text-lg">Comparativo</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Preço de Referência</span>
              <span className="font-mono font-medium">{formatCurrency(referencePrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Preço Teto</span>
              <span className="font-mono font-medium text-primary">{formatCurrency(calculations.maxPrice)}</span>
            </div>
            <div className="h-px bg-border my-2" />
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground font-medium">Margem de Negociação</span>
              <span className={`font-mono font-bold ${calculations.negotiationMargin > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(calculations.negotiationMargin)} ({formatPercentage(calculations.negotiationMarginPercent)})
              </span>
            </div>
            {calculations.metricsAtReference && (
              <>
                <div className="h-px bg-border my-2" />
                <p className="text-muted-foreground">
                  Se pagar <span className="font-medium text-foreground">{formatCurrency(referencePrice)}</span>:
                </p>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <span className="text-xs text-muted-foreground block mb-1">TIR seria</span>
                    <span className="font-mono font-medium">{formatPercentage(calculations.metricsAtReference.irr)}</span>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <span className="text-xs text-muted-foreground block mb-1">Cap Rate seria</span>
                    <span className="font-mono font-medium">{formatPercentage(calculations.metricsAtReference.capRate)}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => setOpenDialogOpen(true)}
          disabled={!user || loadingProjects}
        >
          <FolderOpen className="h-4 w-4 mr-2" />
          Abrir
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onClick={handleSave}
          disabled={!user || saveProject.isPending || updateProject.isPending}
        >
          {(saveProject.isPending || updateProject.isPending) ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {loadedProjectId ? 'Atualizar' : 'Salvar'}
        </Button>
        <SoftLockOverlay featureName="exportar PDF">
          <Button
            variant="gold"
            className="flex-1"
            onClick={handleExportPDF}
            disabled={isExportingPDF}
          >
            {isExportingPDF ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileText className="h-4 w-4 mr-2" />
            )}
            PDF
          </Button>
        </SoftLockOverlay>
      </div>
    </div>
  );

  // Left panel (Inputs)
  const Inputs = (
    <div className="space-y-4">
      {/* Simple Project Name Input */}
      <div className="bg-card rounded-lg border border-border p-4 shadow-card space-y-4">
        <div className="space-y-2">
          <Label htmlFor="project-name" className="text-sm font-medium">
            Nome do Projeto
          </Label>
          <input
            id="project-name"
            placeholder="Ex: Loja Centro SP"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 font-medium"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm font-medium">Endereço do Imóvel</Label>
            </div>
            <Switch
              checked={showAddress}
              onCheckedChange={setShowAddress}
            />
          </div>
          {showAddress && (
            <input
              placeholder="Cole o link do Google Maps aqui"
              value={googleMapsLink}
              onChange={(e) => setGoogleMapsLink(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          )}
        </div>
        {/* Observations */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium">Observações</Label>
          </div>
          <textarea
            placeholder="Anotações, premissas, contexto..."
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            maxLength={500}
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y"
          />
          <p className="text-xs text-muted-foreground text-right">{observations.length}/500</p>
        </div>
      </div>

      {/* Target Return */}
      <CollapsibleInputCard
        title="Retorno Alvo"
        icon={Target}
        defaultOpen={true}
      >
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-3 block">Modo de Cálculo</Label>
            <RadioGroup
              value={calculationMode}
              onValueChange={(v) => setCalculationMode(v as 'capRate' | 'irr')}
              className="grid grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="capRate" id="capRate" />
                <Label htmlFor="capRate" className="cursor-pointer">Por Cap Rate</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="irr" id="irr" />
                <Label htmlFor="irr" className="cursor-pointer">Por TIR</Label>
              </div>
            </RadioGroup>
          </div>

          {calculationMode === 'capRate' ? (
            <PercentageSlider
              label="Cap Rate Alvo (anual)"
              value={targetCapRate}
              onChange={setTargetCapRate}
              min={0.04}
              max={0.20}
              step={0.005}
              tooltip="targetCapRate"
            />
          ) : (
            <PercentageSlider
              label="TIR Alvo (anual)"
              value={targetIRR}
              onChange={setTargetIRR}
              min={0.08}
              max={0.30}
              step={0.005}
              tooltip="targetIRR"
            />
          )}

          <CurrencyInput
            label="Preço de Referência (opcional)"
            value={referencePrice}
            onChange={setReferencePrice}
            placeholder="Ex: 2.000.000"
            tooltip="referencePrice"
          />
        </div>
      </CollapsibleInputCard>

      {/* Revenue */}
      <CollapsibleInputCard
        title="Receita"
        icon={DollarSign}
        defaultOpen={true}
      >
        <div className="space-y-4">
          <CurrencyInput
            label="Aluguel Mensal"
            value={monthlyRent}
            onChange={setMonthlyRent}
            placeholder="Ex: 15.000"
            tooltip="monthlyRent"
          />
          <PercentageSlider
            label="Crescimento Anual"
            value={rentGrowth}
            onChange={setRentGrowth}
            min={0}
            max={0.10}
            step={0.005}
          />
          <PercentageSlider
            label="Vacância"
            value={vacancyRate}
            onChange={setVacancyRate}
            min={0}
            max={0.20}
            step={0.01}
            tooltip="vacancyRate"
          />
        </div>
      </CollapsibleInputCard>

      {/* Costs */}
      <CollapsibleInputCard
        title="Custos"
        icon={Receipt}
        defaultOpen={true}
      >
        <div className="space-y-4">
          <PercentageSlider
            label="Custos de Fechamento"
            value={closingCosts}
            onChange={setClosingCosts}
            min={0}
            max={0.10}
            step={0.005}
            tooltip="closingCosts"
          />
          <CurrencyInput
            label="Custo de Obra"
            value={constructionCost}
            onChange={setConstructionCost}
            placeholder="Ex: 100.000"
            tooltip="renovationCost"
          />
          <CurrencyInput
            label="IPTU (Anual)"
            value={propertyTax}
            onChange={setPropertyTax}
            placeholder="Ex: 12.000"
            tooltip="propertyTax"
          />
          <CurrencyInput
            label="Condomínio (Anual)"
            value={condoFee}
            onChange={setCondoFee}
            placeholder="Ex: 6.000"
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
        </div>
      </CollapsibleInputCard>

      {/* Holding Period */}
      <CollapsibleInputCard
        title="Horizonte"
        icon={BarChart3}
        defaultOpen={false}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label className="text-sm">Período de Holding</Label>
              <GlossaryTooltip term="holdingPeriod" />
            </div>
            <div className="flex items-center gap-4">
              <Slider
                value={[holdingPeriod]}
                onValueChange={([v]) => setHoldingPeriod(v)}
                min={3}
                max={20}
                step={1}
                className="flex-1"
              />
              <span className="font-mono text-sm w-20 text-right">{holdingPeriod} anos</span>
            </div>
          </div>
          <PercentageSlider
            label="Cap Rate de Saída"
            value={exitCapRate}
            onChange={setExitCapRate}
            min={0.04}
            max={0.15}
            step={0.005}
            tooltip="exitCapRate"
          />
        </div>
      </CollapsibleInputCard>
    </div>
  );

  return (
    <>
      <ToolLayout rightPanel={Dashboard}>
        {Inputs}
      </ToolLayout>

      {/* Open Project Dialog */}
      <Dialog open={openDialogOpen} onOpenChange={setOpenDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Abrir Projeto</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {loadingProjects ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : savedProjects?.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum projeto salvo ainda.
              </p>
            ) : (
              savedProjects?.map((project) => (
                <button
                  key={project.id}
                  onClick={() => handleLoadProject(project)}
                  className="w-full text-left p-3 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  <div className="font-medium">{project.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(project.updated_at).toLocaleDateString('pt-BR')}
                  </div>
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
