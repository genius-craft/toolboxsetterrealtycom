import { KPICard } from '@/components/tools/KPICard';
import { GlossaryTooltip } from '@/components/tools/InfoTooltip';
import { formatCurrency, formatPercentage } from '@/lib/formatters';
import { Target, TrendingUp, BarChart3, Calendar, User } from 'lucide-react';

interface ProjectViewerPrecoTetoProps {
  inputs: Record<string, unknown>;
  results: Record<string, unknown>;
  projectName: string;
  userName?: string | null;
  updatedAt?: string;
}

export function ProjectViewerPrecoTeto({
  inputs,
  results,
  projectName,
  userName,
  updatedAt,
}: ProjectViewerPrecoTetoProps) {
  // Extract results with defaults
  const maxPrice = (results.maxPrice as number) || 0;
  const resultingCapRate = (results.resultingCapRate as number) || 0;
  const resultingIRR = (results.resultingIRR as number) || 0;
  const totalInvestment = (results.totalInvestment as number) || 0;
  const noi = (results.noi as number) || 0;

  // Extract inputs with defaults
  const calculationMode = (inputs.calculationMode as string) || 'capRate';
  const targetReturn = (inputs.targetReturn as number) || 0;
  const referencePrice = (inputs.referencePrice as number) || 0;
  const monthlyRent = (inputs.monthlyRent as number) || 0;
  const holdingPeriod = (inputs.holdingPeriod as number) || 10;

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const negotiationMargin = referencePrice > 0 ? referencePrice - maxPrice : 0;
  const negotiationMarginPercent = referencePrice > 0 ? negotiationMargin / referencePrice : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-border pb-4">
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
          <Target className="h-4 w-4" />
          <span>Preço Teto</span>
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

      {/* Main Result - Max Price */}
      <div className="bg-gradient-to-br from-rose-500/10 to-pink-500/5 rounded-xl border border-rose-500/20 p-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Preço Teto
          </span>
          <GlossaryTooltip term="maxPrice" />
        </div>
        <div className="text-3xl font-bold text-foreground font-mono">
          {formatCurrency(maxPrice)}
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Para atingir {calculationMode === 'irr' ? 'TIR' : 'Cap Rate'} de {formatPercentage(targetReturn)}
        </p>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <KPICard
          label={calculationMode === 'irr' ? 'TIR Alvo' : 'Cap Rate Alvo'}
          value={formatPercentage(targetReturn)}
          icon={Target}
          variant="default"
        />
        <KPICard
          label="Cap Rate Resultante"
          value={formatPercentage(resultingCapRate)}
          icon={BarChart3}
          variant={resultingCapRate >= 0.08 ? 'success' : 'warning'}
        />
        <KPICard
          label="TIR Resultante"
          value={formatPercentage(resultingIRR)}
          icon={TrendingUp}
          variant={resultingIRR >= 0.12 ? 'success' : 'warning'}
        />
      </div>

      {/* Investment Summary */}
      <div className="bg-card rounded-lg border border-border p-4 shadow-sm">
        <h3 className="font-semibold text-lg mb-3">Resumo do Investimento</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Preço Máximo de Aquisição</span>
            <span className="font-mono font-medium">{formatCurrency(maxPrice)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Investimento Total</span>
            <span className="font-mono font-medium">{formatCurrency(totalInvestment)}</span>
          </div>
          <div className="h-px bg-border my-2" />
          <div className="flex justify-between">
            <span className="text-muted-foreground">Aluguel Mensal</span>
            <span className="font-mono font-medium">{formatCurrency(monthlyRent)}</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">NOI Ano 1</span>
              <GlossaryTooltip term="noi" />
            </div>
            <span className="font-mono font-medium">{formatCurrency(noi)}</span>
          </div>
        </div>
      </div>

      {/* Comparison with Reference Price */}
      {referencePrice > 0 && (
        <div className="bg-card rounded-lg border border-border p-4 shadow-sm">
          <h3 className="font-semibold text-lg mb-3">Comparativo</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Preço de Referência</span>
              <span className="font-mono font-medium">{formatCurrency(referencePrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Preço Teto</span>
              <span className="font-mono font-medium text-primary">{formatCurrency(maxPrice)}</span>
            </div>
            <div className="h-px bg-border my-2" />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Margem de Negociação</span>
              <span className={`font-mono font-medium ${negotiationMargin > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(negotiationMargin)} ({formatPercentage(negotiationMarginPercent)})
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Assumptions */}
      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="text-sm font-medium mb-2">Premissas</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Modo de Cálculo</span>
            <span className="font-mono">{calculationMode === 'irr' ? 'Por TIR' : 'Por Cap Rate'}</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">Período de Holding</span>
              <GlossaryTooltip term="holdingPeriod" />
            </div>
            <span className="font-mono">{holdingPeriod} anos</span>
          </div>
        </div>
      </div>
    </div>
  );
}
