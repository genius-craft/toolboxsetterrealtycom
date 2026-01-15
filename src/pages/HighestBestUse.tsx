import React, { useState, useMemo } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { CollapsibleInputCard } from '@/components/tools/CollapsibleInputCard';
import { CurrencyInput } from '@/components/tools/CurrencyInput';
import { KPICard } from '@/components/tools/KPICard';
import { VerdictBadge } from '@/components/tools/VerdictBadge';
import { SoftLockOverlay } from '@/components/tools/SoftLockOverlay';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useSaveProject } from '@/hooks/useProjects';
import { calculateHBU, HBUResult } from '@/lib/calculations';
import { formatCurrency, formatCompactCurrency, formatPercentage, formatArea } from '@/lib/formatters';
import {
  Map,
  Building,
  Store,
  Building2,
  Save,
  Download,
  Trophy,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const scenarioConfig = {
  residencial: {
    name: 'Residencial',
    icon: Building,
    efficiency: 0.85,
    pricePerSqm: 12000,
    constructionCostPerSqm: 4500,
    additionalCosts: 0.15,
  },
  comercial: {
    name: 'Comercial / Mall',
    icon: Store,
    efficiency: 0.75,
    pricePerSqm: 15000,
    constructionCostPerSqm: 5000,
    additionalCosts: 0.2,
  },
  misto: {
    name: 'Misto / BTS',
    icon: Building2,
    efficiency: 0.8,
    pricePerSqm: 13000,
    constructionCostPerSqm: 4800,
    additionalCosts: 0.18,
  },
};

export default function HighestBestUse() {
  const { user } = useAuth();
  const saveProject = useSaveProject();

  // Global Config
  const [landArea, setLandArea] = useState(5000); // sqm
  const [far, setFar] = useState(4); // Floor Area Ratio
  const [landCost, setLandCost] = useState(15000000);

  // Scenario-specific overrides
  const [scenarios, setScenarios] = useState({
    residencial: { ...scenarioConfig.residencial },
    comercial: { ...scenarioConfig.comercial },
    misto: { ...scenarioConfig.misto },
  });

  // Calculations
  const results = useMemo(() => {
    const params = { landArea, far, landCost };
    
    const residencial = calculateHBU(params, scenarios.residencial);
    const comercial = calculateHBU(params, scenarios.comercial);
    const misto = calculateHBU(params, scenarios.misto);

    const all = [residencial, comercial, misto];
    const winner = all.reduce((prev, current) => 
      current.margin > prev.margin ? current : prev
    );

    return { residencial, comercial, misto, all, winner };
  }, [landArea, far, landCost, scenarios]);

  const updateScenario = (
    key: keyof typeof scenarios,
    field: string,
    value: number
  ) => {
    setScenarios((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  const handleSave = () => {
    saveProject.mutate({
      project_type: 'hbu',
      name: `H&BU ${new Date().toLocaleDateString('pt-BR')}`,
      inputs: { landArea, far, landCost, scenarios },
      results: {
        residencial: results.residencial,
        comercial: results.comercial,
        misto: results.misto,
        winner: results.winner.name,
      },
    });
  };

  const ScenarioCard = ({ result, scenarioKey }: { result: HBUResult; scenarioKey: keyof typeof scenarios }) => {
    const config = scenarioConfig[scenarioKey];
    const Icon = config.icon;
    const isWinner = result.name === results.winner.name;

    return (
      <div
        className={cn(
          'bg-card rounded-lg border p-4 shadow-card transition-all',
          isWinner ? 'border-accent ring-1 ring-accent/20' : 'border-border'
        )}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className={cn(
            'p-2 rounded-lg',
            isWinner ? 'bg-accent/10' : 'bg-secondary'
          )}>
            <Icon className={cn('h-5 w-5', isWinner ? 'text-accent' : 'text-muted-foreground')} />
          </div>
          <div>
            <h4 className="font-serif font-medium">{result.name}</h4>
            {isWinner && (
              <span className="text-xs text-accent font-medium">Melhor Opção</span>
            )}
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">VGV Potencial</span>
            <span className="font-mono font-medium">
              {formatCompactCurrency(result.potentialRevenue)}
            </span>
          </div>
          
          <SoftLockOverlay featureName="o lucro">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Lucro Líquido</span>
              <span className={cn(
                'font-mono font-medium',
                result.netProfit > 0 ? 'text-green-600' : 'text-red-600'
              )}>
                {formatCompactCurrency(result.netProfit)}
              </span>
            </div>
          </SoftLockOverlay>

          <SoftLockOverlay featureName="a margem">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Margem</span>
                <span className={cn(
                  'font-mono font-medium',
                  result.margin > 0.2 ? 'text-green-600' : 'text-amber-600'
                )}>
                  {formatPercentage(result.margin)}
                </span>
              </div>
              <Progress 
                value={Math.max(0, result.margin * 100)} 
                className="h-2"
              />
            </div>
          </SoftLockOverlay>
        </div>
      </div>
    );
  };

  const Dashboard = (
    <div className="space-y-6">
      {/* Winner Card */}
      <div className="bg-card rounded-lg border border-accent/30 p-6 shadow-card text-center bg-accent/5">
        <div className="flex flex-col items-center gap-3">
          <div className="p-4 bg-accent/10 rounded-full">
            <Trophy className="h-8 w-8 text-accent" />
          </div>
          <SoftLockOverlay featureName="o vencedor">
            <div>
              <h3 className="font-serif text-xl font-medium">{results.winner.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Margem de{' '}
                <span className="font-mono font-medium text-accent">
                  {formatPercentage(results.winner.margin)}
                </span>
              </p>
            </div>
          </SoftLockOverlay>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 gap-4">
        <KPICard
          label="Área Construível"
          value={formatArea(landArea * far)}
          icon={Building2}
        />
        <KPICard
          label="Custo do Terreno"
          value={formatCompactCurrency(landCost)}
          icon={Map}
        />
      </div>

      {/* Scenario Cards */}
      <div className="space-y-4">
        <h3 className="font-serif text-lg">Comparativo</h3>
        <ScenarioCard result={results.residencial} scenarioKey="residencial" />
        <ScenarioCard result={results.comercial} scenarioKey="comercial" />
        <ScenarioCard result={results.misto} scenarioKey="misto" />
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
        <Button variant="outline" className="flex-1" disabled={!user}>
          <Download className="h-4 w-4 mr-2" />
          PDF
        </Button>
      </div>
    </div>
  );

  return (
    <ToolLayout title="Highest & Best Use" rightPanel={Dashboard}>
      {/* Global Config */}
      <CollapsibleInputCard title="Configuração do Terreno" icon={Map}>
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
          label="Custo do Terreno"
          value={landCost}
          onChange={setLandCost}
        />
      </CollapsibleInputCard>

      {/* Residencial */}
      <CollapsibleInputCard title="Cenário Residencial" icon={Building}>
        <CurrencyInput
          label="Preço por m² (venda)"
          value={scenarios.residencial.pricePerSqm}
          onChange={(v) => updateScenario('residencial', 'pricePerSqm', v)}
        />
        <CurrencyInput
          label="Custo por m² (construção)"
          value={scenarios.residencial.constructionCostPerSqm}
          onChange={(v) => updateScenario('residencial', 'constructionCostPerSqm', v)}
        />
      </CollapsibleInputCard>

      {/* Comercial */}
      <CollapsibleInputCard title="Cenário Comercial / Mall" icon={Store}>
        <CurrencyInput
          label="Preço por m² (venda/locação)"
          value={scenarios.comercial.pricePerSqm}
          onChange={(v) => updateScenario('comercial', 'pricePerSqm', v)}
        />
        <CurrencyInput
          label="Custo por m² (construção)"
          value={scenarios.comercial.constructionCostPerSqm}
          onChange={(v) => updateScenario('comercial', 'constructionCostPerSqm', v)}
        />
      </CollapsibleInputCard>

      {/* Misto */}
      <CollapsibleInputCard title="Cenário Misto / BTS" icon={Building2}>
        <CurrencyInput
          label="Preço por m² (venda)"
          value={scenarios.misto.pricePerSqm}
          onChange={(v) => updateScenario('misto', 'pricePerSqm', v)}
        />
        <CurrencyInput
          label="Custo por m² (construção)"
          value={scenarios.misto.constructionCostPerSqm}
          onChange={(v) => updateScenario('misto', 'constructionCostPerSqm', v)}
        />
      </CollapsibleInputCard>
    </ToolLayout>
  );
}
