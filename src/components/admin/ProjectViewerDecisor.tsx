import { formatCurrency, formatCompactCurrency, formatPercentage } from '@/lib/formatters';
import { Calendar, User, Scale, CheckCircle, AlertTriangle, XCircle, MapPin, Users, TrendingUp, Wrench, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProjectViewerDecisorProps {
  inputs: Record<string, unknown>;
  results: Record<string, unknown>;
  projectName: string;
  userName?: string | null;
  updatedAt?: string;
}

export function ProjectViewerDecisor({
  inputs,
  results,
  projectName,
  userName,
  updatedAt,
}: ProjectViewerDecisorProps) {
  // Extract inputs
  const askingPrice = (inputs.askingPrice as number) || 0;
  const monthlyRent = (inputs.monthlyRent as number) || 0;
  const targetMonthlyCapRate = (inputs.targetMonthlyCapRate as number) || 0.0067;
  const condoFee = (inputs.condoFee as number) || 0;
  const propertyTax = (inputs.propertyTax as number) || 0;
  const managementFee = (inputs.managementFee as number) || 0.08;
  const locationQuality = (inputs.locationQuality as number) || 4;
  const tenantRisk = (inputs.tenantRisk as number) || 3;
  const futureLiquidity = (inputs.futureLiquidity as number) || 3;
  const assetCondition = (inputs.assetCondition as number) || 4;

  // Extract results
  const maxStrikePrice = (results.maxStrikePrice as number) || 0;
  const priceGap = (results.priceGap as number) || 0;
  const qualityScore = (results.qualityScore as number) || 0;
  const verdict = (results.verdict as 'GO' | 'NEGOTIATE' | 'NO-GO') || 'NO-GO';

  // Calculate implicit cap rate
  const annualGrossRent = monthlyRent * 12;
  const annualCondoFee = condoFee * 12;
  const annualManagementFee = annualGrossRent * managementFee;
  const totalOpex = annualCondoFee + propertyTax + annualManagementFee;
  const annualNOI = annualGrossRent - totalOpex;
  const impliedCapRate = askingPrice > 0 ? annualNOI / askingPrice : 0;
  const impliedMonthlyCapRate = impliedCapRate / 12;
  const priceGapPercentage = askingPrice > 0 ? priceGap / askingPrice : 0;

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const verdictConfig = {
    GO: {
      icon: CheckCircle,
      label: 'GO',
      description: 'Avance com a negociação',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
      textColor: 'text-green-600',
    },
    NEGOTIATE: {
      icon: AlertTriangle,
      label: 'NEGOCIAR',
      description: 'Há espaço para negociação',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      textColor: 'text-amber-600',
    },
    'NO-GO': {
      icon: XCircle,
      label: 'NO-GO',
      description: 'Não recomendado',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
      textColor: 'text-red-600',
    },
  };

  const config = verdictConfig[verdict];
  const VerdictIcon = config.icon;

  const qualitativeItems = [
    { label: 'Localização', value: locationQuality, icon: MapPin },
    { label: 'Risco Inquilino', value: tenantRisk, icon: Users },
    { label: 'Liquidez Futura', value: futureLiquidity, icon: TrendingUp },
    { label: 'Condição do Ativo', value: assetCondition, icon: Wrench },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-border pb-4">
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
          <Scale className="h-4 w-4" />
          <span>Decisor Go/No-Go</span>
        </div>
        <h2 className="text-xl font-semibold">{projectName}</h2>
        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
          {userName && (
            <div className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              <span>{userName}</span>
            </div>
          )}
          {updatedAt && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formatDate(updatedAt)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Verdict Traffic Light */}
      <div className={cn(
        "rounded-xl border-2 p-8 text-center",
        config.bgColor,
        config.borderColor
      )}>
        <VerdictIcon className={cn("h-16 w-16 mx-auto mb-4", config.textColor)} />
        <h2 className={cn("font-serif text-3xl font-bold mb-2", config.textColor)}>
          {config.label}
        </h2>
        <p className="text-muted-foreground">{config.description}</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Cap Rate Implícito (mensal)</p>
          <p className={cn(
            "text-2xl font-mono font-bold",
            impliedMonthlyCapRate >= targetMonthlyCapRate ? "text-green-600" : "text-amber-600"
          )}>
            {formatPercentage(impliedMonthlyCapRate)}
          </p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Score Qualitativo</p>
          <p className={cn(
            "text-2xl font-mono font-bold",
            qualityScore >= 70 ? "text-green-600" : qualityScore >= 50 ? "text-amber-600" : "text-red-600"
          )}>
            {Math.round(qualityScore)}/100
          </p>
        </div>
      </div>

      {/* Price Analysis */}
      <div className="bg-card rounded-lg border border-border p-4 shadow-sm">
        <h3 className="font-semibold text-lg mb-3">Análise de Preço</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Preço Pedido</span>
            <span className="font-mono font-medium">{formatCompactCurrency(askingPrice)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Preço Máximo (Strike)</span>
            <span className="font-mono font-medium text-primary">{formatCompactCurrency(maxStrikePrice)}</span>
          </div>
          <div className="h-px bg-border my-2" />
          <div className="flex justify-between">
            <span className="text-muted-foreground">Gap</span>
            <span className={cn(
              "font-mono font-medium",
              priceGap >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {priceGap >= 0 ? '+' : ''}{formatCompactCurrency(priceGap)} ({formatPercentage(priceGapPercentage)})
            </span>
          </div>
        </div>
      </div>

      {/* Qualitative Assessment */}
      <div className="bg-card rounded-lg border border-border p-4 shadow-sm">
        <h3 className="font-semibold text-lg mb-3">Avaliação Qualitativa</h3>
        <div className="space-y-3">
          {qualitativeItems.map((item) => (
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
                      "h-4 w-4",
                      star <= item.value
                        ? "fill-primary text-primary"
                        : "text-muted-foreground/30"
                    )}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* OPEX Summary */}
      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="text-sm font-medium mb-3">Estrutura de Custos</h4>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Aluguel Mensal</span>
            <span className="font-mono">{formatCurrency(monthlyRent)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">NOI Anual</span>
            <span className="font-mono text-primary">{formatCurrency(annualNOI)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
