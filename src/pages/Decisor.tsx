import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { CollapsibleInputCard } from '@/components/tools/CollapsibleInputCard';
import { CurrencyInput } from '@/components/tools/CurrencyInput';
import { PercentageSlider } from '@/components/tools/PercentageSlider';
import { KPICard } from '@/components/tools/KPICard';
import { SoftLockOverlay } from '@/components/tools/SoftLockOverlay';
import { GlossaryTooltip } from '@/components/tools/InfoTooltip';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useSaveProject, useProject } from '@/hooks/useProjects';
import { calculateGoNoGo } from '@/lib/calculations';
import { formatCurrency, formatCompactCurrency, formatPercentage } from '@/lib/formatters';
import { generateDecisorPDF } from '@/lib/pdfExport';
import { toast } from 'sonner';
import {
  Calculator,
  Star,
  Save,
  Download,
  CheckCircle,
  AlertTriangle,
  XCircle,
  MapPin,
  Users,
  TrendingUp,
  Wrench,
  Loader2,
  Receipt,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { financialGlossary } from '@/components/tools/InfoTooltip';

const StarRating = ({
  value,
  onChange,
  label,
  tooltip,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
  tooltip?: keyof typeof financialGlossary;
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <Label className="text-sm font-medium">{label}</Label>
        {tooltip && <GlossaryTooltip term={tooltip} />}
      </div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1 transition-transform hover:scale-110"
          >
            <Star
              className={cn(
                'h-6 w-6 transition-colors',
                star <= value
                  ? 'fill-accent text-accent'
                  : 'text-muted-foreground'
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default function Decisor() {
  const { user } = useAuth();
  const saveProject = useSaveProject();
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  // URL params for loading project
  const [searchParams] = useSearchParams();
  const projectIdFromUrl = searchParams.get('id');
  const { data: projectFromUrl, isLoading: loadingProjectFromUrl } = useProject(projectIdFromUrl || '');
  const [hasLoadedFromUrl, setHasLoadedFromUrl] = useState(false);

  // Project name
  const [assetName, setAssetName] = useState('');
  const [showAddress, setShowAddress] = useState(false);
  const [googleMapsLink, setGoogleMapsLink] = useState('');

  // Financial inputs
  const [askingPrice, setAskingPrice] = useState(5000000);
  const [monthlyRent, setMonthlyRent] = useState(33333); // Aluguel mensal
  const [targetMonthlyCapRate, setTargetMonthlyCapRate] = useState(0.0067); // 0.67% mensal

  // OPEX inputs
  const [vacancyRate, setVacancyRate] = useState(0.05); // 5%
  const [condoFee, setCondoFee] = useState(0); // mensal
  const [propertyTax, setPropertyTax] = useState(0); // anual
  const [managementFee, setManagementFee] = useState(0.08); // 8%

  // Qualitative inputs (1-5)
  const [locationQuality, setLocationQuality] = useState(4);
  const [tenantRisk, setTenantRisk] = useState(3);
  const [futureLiquidity, setFutureLiquidity] = useState(3);
  const [assetCondition, setAssetCondition] = useState(4);

  // Convert monthly to annual for calculations
  const annualGrossRent = monthlyRent * 12;
  const effectiveGrossIncome = annualGrossRent * (1 - vacancyRate); // Deduz vacância
  const annualCondoFee = condoFee * 12;
  const annualManagementFee = effectiveGrossIncome * managementFee; // Sobre receita efetiva
  const totalOpex = annualCondoFee + propertyTax + annualManagementFee;
  const annualNOI = effectiveGrossIncome - totalOpex;
  const targetCapRate = targetMonthlyCapRate * 12;

  // Calculations
  const result = useMemo(() => {
    return calculateGoNoGo({
      askingPrice,
      annualNOI,
      targetCapRate,
      locationQuality,
      tenantRisk,
      futureLiquidity,
      assetCondition,
    });
  }, [
    askingPrice,
    annualNOI,
    targetCapRate,
    locationQuality,
    tenantRisk,
    futureLiquidity,
    assetCondition,
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleLoadProject = useCallback((project: any, showToast = true) => {
    const inputs = project.inputs || {};
    setAssetName(inputs.assetName || project.name || '');
    setAskingPrice(inputs.askingPrice ?? 5000000);
    setMonthlyRent(inputs.monthlyRent ?? 33333);
    setTargetMonthlyCapRate(inputs.targetMonthlyCapRate ?? 0.0067);
    setVacancyRate(inputs.vacancyRate ?? 0.05);
    setCondoFee(inputs.condoFee ?? 0);
    setPropertyTax(inputs.propertyTax ?? 0);
    setManagementFee(inputs.managementFee ?? 0.08);
    setLocationQuality(inputs.locationQuality ?? 4);
    setTenantRisk(inputs.tenantRisk ?? 3);
    setFutureLiquidity(inputs.futureLiquidity ?? 3);
    setAssetCondition(inputs.assetCondition ?? 4);
    if (showToast) {
      toast.success(`Projeto "${project.name}" carregado!`);
    }
  }, []);

  // Auto-load project from URL
  useEffect(() => {
    if (projectFromUrl && !loadingProjectFromUrl && !hasLoadedFromUrl) {
      handleLoadProject(projectFromUrl, false);
      setHasLoadedFromUrl(true);
    }
  }, [projectFromUrl, loadingProjectFromUrl, hasLoadedFromUrl, handleLoadProject]);

  const handleSave = () => {
    const projectName = assetName.trim() || `Decisor ${new Date().toLocaleDateString('pt-BR')}`;
    saveProject.mutate({
      project_type: 'decisor',
      name: projectName,
      inputs: {
        assetName,
        askingPrice,
        monthlyRent,
        targetMonthlyCapRate,
        vacancyRate,
        condoFee,
        propertyTax,
        managementFee,
        locationQuality,
        tenantRisk,
        futureLiquidity,
        assetCondition,
      },
      results: {
        maxStrikePrice: result.maxStrikePrice,
        priceGap: result.priceGap,
        qualityScore: result.qualityScore,
        verdict: result.verdict,
      },
    });
  };

  const handleExportPDF = async () => {
    setIsExportingPDF(true);
    try {
      await generateDecisorPDF({
        assetName: assetName || 'Ativo sem nome',
        verdict: result.verdict,
        kpis: {
          impliedCapRate: result.impliedCapRate,
          qualityScore: result.qualityScore,
          maxStrikePrice: result.maxStrikePrice,
          priceGap: result.priceGap,
          priceGapPercentage: result.priceGapPercentage,
        },
        inputs: {
          askingPrice,
          monthlyRent,
          targetMonthlyCapRate,
        },
        opex: {
          condoFee,
          propertyTax,
          managementFee,
          vacancyRate,
          annualGrossRent,
          effectiveGrossIncome,
          totalOpex,
          annualNOI,
        },
        ratings: {
          locationQuality,
          tenantRisk,
          futureLiquidity,
          assetCondition,
        },
      });
      toast.success('PDF gerado com sucesso!');
    } catch (error) {
      toast.error('Erro ao gerar PDF');
    } finally {
      setIsExportingPDF(false);
    }
  };

  const VerdictDisplay = () => {
    const config = {
      GO: {
        icon: CheckCircle,
        label: 'GO',
        description: 'Avance com a negociação',
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/30',
        textColor: 'text-green-600',
        iconColor: 'text-green-500',
      },
      NEGOTIATE: {
        icon: AlertTriangle,
        label: 'NEGOCIAR',
        description: 'Há espaço para negociação',
        bgColor: 'bg-amber-500/10',
        borderColor: 'border-amber-500/30',
        textColor: 'text-amber-600',
        iconColor: 'text-amber-500',
      },
      'NO-GO': {
        icon: XCircle,
        label: 'NO-GO',
        description: 'Não recomendado',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/30',
        textColor: 'text-red-600',
        iconColor: 'text-red-500',
      },
    };

    const verdictConfig = config[result.verdict];
    const Icon = verdictConfig.icon;

    return (
      <div
        className={cn(
          'rounded-xl border-2 p-8 text-center',
          verdictConfig.bgColor,
          verdictConfig.borderColor
        )}
      >
        <Icon className={cn('h-16 w-16 mx-auto mb-4', verdictConfig.iconColor)} />
        <h2 className={cn('font-serif text-3xl font-bold mb-2', verdictConfig.textColor)}>
          {verdictConfig.label}
        </h2>
        <p className="text-muted-foreground">{verdictConfig.description}</p>
      </div>
    );
  };

  const Dashboard = (
    <div className="space-y-6">
      {/* Verdict Traffic Light */}
      <SoftLockOverlay featureName="o veredicto">
        <VerdictDisplay />
      </SoftLockOverlay>

      {/* Financial KPIs */}
      <div className="grid grid-cols-2 gap-4">
        <KPICard
          label="Cap Rate Implícito (mensal)"
          value={formatPercentage(result.impliedCapRate / 12)}
          variant={result.impliedCapRate >= targetCapRate ? 'success' : 'warning'}
        />
        <KPICard
          label="Score Qualitativo"
          value={`${Math.round(result.qualityScore)}/100`}
          variant={
            result.qualityScore >= 70
              ? 'success'
              : result.qualityScore >= 50
              ? 'warning'
              : 'danger'
          }
        />
      </div>

      {/* OPEX Summary */}
      <div className="bg-card rounded-lg border border-border p-4 shadow-card">
        <h3 className="font-serif text-lg mb-3">Estrutura de Custos (OPEX)</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Receita Bruta</span>
            <span className="font-mono">{formatCompactCurrency(annualGrossRent)}/ano</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">- Vacância ({formatPercentage(vacancyRate)})</span>
            <span className="font-mono text-red-500">-{formatCompactCurrency(annualGrossRent * vacancyRate)}/ano</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">= Receita Efetiva</span>
            <span className="font-mono">{formatCompactCurrency(effectiveGrossIncome)}/ano</span>
          </div>
          <div className="h-px bg-border/50" />
          <div className="flex justify-between">
            <span className="text-muted-foreground">- Condomínio</span>
            <span className="font-mono text-red-500">-{formatCompactCurrency(annualCondoFee)}/ano</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">- IPTU</span>
            <span className="font-mono text-red-500">-{formatCompactCurrency(propertyTax)}/ano</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">- Taxa Adm ({formatPercentage(managementFee)})</span>
            <span className="font-mono text-red-500">-{formatCompactCurrency(annualManagementFee)}/ano</span>
          </div>
          <div className="h-px bg-border" />
          <div className="flex justify-between font-medium">
            <span className="text-foreground">= NOI Líquido</span>
            <span className="font-mono text-accent">{formatCompactCurrency(annualNOI)}/ano</span>
          </div>
        </div>
      </div>

      {/* Strike Price */}
      <SoftLockOverlay featureName="o preço máximo">
        <div className="bg-card rounded-lg border border-border p-4 shadow-card">
          <h3 className="font-serif text-lg mb-3">Análise de Preço</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Preço Pedido</span>
              <span className="font-mono font-medium">
                {formatCompactCurrency(askingPrice)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Preço Máximo (Strike)</span>
              <span className="font-mono font-medium text-accent">
                {formatCompactCurrency(result.maxStrikePrice)}
              </span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gap</span>
              <span
                className={cn(
                  'font-mono font-medium',
                  result.priceGap >= 0 ? 'text-green-600' : 'text-red-600'
                )}
              >
                {result.priceGap >= 0 ? '+' : ''}
                {formatCompactCurrency(result.priceGap)} ({formatPercentage(result.priceGapPercentage)})
              </span>
            </div>
          </div>
        </div>
      </SoftLockOverlay>

      {/* Quality Score Breakdown */}
      <div className="bg-card rounded-lg border border-border p-4 shadow-card">
        <h3 className="font-serif text-lg mb-3">Avaliação Qualitativa</h3>
        <div className="space-y-2">
          {[
            { label: 'Localização', value: locationQuality, icon: MapPin },
            { label: 'Risco Inquilino', value: tenantRisk, icon: Users },
            { label: 'Liquidez Futura', value: futureLiquidity, icon: TrendingUp },
            { label: 'Condição do Ativo', value: assetCondition, icon: Wrench },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <item.icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{item.label}</span>
              </div>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      'h-4 w-4',
                      star <= item.value
                        ? 'fill-accent text-accent'
                        : 'text-muted-foreground/30'
                    )}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
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
          className="flex-1" 
          disabled={!user || isExportingPDF}
          onClick={handleExportPDF}
        >
          {isExportingPDF ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          {isExportingPDF ? 'Gerando...' : 'PDF'}
        </Button>
      </div>
    </div>
  );

  return (
    <ToolLayout title="Decisor Go/No-Go" rightPanel={Dashboard}>
      {/* Asset Name */}
      <div className="bg-card rounded-lg border border-border p-4 shadow-card mb-4">
        <Label htmlFor="assetName" className="text-sm font-medium mb-2 block">
          Nome do Ativo
        </Label>
        <Input
          id="assetName"
          placeholder="Ex: Galpão Logístico ABC"
          value={assetName}
          onChange={(e) => setAssetName(e.target.value)}
          className="bg-background"
          maxLength={100}
        />
      </div>

      {/* Financial Inputs */}
      <CollapsibleInputCard title="Dados Financeiros" icon={Calculator}>
        <CurrencyInput
          label="Preço Pedido"
          value={askingPrice}
          onChange={setAskingPrice}
          tooltip="purchasePrice"
        />
        <CurrencyInput
          label="Aluguel Mensal"
          value={monthlyRent}
          onChange={setMonthlyRent}
          tooltip="monthlyRent"
        />
        <PercentageSlider
          label="Cap Rate Alvo (mensal)"
          value={targetMonthlyCapRate}
          onChange={setTargetMonthlyCapRate}
          min={0.003}
          max={0.015}
          step={0.0005}
          tooltip="targetCapRate"
        />
      </CollapsibleInputCard>

      {/* OPEX Inputs */}
      <CollapsibleInputCard title="Custos Operacionais (OPEX)" icon={Receipt} defaultOpen={false}>
        <PercentageSlider
          label="Taxa de Vacância"
          value={vacancyRate}
          onChange={setVacancyRate}
          min={0}
          max={0.20}
          step={0.01}
          tooltip="vacancyRate"
        />
        <CurrencyInput
          label="Condomínio (mensal)"
          value={condoFee}
          onChange={setCondoFee}
          tooltip="condoFee"
        />
        <CurrencyInput
          label="IPTU (anual)"
          value={propertyTax}
          onChange={setPropertyTax}
          tooltip="propertyTax"
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

      {/* Qualitative Inputs */}
      <CollapsibleInputCard title="Avaliação Qualitativa" icon={Star}>
        <StarRating
          label="Qualidade da Localização"
          value={locationQuality}
          onChange={setLocationQuality}
          tooltip="locationQuality"
        />
        <StarRating
          label="Risco do Inquilino"
          value={tenantRisk}
          onChange={setTenantRisk}
          tooltip="tenantRisk"
        />
        <StarRating
          label="Liquidez Futura"
          value={futureLiquidity}
          onChange={setFutureLiquidity}
          tooltip="futureLiquidity"
        />
        <StarRating
          label="Condição do Ativo"
          value={assetCondition}
          onChange={setAssetCondition}
          tooltip="assetCondition"
        />
      </CollapsibleInputCard>
    </ToolLayout>
  );
}
