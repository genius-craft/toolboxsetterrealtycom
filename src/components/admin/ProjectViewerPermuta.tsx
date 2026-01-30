import { formatCurrency, formatDuration } from '@/lib/formatters';
import { GlossaryTooltip } from '@/components/tools/InfoTooltip';
import { Calendar, User, ArrowRightLeft, Banknote, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProjectViewerPermutaProps {
  inputs: Record<string, unknown>;
  results: Record<string, unknown>;
  projectName: string;
  userName?: string | null;
  updatedAt?: string;
}

export function ProjectViewerPermuta({
  inputs,
  results,
  projectName,
  userName,
  updatedAt,
}: ProjectViewerPermutaProps) {
  // Extract inputs
  const vendaOferta = (inputs.vendaOferta as number) || 0;
  const percentualUnidades = (inputs.percentualUnidades as number) || 50;
  const taxaDesconto = (inputs.taxaDesconto as number) || 12;
  const aprovacaoMeses = (inputs.aprovacaoMeses as number) || 12;
  const construcaoMeses = (inputs.construcaoMeses as number) || 36;
  const vendaMeses = (inputs.vendaMeses as number) || 12;

  // Extract results
  const valorUnidades = (results.valorUnidades as number) || 0;
  const valorDinheiro = (results.valorDinheiro as number) || 0;
  const totalNominal = (results.totalNominal as number) || 0;
  const prazoTotalMeses = (results.prazoTotalMeses as number) || 0;
  const vpUnidades = (results.vpUnidades as number) || 0;
  const custoTotalCarrego = (results.custoTotalCarrego as number) || 0;
  const permutaLiquida = (results.permutaLiquida as number) || 0;
  const totalParceria = (results.totalParceria as number) || 0;
  const diferenca = (results.diferenca as number) || 0;
  const vencedor = (results.vencedor as string) || 'venda';

  const isParceriaBetter = vencedor === 'parceria';
  const diferencaPercent = vendaOferta > 0 ? (diferenca / vendaOferta) * 100 : 0;

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
          <ArrowRightLeft className="h-4 w-4" />
          <span>Calculadora de Permuta</span>
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

      {/* Comparison Cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* Venda Card */}
        <div className={cn(
          "rounded-xl border-2 p-4 text-center",
          !isParceriaBetter 
            ? "border-emerald-500/50 bg-emerald-500/10" 
            : "border-border bg-card"
        )}>
          <div className="flex items-center justify-center gap-2 mb-3">
            <Banknote className="h-5 w-5 text-emerald-600" />
            <span className="font-semibold">Vender Agora</span>
          </div>
          <p className="text-2xl font-mono font-bold">{formatCurrency(vendaOferta)}</p>
          <p className="text-xs text-muted-foreground mt-1">Dinheiro à vista</p>
          {!isParceriaBetter && (
            <div className="mt-3 text-xs font-medium text-emerald-600 bg-emerald-500/20 rounded-full px-2 py-1 inline-block">
              🏆 Melhor opção
            </div>
          )}
        </div>

        {/* Parceria Card */}
        <div className={cn(
          "rounded-xl border-2 p-4 text-center",
          isParceriaBetter 
            ? "border-blue-500/50 bg-blue-500/10" 
            : "border-border bg-card"
        )}>
          <div className="flex items-center justify-center gap-2 mb-3">
            <Building2 className="h-5 w-5 text-blue-600" />
            <span className="font-semibold">Parceria</span>
            <GlossaryTooltip term="permuta" />
          </div>
          <p className="text-2xl font-mono font-bold">{formatCurrency(totalParceria)}</p>
          <p className="text-xs text-muted-foreground mt-1">Valor Presente Líquido</p>
          {isParceriaBetter && (
            <div className="mt-3 text-xs font-medium text-blue-600 bg-blue-500/20 rounded-full px-2 py-1 inline-block">
              🏆 Melhor opção
            </div>
          )}
        </div>
      </div>

      {/* Análise */}
      <div className="bg-card rounded-lg border border-border p-4 shadow-sm">
        <h3 className="font-semibold text-lg mb-3">📊 Análise</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Prazo Total</span>
            <span className="font-mono font-medium">{formatDuration(prazoTotalMeses)}</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">VP das Unidades</span>
              <GlossaryTooltip term="presentValue" />
            </div>
            <span className="font-mono font-medium">{formatCurrency(vpUnidades)}</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">Custo de Carrego</span>
              <GlossaryTooltip term="carryingCost" />
            </div>
            <span className="font-mono font-medium text-red-600">-{formatCurrency(custoTotalCarrego)}</span>
          </div>
          <div className="h-px bg-border my-2" />
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">Permuta Líquida</span>
              <GlossaryTooltip term="permuta" />
            </div>
            <span className="font-mono font-medium">{formatCurrency(permutaLiquida)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">+ Dinheiro</span>
            <span className="font-mono font-medium">{formatCurrency(valorDinheiro)}</span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="text-sm font-medium mb-3">Timeline</h4>
        <div className="flex items-center gap-2 text-xs">
          <div className="flex-1 bg-amber-500/20 rounded-full px-3 py-1 text-center">
            <span className="font-medium">Aprovação</span>
            <span className="text-muted-foreground ml-1">{aprovacaoMeses}m</span>
          </div>
          <div className="text-muted-foreground">→</div>
          <div className="flex-1 bg-blue-500/20 rounded-full px-3 py-1 text-center">
            <span className="font-medium">Construção</span>
            <span className="text-muted-foreground ml-1">{construcaoMeses}m</span>
          </div>
          <div className="text-muted-foreground">→</div>
          <div className="flex-1 bg-emerald-500/20 rounded-full px-3 py-1 text-center">
            <span className="font-medium">Venda</span>
            <span className="text-muted-foreground ml-1">{vendaMeses}m</span>
          </div>
        </div>
      </div>

      {/* Veredicto Final */}
      <div className={cn(
        "rounded-xl border-2 p-6 text-center",
        isParceriaBetter 
          ? "border-blue-500/50 bg-blue-500/10"
          : "border-emerald-500/50 bg-emerald-500/10"
      )}>
        <p className="text-sm text-muted-foreground mb-1">Melhor Opção</p>
        <p className={cn(
          "text-2xl font-bold",
          isParceriaBetter ? "text-blue-600" : "text-emerald-600"
        )}>
          {isParceriaBetter ? 'PARCERIA' : 'VENDA À VISTA'}
        </p>
        <p className={cn(
          "text-sm font-medium mt-1",
          diferenca >= 0 ? "text-emerald-600" : "text-red-600"
        )}>
          {diferenca >= 0 ? '+' : ''}{formatCurrency(Math.abs(diferenca))} ({diferencaPercent.toFixed(1)}%)
        </p>
      </div>
    </div>
  );
}
