import { KPICard } from '@/components/tools/KPICard';
import { VerdictBadge } from '@/components/tools/VerdictBadge';
import { GlossaryTooltip } from '@/components/tools/InfoTooltip';
import { formatCurrency, formatPercentage, formatMultiple } from '@/lib/formatters';
import { Target, TrendingUp, BarChart3, Calendar, User } from 'lucide-react';

interface ProjectViewerSimuladorProps {
  inputs: Record<string, unknown>;
  results: Record<string, unknown>;
  projectName: string;
  userName?: string | null;
  updatedAt?: string;
}

export function ProjectViewerSimulador({
  inputs,
  results,
  projectName,
  userName,
  updatedAt,
}: ProjectViewerSimuladorProps) {
  // Extract results with defaults
  const entryCapRate = (results.entryCapRate as number) || 0;
  const irr = (results.irr as number) || 0;
  const npv = (results.npv as number) || 0;
  const equityMultiple = (results.equityMultiple as number) || 0;
  const totalInvestment = (results.totalInvestment as number) || 0;
  const noi = (results.noi as number) || 0;
  const verdict = (results.verdict as 'excellent' | 'good' | 'fair' | 'poor') || 'unknown';

  // Extract inputs with defaults
  const purchasePrice = (inputs.purchasePrice as number) || 0;
  const closingCosts = (inputs.closingCosts as number) || 0;
  const holdingPeriod = (inputs.holdingPeriod as number) || 10;
  const discountRate = (inputs.discountRate as number) || 0.12;

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-border pb-4">
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
          <BarChart3 className="h-4 w-4" />
          <span>Simulador de Viabilidade</span>
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

      {/* KPIs Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          label="Cap Rate Entrada"
          value={formatPercentage(entryCapRate)}
          icon={Target}
          variant={entryCapRate >= 0.08 ? 'success' : 'warning'}
          tooltip={<GlossaryTooltip term="capRate" />}
        />
        <KPICard
          label="TIR"
          value={formatPercentage(irr)}
          icon={TrendingUp}
          variant={irr >= 0.15 ? 'success' : irr >= 0.1 ? 'warning' : 'danger'}
          tooltip={<GlossaryTooltip term="irr" />}
        />
        <KPICard
          label="VPL"
          value={formatCurrency(npv)}
          icon={BarChart3}
          variant={npv > 0 ? 'success' : 'danger'}
          tooltip={<GlossaryTooltip term="npv" />}
        />
        <KPICard
          label="Multiplicador"
          value={formatMultiple(equityMultiple)}
          icon={BarChart3}
          variant={equityMultiple >= 2 ? 'success' : equityMultiple >= 1.5 ? 'warning' : 'danger'}
          tooltip={<GlossaryTooltip term="equityMultiple" />}
        />
      </div>

      {/* Investment Summary */}
      <div className="bg-card rounded-lg border border-border p-4 shadow-sm">
        <h3 className="font-semibold text-lg mb-3">Resumo do Investimento</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Preço de Aquisição</span>
            <span className="font-mono font-medium">{formatCurrency(purchasePrice)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Custos de Fechamento</span>
            <span className="font-mono font-medium">{formatPercentage(closingCosts)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Investimento Total</span>
            <span className="font-mono font-medium">{formatCurrency(totalInvestment)}</span>
          </div>
          <div className="h-px bg-border my-2" />
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">NOI Ano 1</span>
              <GlossaryTooltip term="noi" />
            </div>
            <span className="font-mono font-medium">{formatCurrency(noi)}</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">Yield Anual</span>
              <GlossaryTooltip term="yieldAnual" />
            </div>
            <span className="font-mono font-medium text-primary">
              {formatPercentage(totalInvestment > 0 ? noi / totalInvestment : 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Assumptions */}
      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="text-sm font-medium mb-2">Premissas</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">Período de Holding</span>
              <GlossaryTooltip term="holdingPeriod" />
            </div>
            <span className="font-mono">{holdingPeriod} anos</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">Taxa de Desconto</span>
              <GlossaryTooltip term="discountRate" />
            </div>
            <span className="font-mono">{formatPercentage(discountRate)}</span>
          </div>
        </div>
      </div>

      {/* Verdict */}
      <div className="flex items-center justify-between bg-card rounded-lg border border-border p-4">
        <div>
          <h3 className="font-semibold">Veredicto</h3>
          <p className="text-sm text-muted-foreground">Baseado nos parâmetros informados</p>
        </div>
        <VerdictBadge verdict={verdict} size="lg" />
      </div>
    </div>
  );
}
