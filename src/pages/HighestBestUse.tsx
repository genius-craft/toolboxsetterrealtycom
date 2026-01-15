import React, { useState, useMemo } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { CollapsibleInputCard } from '@/components/tools/CollapsibleInputCard';
import { CurrencyInput } from '@/components/tools/CurrencyInput';
import { PercentageSlider } from '@/components/tools/PercentageSlider';
import { HBUScenarioCard, HBUv2Result } from '@/components/tools/HBUScenarioCard';
import { SoftLockOverlay } from '@/components/tools/SoftLockOverlay';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useAuth } from '@/contexts/AuthContext';
import { useSaveProject } from '@/hooks/useProjects';
import { 
  calculateIncorporar, 
  calculateAlugar, 
  calculateBTS,
  IncorporarParams,
  AlugarParams,
  BTSParams,
} from '@/lib/calculations';
import { formatCurrency, formatCompactCurrency, formatPercentage, formatArea } from '@/lib/formatters';
import {
  Map,
  Building,
  Store,
  Warehouse,
  Save,
  Download,
  Trophy,
  RotateCcw,
  Info,
  Percent,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function HighestBestUse() {
  const { user } = useAuth();
  const saveProject = useSaveProject();

  // Global Config
  const [landArea, setLandArea] = useState(5000);
  const [far, setFar] = useState(4);
  const [landCost, setLandCost] = useState(15000000);
  const [discountRate, setDiscountRate] = useState(0.12);

  // Incorporar Residencial (Build & Sell)
  const [incorpPricePerSqm, setIncorpPricePerSqm] = useState(12000);
  const [incorpCostPerSqm, setIncorpCostPerSqm] = useState(4500);
  const [incorpEfficiency, setIncorpEfficiency] = useState(0.85);
  const [incorpMonths, setIncorpMonths] = useState(36);

  // Alugar Como Está (Rent Existing)
  const [alugarRentableArea, setAlugarRentableArea] = useState(2000);
  const [alugarRentPerSqm, setAlugarRentPerSqm] = useState(80);
  const [alugarVacancy, setAlugarVacancy] = useState(0.05);
  const [alugarCapRate, setAlugarCapRate] = useState(0.08);

  // Build-to-Suit
  const [btsCostPerSqm, setBtsCostPerSqm] = useState(3500);
  const [btsEfficiency, setBtsEfficiency] = useState(0.80);
  const [btsRentPerSqm, setBtsRentPerSqm] = useState(60);
  const [btsVacancy, setBtsVacancy] = useState(0.05);
  const [btsCapRate, setBtsCapRate] = useState(0.09);
  const [btsConstructionMonths, setBtsConstructionMonths] = useState(18);

  // Calculations
  const results = useMemo(() => {
    const incorpParams: IncorporarParams = {
      landArea,
      far,
      landCost,
      pricePerSqm: incorpPricePerSqm,
      constructionCostPerSqm: incorpCostPerSqm,
      efficiency: incorpEfficiency,
      totalMonths: incorpMonths,
      discountRate,
    };

    const alugarParams: AlugarParams = {
      landCost,
      rentableArea: alugarRentableArea,
      rentPerSqmMonthly: alugarRentPerSqm,
      vacancy: alugarVacancy,
      capRate: alugarCapRate,
      discountRate,
    };

    const btsParams: BTSParams = {
      landArea,
      far,
      landCost,
      constructionCostPerSqm: btsCostPerSqm,
      efficiency: btsEfficiency,
      rentPerSqmMonthly: btsRentPerSqm,
      vacancy: btsVacancy,
      capRate: btsCapRate,
      constructionMonths: btsConstructionMonths,
      discountRate,
    };

    const incorporar = calculateIncorporar(incorpParams);
    const alugar = calculateAlugar(alugarParams);
    const bts = calculateBTS(btsParams);

    const npvs = [
      { type: 'incorporar' as const, npv: incorporar.npv },
      { type: 'alugar' as const, npv: alugar.npv },
      { type: 'bts' as const, npv: bts.npv },
    ];

    const winner = npvs.reduce((prev, curr) => curr.npv > prev.npv ? curr : prev);
    const maxNPV = Math.max(incorporar.npv, alugar.npv, bts.npv);

    return {
      incorporar,
      alugar,
      bts,
      winner: winner.type,
      maxNPV,
    };
  }, [
    landArea, far, landCost, discountRate,
    incorpPricePerSqm, incorpCostPerSqm, incorpEfficiency, incorpMonths,
    alugarRentableArea, alugarRentPerSqm, alugarVacancy, alugarCapRate,
    btsCostPerSqm, btsEfficiency, btsRentPerSqm, btsVacancy, btsCapRate, btsConstructionMonths,
  ]);

  // Transform results for cards
  const scenarioResults: HBUv2Result[] = useMemo(() => [
    {
      name: 'Incorporar Residencial',
      type: 'incorporar',
      investment: results.incorporar.totalCost,
      returnValue: results.incorporar.vgv,
      npv: results.incorporar.npv,
      roi: results.incorporar.margin,
      timeToReturn: incorpMonths,
      riskLevel: 'alto',
      riskDescription: 'Risco de mercado e execução',
      summary: 'Alto retorno potencial, maior risco. Dinheiro recebido no futuro após construção e vendas.',
    },
    {
      name: 'Alugar Como Está',
      type: 'alugar',
      investment: landCost,
      returnValue: results.alugar.assetValue,
      npv: results.alugar.npv,
      roi: results.alugar.annualReturn,
      timeToReturn: Math.round(results.alugar.paybackYears),
      riskLevel: 'baixo',
      riskDescription: 'Renda imediata, sem construção',
      summary: 'Renda imediata com baixo risco. Sem necessidade de construção, retorno recorrente.',
    },
    {
      name: 'Build-to-Suit (BTS)',
      type: 'bts',
      investment: results.bts.totalInvestment,
      returnValue: results.bts.stabilizedValue,
      npv: results.bts.npv,
      roi: results.bts.totalInvestment > 0 ? results.bts.valueCreated / results.bts.totalInvestment : 0,
      timeToReturn: btsConstructionMonths,
      riskLevel: 'medio',
      riskDescription: 'Risco de construção, renda futura',
      summary: 'Renda recorrente após construção. Patrimônio com renda passiva de longo prazo.',
    },
  ], [results, incorpMonths, btsConstructionMonths, landCost]);

  const winnerName = {
    incorporar: 'Incorporar Residencial',
    alugar: 'Alugar Como Está',
    bts: 'Build-to-Suit (BTS)',
  };

  const handleReset = () => {
    setLandArea(5000);
    setFar(4);
    setLandCost(15000000);
    setDiscountRate(0.12);
    setIncorpPricePerSqm(12000);
    setIncorpCostPerSqm(4500);
    setIncorpEfficiency(0.85);
    setIncorpMonths(36);
    setAlugarRentableArea(2000);
    setAlugarRentPerSqm(80);
    setAlugarVacancy(0.05);
    setAlugarCapRate(0.08);
    setBtsCostPerSqm(3500);
    setBtsEfficiency(0.80);
    setBtsRentPerSqm(60);
    setBtsVacancy(0.05);
    setBtsCapRate(0.09);
    setBtsConstructionMonths(18);
    toast.success('Valores resetados');
  };

  const handleSave = () => {
    saveProject.mutate({
      project_type: 'hbu',
      name: `H&BU ${new Date().toLocaleDateString('pt-BR')}`,
      inputs: {
        landArea, far, landCost, discountRate,
        incorporar: { pricePerSqm: incorpPricePerSqm, costPerSqm: incorpCostPerSqm, efficiency: incorpEfficiency, months: incorpMonths },
        alugar: { rentableArea: alugarRentableArea, rentPerSqm: alugarRentPerSqm, vacancy: alugarVacancy, capRate: alugarCapRate },
        bts: { costPerSqm: btsCostPerSqm, efficiency: btsEfficiency, rentPerSqm: btsRentPerSqm, vacancy: btsVacancy, capRate: btsCapRate, constructionMonths: btsConstructionMonths },
      },
      results: {
        incorporar: results.incorporar,
        alugar: results.alugar,
        bts: results.bts,
        winner: results.winner,
      },
    });
  };

  const Dashboard = (
    <div className="space-y-6">
      {/* Educational Banner */}
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium mb-1">O que é H&BU?</p>
            <p className="text-blue-600 dark:text-blue-300">
              Análise de Highest & Best Use compara diferentes usos para um terreno usando VPL (Valor Presente Líquido) como métrica unificadora.
            </p>
          </div>
        </div>
      </div>

      {/* Winner Card */}
      <div className="bg-card rounded-lg border border-accent/30 p-6 shadow-card text-center bg-accent/5">
        <div className="flex flex-col items-center gap-3">
          <div className="p-4 bg-accent/10 rounded-full">
            <Trophy className="h-8 w-8 text-accent" />
          </div>
          <SoftLockOverlay featureName="o vencedor">
            <div>
              <h3 className="font-serif text-xl font-medium">{winnerName[results.winner]}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                VPL de{' '}
                <span className="font-mono font-medium text-accent">
                  {formatCompactCurrency(results.maxNPV)}
                </span>
              </p>
            </div>
          </SoftLockOverlay>
        </div>
      </div>

      {/* Scenario Cards */}
      <div className="space-y-4">
        <h3 className="font-serif text-lg">Comparativo de Cenários</h3>
        
        <HBUScenarioCard
          result={scenarioResults[0]}
          icon={Building}
          isWinner={results.winner === 'incorporar'}
          maxNPV={results.maxNPV}
        />
        
        <HBUScenarioCard
          result={scenarioResults[1]}
          icon={Store}
          isWinner={results.winner === 'alugar'}
          maxNPV={results.maxNPV}
        />
        
        <HBUScenarioCard
          result={scenarioResults[2]}
          icon={Warehouse}
          isWinner={results.winner === 'bts'}
          maxNPV={results.maxNPV}
        />
      </div>

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
        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <ToolLayout title="Highest & Best Use" rightPanel={Dashboard}>
      {/* Global Config */}
      <CollapsibleInputCard title="Configuração do Terreno" icon={Map} defaultOpen>
        <div className="space-y-2">
          <Label className="text-sm font-medium">Área do Terreno (m²)</Label>
          <Input
            type="number"
            value={landArea}
            onChange={(e) => setLandArea(Number(e.target.value))}
            className="font-mono"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Coeficiente de Aproveitamento</Label>
            <span className="font-mono text-sm text-accent font-medium">{far}x</span>
          </div>
          <Slider
            value={[far]}
            onValueChange={([v]) => setFar(v)}
            min={1}
            max={8}
            step={0.5}
          />
          <p className="text-xs text-muted-foreground">
            Área construível: {formatArea(landArea * far)}
          </p>
        </div>

        <CurrencyInput
          label="Valor do Terreno"
          value={landCost}
          onChange={setLandCost}
        />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Taxa de Desconto Anual</Label>
            <span className="font-mono text-sm text-accent font-medium">{formatPercentage(discountRate)}</span>
          </div>
          <Slider
            value={[discountRate * 100]}
            onValueChange={([v]) => setDiscountRate(v / 100)}
            min={6}
            max={20}
            step={0.5}
          />
        </div>
      </CollapsibleInputCard>

      {/* Incorporar Residencial */}
      <CollapsibleInputCard title="Incorporar Residencial" icon={Building}>
        <div className="bg-muted/50 rounded-lg p-3 mb-2">
          <p className="text-xs text-muted-foreground">
            <strong>Modelo:</strong> Construir apartamentos e vender. Alto retorno potencial, risco de mercado.
          </p>
        </div>

        <CurrencyInput
          label="Preço de Venda por m²"
          value={incorpPricePerSqm}
          onChange={setIncorpPricePerSqm}
        />

        <CurrencyInput
          label="Custo de Construção por m²"
          value={incorpCostPerSqm}
          onChange={setIncorpCostPerSqm}
        />

        <PercentageSlider
          label="Eficiência (% área vendável)"
          value={incorpEfficiency}
          onChange={setIncorpEfficiency}
          min={0.5}
          max={1}
          step={0.01}
        />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Prazo Total (meses)</Label>
            <span className="font-mono text-sm text-accent font-medium">{incorpMonths}</span>
          </div>
          <Slider
            value={[incorpMonths]}
            onValueChange={([v]) => setIncorpMonths(v)}
            min={18}
            max={60}
            step={6}
          />
        </div>
      </CollapsibleInputCard>

      {/* Alugar Como Está */}
      <CollapsibleInputCard title="Alugar Como Está" icon={Store}>
        <div className="bg-muted/50 rounded-lg p-3 mb-2">
          <p className="text-xs text-muted-foreground">
            <strong>Modelo:</strong> Alugar o imóvel existente sem construir. Renda imediata, baixo risco.
          </p>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Área Locável Atual (m²)</Label>
          <Input
            type="number"
            value={alugarRentableArea}
            onChange={(e) => setAlugarRentableArea(Number(e.target.value))}
            className="font-mono"
          />
        </div>

        <CurrencyInput
          label="Aluguel por m² (mensal)"
          value={alugarRentPerSqm}
          onChange={setAlugarRentPerSqm}
        />

        <PercentageSlider
          label="Vacância Estimada"
          value={alugarVacancy}
          onChange={setAlugarVacancy}
          min={0}
          max={0.3}
          step={0.01}
        />

        <PercentageSlider
          label="Cap Rate de Saída"
          value={alugarCapRate}
          onChange={setAlugarCapRate}
          min={0.05}
          max={0.15}
          step={0.005}
        />
      </CollapsibleInputCard>

      {/* Build-to-Suit */}
      <CollapsibleInputCard title="Build-to-Suit (BTS)" icon={Warehouse}>
        <div className="bg-muted/50 rounded-lg p-3 mb-2">
          <p className="text-xs text-muted-foreground">
            <strong>Modelo:</strong> Construir galpão/escritório para alugar. Patrimônio + renda futura.
          </p>
        </div>

        <CurrencyInput
          label="Custo de Construção por m²"
          value={btsCostPerSqm}
          onChange={setBtsCostPerSqm}
        />

        <PercentageSlider
          label="Eficiência (% área locável)"
          value={btsEfficiency}
          onChange={setBtsEfficiency}
          min={0.5}
          max={1}
          step={0.01}
        />

        <CurrencyInput
          label="Aluguel Esperado por m² (mensal)"
          value={btsRentPerSqm}
          onChange={setBtsRentPerSqm}
        />

        <PercentageSlider
          label="Vacância Estimada"
          value={btsVacancy}
          onChange={setBtsVacancy}
          min={0}
          max={0.3}
          step={0.01}
        />

        <PercentageSlider
          label="Cap Rate de Saída"
          value={btsCapRate}
          onChange={setBtsCapRate}
          min={0.05}
          max={0.15}
          step={0.005}
        />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Prazo de Construção (meses)</Label>
            <span className="font-mono text-sm text-accent font-medium">{btsConstructionMonths}</span>
          </div>
          <Slider
            value={[btsConstructionMonths]}
            onValueChange={([v]) => setBtsConstructionMonths(v)}
            min={6}
            max={36}
            step={3}
          />
        </div>
      </CollapsibleInputCard>
    </ToolLayout>
  );
}