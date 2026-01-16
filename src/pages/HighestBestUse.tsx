import React, { useState, useMemo } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { CollapsibleInputCard } from '@/components/tools/CollapsibleInputCard';
import { CurrencyInput } from '@/components/tools/CurrencyInput';
import { PercentageSlider } from '@/components/tools/PercentageSlider';
import { HBUv3ScoreCard } from '@/components/tools/HBUv3ScoreCard';
import { HBUv3RecommendationCard } from '@/components/tools/HBUv3RecommendationCard';
import { HBUv3ComparisonTable } from '@/components/tools/HBUv3ComparisonTable';
import { GlossaryTooltip } from '@/components/tools/InfoTooltip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useSaveProject } from '@/hooks/useProjects';
import { calculateHBUv3, HBUv3Params } from '@/lib/calculations';
import { formatArea, formatPercentage } from '@/lib/formatters';
import { generateHBUPDF } from '@/lib/pdfExport';
import {
  Map,
  Building,
  Store,
  Layers,
  Save,
  RotateCcw,
  Info,
  Settings,
  Download,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

export default function HighestBestUse() {
  const { user } = useAuth();
  const saveProject = useSaveProject();
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  // Terreno
  const [landArea, setLandArea] = useState(1000);
  const [far, setFar] = useState(2);
  const [occupancyRate, setOccupancyRate] = useState(0.5);
  const [location, setLocation] = useState<'premium' | 'central' | 'periferia'>('central');
  const [zoning, setZoning] = useState<'zm' | 'zc' | 'zr' | 'zeis'>('zm');

  // Premissas Residencial
  const [residencialPricePerSqm, setResidencialPricePerSqm] = useState(12000);
  const [residencialCostPerSqm, setResidencialCostPerSqm] = useState(3500);
  const [residencialAbsorptionMonths, setResidencialAbsorptionMonths] = useState(24);

  // Premissas Comercial
  const [comercialPricePerSqm, setComercialPricePerSqm] = useState(15000);
  const [comercialCostPerSqm, setComercialCostPerSqm] = useState(4000);
  const [comercialAbsorptionMonths, setComercialAbsorptionMonths] = useState(36);

  // Premissas Gerais
  const [discountRate, setDiscountRate] = useState(0.15);
  const [constructionMonths, setConstructionMonths] = useState(24);
  const [landCostPremissa, setLandCostPremissa] = useState(0.15);

  // Calculations
  const results = useMemo(() => {
    const params: HBUv3Params = {
      landArea,
      far,
      occupancyRate,
      location,
      zoning,
      residencialPricePerSqm,
      residencialCostPerSqm,
      residencialAbsorptionMonths,
      comercialPricePerSqm,
      comercialCostPerSqm,
      comercialAbsorptionMonths,
      discountRate,
      constructionMonths,
      landCostPremissa,
    };

    return calculateHBUv3(params);
  }, [
    landArea, far, occupancyRate, location, zoning,
    residencialPricePerSqm, residencialCostPerSqm, residencialAbsorptionMonths,
    comercialPricePerSqm, comercialCostPerSqm, comercialAbsorptionMonths,
    discountRate, constructionMonths, landCostPremissa,
  ]);

  const winnerResult = results[results.winner];

  const handleReset = () => {
    setLandArea(1000);
    setFar(2);
    setOccupancyRate(0.5);
    setLocation('central');
    setZoning('zm');
    setResidencialPricePerSqm(12000);
    setResidencialCostPerSqm(3500);
    setResidencialAbsorptionMonths(24);
    setComercialPricePerSqm(15000);
    setComercialCostPerSqm(4000);
    setComercialAbsorptionMonths(36);
    setDiscountRate(0.15);
    setConstructionMonths(24);
    setLandCostPremissa(0.15);
    toast.success('Valores resetados');
  };

  const handleSave = () => {
    saveProject.mutate({
      project_type: 'hbu',
      name: `H&BU ${new Date().toLocaleDateString('pt-BR')}`,
      inputs: {
        terreno: { landArea, far, occupancyRate, location, zoning },
        residencial: { pricePerSqm: residencialPricePerSqm, costPerSqm: residencialCostPerSqm, absorptionMonths: residencialAbsorptionMonths },
        comercial: { pricePerSqm: comercialPricePerSqm, costPerSqm: comercialCostPerSqm, absorptionMonths: comercialAbsorptionMonths },
        gerais: { discountRate, constructionMonths, landCostPremissa },
      },
      results: {
        residencial: results.residencial,
        comercial: results.comercial,
        misto: results.misto,
        winner: results.winner,
        justification: results.justification,
      },
    });
  };

  const handleExportPDF = async () => {
    setIsExportingPDF(true);
    try {
      await generateHBUPDF({
        landParams: { landArea, far, occupancyRate, location },
        results: {
          residencial: { score: results.residencial.score, vgv: results.residencial.vgv, profit: results.residencial.grossProfit, npv: results.residencial.npv, margin: results.residencial.margin },
          comercial: { score: results.comercial.score, vgv: results.comercial.vgv, profit: results.comercial.grossProfit, npv: results.comercial.npv, margin: results.comercial.margin },
          misto: { score: results.misto.score, vgv: results.misto.vgv, profit: results.misto.grossProfit, npv: results.misto.npv, margin: results.misto.margin },
          winner: results.winner,
          justification: results.justification,
        },
      });
      toast.success('PDF gerado com sucesso!');
    } catch (error) {
      toast.error('Erro ao gerar PDF');
    } finally {
      setIsExportingPDF(false);
    }
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
              Análise de Highest & Best Use que determina qual uso de um terreno gera o maior valor econômico, comparando cenários Residencial, Comercial e Uso Misto.
            </p>
          </div>
        </div>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-3 gap-3">
        <HBUv3ScoreCard
          name="Residencial"
          score={results.residencial.score}
          icon={Building}
          isWinner={results.winner === 'residencial'}
          colorClass="bg-blue-100 dark:bg-blue-900/30"
        />
        <HBUv3ScoreCard
          name="Comercial"
          score={results.comercial.score}
          icon={Store}
          isWinner={results.winner === 'comercial'}
          colorClass="bg-amber-100 dark:bg-amber-900/30"
        />
        <HBUv3ScoreCard
          name="Uso Misto"
          score={results.misto.score}
          icon={Layers}
          isWinner={results.winner === 'misto'}
          colorClass="bg-purple-100 dark:bg-purple-900/30"
        />
      </div>

      {/* Winner Recommendation Card */}
      <HBUv3RecommendationCard
        result={winnerResult}
        justification={results.justification}
      />

      {/* Comparison Table */}
      <div className="space-y-3">
        <h3 className="font-serif text-lg">Comparativo Detalhado</h3>
        <HBUv3ComparisonTable
          residencial={results.residencial}
          comercial={results.comercial}
          misto={results.misto}
          winner={results.winner}
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
        <Button 
          variant="outline" 
          onClick={handleExportPDF}
          disabled={!user || isExportingPDF}
        >
          {isExportingPDF ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        </Button>
        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <ToolLayout title="Highest & Best Use" rightPanel={Dashboard}>
      {/* Terreno */}
      <CollapsibleInputCard title="Terreno" icon={Map} defaultOpen>
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
            <div className="flex items-center gap-1.5">
              <Label className="text-sm font-medium">Coeficiente de Aproveitamento (CA)</Label>
              <GlossaryTooltip term="far" />
            </div>
            <span className="font-mono text-sm text-accent font-medium">{far}x</span>
          </div>
          <Slider
            value={[far]}
            onValueChange={([v]) => setFar(v)}
            min={0.5}
            max={6}
            step={0.5}
          />
          <p className="text-xs text-muted-foreground">
            Área construível: {formatArea(landArea * far)}
          </p>
        </div>

        <PercentageSlider
          label="Taxa de Ocupação"
          value={occupancyRate}
          onChange={setOccupancyRate}
          min={0.2}
          max={0.8}
          step={0.05}
          tooltip="occupancyRate"
        />

        <div className="space-y-2">
          <Label className="text-sm font-medium">Localização</Label>
          <Select value={location} onValueChange={(v) => setLocation(v as typeof location)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="premium">Premium</SelectItem>
              <SelectItem value="central">Central</SelectItem>
              <SelectItem value="periferia">Periferia</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Zoneamento</Label>
          <Select value={zoning} onValueChange={(v) => setZoning(v as typeof zoning)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="zm">ZM - Zona Mista</SelectItem>
              <SelectItem value="zc">ZC - Zona Comercial</SelectItem>
              <SelectItem value="zr">ZR - Zona Residencial</SelectItem>
              <SelectItem value="zeis">ZEIS - Habitação Social</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CollapsibleInputCard>

      {/* Premissas Residencial */}
      <CollapsibleInputCard title="Premissas Residencial" icon={Building}>
        <div className="bg-muted/50 rounded-lg p-3 mb-2">
          <p className="text-xs text-muted-foreground">
            <strong>Apartamentos/Casas:</strong> Construção para venda
          </p>
        </div>

        <CurrencyInput
          label="Preço de Venda por m²"
          value={residencialPricePerSqm}
          onChange={setResidencialPricePerSqm}
        />

        <CurrencyInput
          label="Custo de Construção por m²"
          value={residencialCostPerSqm}
          onChange={setResidencialCostPerSqm}
        />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Label className="text-sm font-medium">Prazo de Absorção (meses)</Label>
              <GlossaryTooltip term="absorptionMonths" />
            </div>
            <span className="font-mono text-sm text-accent font-medium">{residencialAbsorptionMonths}</span>
          </div>
          <Slider
            value={[residencialAbsorptionMonths]}
            onValueChange={([v]) => setResidencialAbsorptionMonths(v)}
            min={12}
            max={48}
            step={6}
          />
        </div>
      </CollapsibleInputCard>

      {/* Premissas Comercial */}
      <CollapsibleInputCard title="Premissas Comercial" icon={Store}>
        <div className="bg-muted/50 rounded-lg p-3 mb-2">
          <p className="text-xs text-muted-foreground">
            <strong>Salas/Lojas/Escritórios:</strong> Construção para venda
          </p>
        </div>

        <CurrencyInput
          label="Preço de Venda por m²"
          value={comercialPricePerSqm}
          onChange={setComercialPricePerSqm}
        />

        <CurrencyInput
          label="Custo de Construção por m²"
          value={comercialCostPerSqm}
          onChange={setComercialCostPerSqm}
        />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Prazo de Absorção (meses)</Label>
            <span className="font-mono text-sm text-accent font-medium">{comercialAbsorptionMonths}</span>
          </div>
          <Slider
            value={[comercialAbsorptionMonths]}
            onValueChange={([v]) => setComercialAbsorptionMonths(v)}
            min={18}
            max={60}
            step={6}
          />
        </div>
      </CollapsibleInputCard>

      {/* Premissas Gerais */}
      <CollapsibleInputCard title="Premissas Gerais" icon={Settings}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Label className="text-sm font-medium">Taxa de Desconto Anual</Label>
              <GlossaryTooltip term="discountRate" />
            </div>
            <span className="font-mono text-sm text-accent font-medium">{formatPercentage(discountRate)}</span>
          </div>
          <Slider
            value={[discountRate * 100]}
            onValueChange={([v]) => setDiscountRate(v / 100)}
            min={8}
            max={25}
            step={0.5}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Prazo de Obra (meses)</Label>
            <span className="font-mono text-sm text-accent font-medium">{constructionMonths}</span>
          </div>
          <Slider
            value={[constructionMonths]}
            onValueChange={([v]) => setConstructionMonths(v)}
            min={12}
            max={48}
            step={6}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Custo do Terreno (% do VGV)</Label>
            <span className="font-mono text-sm text-accent font-medium">{formatPercentage(landCostPremissa)}</span>
          </div>
          <Slider
            value={[landCostPremissa * 100]}
            onValueChange={([v]) => setLandCostPremissa(v / 100)}
            min={10}
            max={25}
            step={1}
          />
          <p className="text-xs text-muted-foreground">
            Premissa de mercado para custo do terreno
          </p>
        </div>
      </CollapsibleInputCard>
    </ToolLayout>
  );
}
